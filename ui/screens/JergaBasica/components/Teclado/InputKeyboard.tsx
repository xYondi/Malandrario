import React, { useMemo, useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import AnswerSlots from './components/AnswerSlots';
import KeyboardPanel from './components/KeyboardPanel';

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
const screenWidth = Dimensions.get('window').width;

interface InputKeyboardProps {
  answer: string;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  accessoryRight?: React.ReactNode;
  onInputChange?: () => void;
}

export interface InputKeyboardRef {
  revealOneLetter: () => void;
  removeWrongLetters: () => void;
  revealAll: () => void;
  submit: () => void;
}

const InputKeyboard = forwardRef<InputKeyboardRef, InputKeyboardProps>(({ 
  answer, 
  onSubmit, 
  disabled, 
  accessoryRight, 
  onInputChange 
}, ref) => {
  const normalizedAnswer = useMemo(() => answer.replace(/\s+/g, ' ').trim(), [answer]);
  const slots = useMemo(() => normalizedAnswer.split(''), [normalizedAnswer]);
  const [filled, setFilled] = useState<string[]>(Array(slots.length).fill(''));
  const horizontalPadding = 32;
  
  // Estados del teclado
  const [disabledLetters, setDisabledLetters] = useState<Set<string>>(new Set());
  const keyAnimations = useRef<{[key: string]: Animated.Value}>({});
  const [showResult, setShowResult] = useState<'correct' | 'incorrect' | null>(null);
  const resultAnim = useRef(new Animated.Value(0)).current;
  const [letterAnimations, setLetterAnimations] = useState<{[key: number]: Animated.Value}>({});
  const [removingLetter, setRemovingLetter] = useState<{index: number, anim: Animated.Value} | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [slotScaleAnimations, setSlotScaleAnimations] = useState<{[key: number]: Animated.Value}>({});
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Calcular distribución de slots
  const gap = 3;
  const maxPerLineWidth = screenWidth - horizontalPadding;
  
  const slotDistribution = useMemo(() => {
    const totalSlots = slots.length;
    const minSlotSize = 20;
    const maxPossiblePerRow = Math.floor((maxPerLineWidth + gap) / (minSlotSize + gap));
    const actualMaxPerRow = Math.min(maxPossiblePerRow, 12);
    
    if (totalSlots <= actualMaxPerRow) {
      return { rows: 1, maxPerRow: totalSlots };
    }
    
    const maxPerRow = Math.ceil(totalSlots / 2);
    return { rows: 2, maxPerRow };
  }, [slots, maxPerLineWidth, gap]);

  const currentIndex = useMemo(() => {
    for (let i = 0; i < slots.length; i++) {
      if (slots[i] === ' ') continue;
      if (!filled[i]) return i;
    }
    return -1;
  }, [filled, slots]);

  const currentValue = useMemo(() => {
    const userLetters = filled.filter((letter, index) => slots[index] !== ' ' && letter).join('');
    return userLetters;
  }, [filled, slots]);

  const normalize = (s: string): string => s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  const isComplete = useMemo(() => {
    for (let i = 0; i < slots.length; i++) {
      if (slots[i] === ' ') continue;
      if (!filled[i]) return false;
    }
    return slots.length > 0;
  }, [filled, slots]);

  // Resetear estado cuando cambia la pregunta
  useEffect(() => {
    setFilled(Array(slots.length).fill(''));
    setHasSubmitted(false);
    setDisabledLetters(new Set());
    
    const newSlotScaleAnimations: {[key: number]: Animated.Value} = {};
    const newLetterAnimations: {[key: number]: Animated.Value} = {};
    
    slots.forEach((_, index) => {
      if (slots[index] !== ' ') {
        newSlotScaleAnimations[index] = new Animated.Value(0);
        newLetterAnimations[index] = new Animated.Value(1);
      }
    });
    
    setSlotScaleAnimations(newSlotScaleAnimations);
    setLetterAnimations(newLetterAnimations);
    
    setTimeout(() => {
      slots.forEach((ch, index) => {
        if (ch !== ' ') {
          setTimeout(() => {
            if (newSlotScaleAnimations[index]) {
              Animated.spring(newSlotScaleAnimations[index], {
                toValue: 1,
                tension: 120,
                friction: 6,
                useNativeDriver: true,
              }).start();
            }
          }, index * 120);
        }
      });
    }, 100);
  }, [answer, slots.length]);

  useEffect(() => { 
    setFilled(Array(slots.length).fill('')); 
    setShowResult(null);
    resultAnim.setValue(0);
    setHasSubmitted(false);
  }, [normalizedAnswer]);

  const handleKey = (key: string) => {
    onInputChange?.();
    
    if (disabled) return;
    if (disabledLetters.has(key)) return;
    
    setHasSubmitted(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animación de tecla presionada
    if (!keyAnimations.current[key]) {
      keyAnimations.current[key] = new Animated.Value(1);
    }
    
    Animated.sequence([
      Animated.timing(keyAnimations.current[key], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(keyAnimations.current[key], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    let insertIndex = -1;
    for (let i = 0; i < slots.length; i++) {
      if (slots[i] === ' ') continue;
      if (!filled[i]) {
        insertIndex = i;
        break;
      }
    }

    if (insertIndex !== -1) {
      const letterAnim = new Animated.Value(0);
      setLetterAnimations(prev => ({ ...prev, [insertIndex]: letterAnim }));
      
      Animated.parallel([
        Animated.timing(letterAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      const next = [...filled];
      next[insertIndex] = key;
      setFilled(next);
    }
  };

  const handleBackspace = () => {
    onInputChange?.();
    
    if (disabled || isAnimating) return;
    
    setHasSubmitted(false);
    
    let removeIndex = -1;
    for (let i = slots.length - 1; i >= 0; i--) {
      if (slots[i] === ' ') continue;
      if (filled[i]) { 
        removeIndex = i; 
        break; 
      }
    }

    if (removeIndex !== -1) {
      const removeAnim = new Animated.Value(1);
      setRemovingLetter({ index: removeIndex, anim: removeAnim });
      setIsAnimating(true);
      
      Animated.parallel([
        Animated.timing(removeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRemovingLetter(null);
        setIsAnimating(false);
        const next = [...filled];
        next[removeIndex] = '';
        setFilled(next);
      });
    }
  };

  const handleClear = () => { 
    if (!disabled) {
      setFilled(Array(slots.length).fill(''));
      setHasSubmitted(false);
    }
  };

  // Auto-submit cuando se completa
  useEffect(() => {
    if (!disabled && isComplete && !hasSubmitted) {
      setHasSubmitted(true);
      
      const answerLetters = answer.replace(/\s+/g, '');
      const isCorrect = normalize(currentValue) === normalize(answerLetters);
      setShowResult(isCorrect ? 'correct' : 'incorrect');
      
      if (isCorrect) {
        slots.forEach((ch, index) => {
          if (ch !== ' ') {
            setTimeout(() => {
              const anim = slotScaleAnimations[index];
              if (anim) {
                anim.setValue(1);
                Animated.sequence([
                  Animated.spring(anim, {
                    toValue: 1.6,
                    tension: 200,
                    friction: 2,
                    useNativeDriver: true,
                  }),
                  Animated.spring(anim, {
                    toValue: 1.3,
                    tension: 220,
                    friction: 4,
                    useNativeDriver: true,
                  }),
                  Animated.spring(anim, {
                    toValue: 1.15,
                    tension: 240,
                    friction: 6,
                    useNativeDriver: true,
                  }),
                  Animated.spring(anim, {
                    toValue: 1,
                    tension: 120,
                    friction: 10,
                    useNativeDriver: true,
                  }),
                ]).start();
              }
            }, index * 120);
          }
        });
      }
      
      Animated.sequence([
        Animated.timing(resultAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(resultAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onSubmit(currentValue);
      });
    }
  }, [isComplete, currentValue, disabled, answer, resultAnim, hasSubmitted, letterAnimations, slots]);

  // Métodos imperativos
  useImperativeHandle(ref, () => ({
    revealOneLetter: () => {
      if (isComplete) return;
      
      const next = [...filled];
      let revealedIndex = -1;
      
      for (let i = 0; i < slots.length; i++) {
        if (slots[i] === ' ') { 
          next[i] = ' '; 
          continue; 
        }
        if (!next[i]) { 
          next[i] = slots[i].toUpperCase(); 
          revealedIndex = i;
          break; 
        }
      }
      
      if (revealedIndex !== -1) {
        const anim = letterAnimations[revealedIndex];
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
      
      setFilled(next);
      setHasSubmitted(false);
    },
    removeWrongLetters: () => {
      if (isComplete) return;
      
      const targetSet = new Set(slots.map(s => s.toUpperCase()).filter(s => s !== ' '));
      const wrong = ALPHABET.filter(l => !targetSet.has(l));
      
      wrong.forEach((letter, idx) => {
        setTimeout(() => {
          const keyAnim = keyAnimations.current[letter];
          if (keyAnim) {
            Animated.sequence([
              Animated.timing(keyAnim, {
                toValue: 0.8,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(keyAnim, {
                toValue: 0.3,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();
          }
        }, idx * 50);
      });
      
      setDisabledLetters(new Set(wrong));
    },
    revealAll: () => {
      if (isComplete) return;
      
      const newFilled = slots.map(ch => (ch === ' ' ? ' ' : ch.toUpperCase()));
      
      const revealedIndices = [];
      for (let i = 0; i < slots.length; i++) {
        if (slots[i] !== ' ' && !filled[i]) {
          revealedIndices.push(i);
        }
      }
      
      revealedIndices.forEach((index, idx) => {
        setTimeout(() => {
          const anim = letterAnimations[index];
          if (anim) {
            Animated.sequence([
              Animated.timing(anim, {
                toValue: 1.3,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.timing(anim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }),
            ]).start();
          }
        }, idx * 100);
      });
      
      setFilled(newFilled);
      setHasSubmitted(false);
    },
    submit: () => {
      if (!disabled && !hasSubmitted) {
        setHasSubmitted(true);
        
        const correctAnswer = slots.map(ch => (ch === ' ' ? ' ' : ch.toUpperCase()));
        setFilled(correctAnswer);
        
        const allSlots = slots.map((_, index) => index).filter(i => slots[i] !== ' ');
        allSlots.forEach((index, idx) => {
          setTimeout(() => {
            const anim = letterAnimations[index];
            if (anim) {
              Animated.sequence([
                Animated.timing(anim, {
                  toValue: 1.2,
                  duration: 150,
                  useNativeDriver: true,
                }),
                Animated.timing(anim, {
                  toValue: 1,
                  duration: 150,
                  useNativeDriver: true,
                }),
              ]).start();
            }
          }, idx * 50);
        });
        
        setTimeout(() => {
          onSubmit(answer);
        }, allSlots.length * 50 + 300);
      }
    }
  }), [filled, slots, isComplete, disabled, hasSubmitted, currentValue]);

  return (
    <View style={styles.wrapper}>
      <AnswerSlots
        slots={slots}
        filled={filled}
        currentIndex={currentIndex}
        showResult={showResult}
        slotScaleAnimations={slotScaleAnimations}
        letterAnimations={letterAnimations}
        removingLetter={removingLetter}
        slotDistribution={slotDistribution}
      />
      
      <KeyboardPanel
        disabled={disabled}
        disabledLetters={disabledLetters}
        onKeyPress={handleKey}
        onBackspace={handleBackspace}
        onClear={handleClear}
        keyAnimations={keyAnimations}
        accessoryRight={accessoryRight}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { 
    gap: 12, 
    marginBottom: 16, 
    paddingTop: 18 
  },
});

export default InputKeyboard;

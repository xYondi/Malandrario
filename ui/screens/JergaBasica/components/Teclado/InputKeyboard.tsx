import React, { useMemo, useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const keySoundPool = useRef<any[]>([]);
  const currentSoundIndex = useRef<number>(0);
  const [showPistolSpend, setShowPistolSpend] = useState<boolean>(false);
  const pistolSpendAnim = useRef(new Animated.Value(0)).current;

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

  // Función para reproducir sonido de tecla (permite superposición)
  const playKeySound = () => {
    if (keySoundPool.current.length === 0) return;
    
    // Usar el siguiente sonido del pool (round-robin)
    const soundIndex = currentSoundIndex.current;
    const sound = keySoundPool.current[soundIndex];
    currentSoundIndex.current = (currentSoundIndex.current + 1) % keySoundPool.current.length;
    
    if (sound) {
      // Reproducir sin interrumpir otros sonidos
      sound.setPositionAsync(0).then(() => {
        sound.playAsync().catch(() => {
          // Ignorar errores de reproducción
        });
      }).catch(() => {});
    }
  };

  // Función para mostrar animación de gasto de pistolitas
  const showPistolSpendAnimation = () => {
    setShowPistolSpend(true);
    pistolSpendAnim.setValue(0);
    
    Animated.sequence([
      Animated.timing(pistolSpendAnim, {
        toValue: 1,
        duration: 400, // Más rápido
        useNativeDriver: true,
      }),
      Animated.delay(800), // Menos tiempo de pausa
      Animated.timing(pistolSpendAnim, {
        toValue: 0,
        duration: 300, // Más rápido
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPistolSpend(false);
    });
  };


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
                tension: 200,
                friction: 8,
                useNativeDriver: true,
              }).start();
            }
          }, index * 80);
        }
      });
    }, 100);
  }, [answer, slots.length]);

  // Cargar pool de sonidos de tecla al inicializar
  useEffect(() => {
    let isMounted = true;
    const loadKeySoundPool = async () => {
      try {
        const ExpoAV: any = require('expo-av');
        // Configurar modo de audio (iOS silencioso, ducking en Android)
        try {
          await ExpoAV.Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });
        } catch {}
        
        // Crear múltiples instancias del sonido para permitir superposición
        const soundCount = 5; // 5 instancias para permitir escritura muy rápida
        const sounds = [];
        
        for (let i = 0; i < soundCount; i++) {
          try {
            const { sound } = await ExpoAV.Audio.Sound.createAsync(
              require('../../../../../assets/sounds/tecla.wav')
            );
            await sound.setVolumeAsync(0.7);
            sounds.push(sound);
          } catch (e) {
            console.error(`Error cargando sonido ${i}:`, e);
          }
        }
        
        if (isMounted) {
          keySoundPool.current = sounds;
        }
      } catch (e) {
        console.error('Error cargando pool de sonidos de tecla:', e);
        keySoundPool.current = [];
      }
    };
    loadKeySoundPool();
    return () => {
      isMounted = false;
      // Limpiar todos los sonidos del pool
      keySoundPool.current.forEach(sound => {
        try { sound?.unloadAsync(); } catch {}
      });
      keySoundPool.current = [];
    };
  }, []);

  useEffect(() => { 
    setFilled(Array(slots.length).fill('')); 
    setShowResult(null);
    resultAnim.setValue(0);
    setHasSubmitted(false);
    setSelectedIndex(null);
  }, [normalizedAnswer]);

  const handleKey = (key: string) => {
    onInputChange?.();
    
    if (disabled) return;
    if (disabledLetters.has(key)) return;
    
    setHasSubmitted(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Reproducir sonido de tecla
    playKeySound();
    
    // Animación de tecla presionada
    if (!keyAnimations.current[key]) {
      keyAnimations.current[key] = new Animated.Value(1);
    }
    
    Animated.sequence([
      Animated.timing(keyAnimations.current[key], {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(keyAnimations.current[key], {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Priorizar baldosa seleccionada si existe
    let insertIndex = -1;
    if (selectedIndex !== null && slots[selectedIndex] !== ' ') {
      insertIndex = selectedIndex;
    } else {
      // Comportamiento por defecto: primer slot vacío
      for (let i = 0; i < slots.length; i++) {
        if (slots[i] === ' ') continue;
        if (!filled[i]) {
          insertIndex = i;
          break;
        }
      }
    }

    if (insertIndex !== -1) {
      // Si estábamos reemplazando en una baldosa seleccionada, limpiar selección YA
      if (selectedIndex !== null) {
        setSelectedIndex(null);
      }
      const letterAnim = new Animated.Value(0);
      setLetterAnimations(prev => ({ ...prev, [insertIndex]: letterAnim }));
      
      Animated.parallel([
        Animated.timing(letterAnim, {
          toValue: 1,
          duration: 200,
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
    
    // Reproducir sonido de tecla
    playKeySound();
    
    // Si hay una baldosa seleccionada con letra, eliminar esa
    let removeIndex = -1;
    if (selectedIndex !== null && slots[selectedIndex] !== ' ' && filled[selectedIndex]) {
      removeIndex = selectedIndex;
    } else {
      // Comportamiento por defecto: eliminar la última letra ingresada
      for (let i = slots.length - 1; i >= 0; i--) {
        if (slots[i] === ' ') continue;
        if (filled[i]) { 
          removeIndex = i; 
          break; 
        }
      }
    }

    if (removeIndex !== -1) {
      const removeAnim = new Animated.Value(1);
      setRemovingLetter({ index: removeIndex, anim: removeAnim });
      setIsAnimating(true);
      
      Animated.parallel([
        Animated.timing(removeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRemovingLetter(null);
        setIsAnimating(false);
        const next = [...filled];
        next[removeIndex] = '';
        setFilled(next);
        // Mantener selección en el mismo índice; si no había selección, no cambiar nada
      });
    }
  };

  const handleClear = () => { 
    if (disabled || isAnimating) return;
    
    // Reproducir sonido de tecla
    playKeySound();
    
    // Encontrar todas las letras llenas
    const indices: number[] = [];
    for (let i = slots.length - 1; i >= 0; i--) {
      if (slots[i] === ' ') continue;
      if (filled[i]) indices.push(i);
    }
    
    if (indices.length === 0) {
      setHasSubmitted(false);
      setSelectedIndex(null);
      return;
    }
    
    setHasSubmitted(false);
    setSelectedIndex(null);
    setIsAnimating(true);
    
    // Borrar secuencialmente desde el final
    let step = 0;
    const runStep = () => {
      if (step >= indices.length) {
        setIsAnimating(false);
        return;
      }
      
      const idx = indices[step];
      const removeAnim = new Animated.Value(1);
      setRemovingLetter({ index: idx, anim: removeAnim });
      
      Animated.timing(removeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setRemovingLetter(null);
        // Usar actualización funcional para evitar revivir letras por cierres antiguos
        setFilled(prev => {
          const next = [...prev];
          next[idx] = '';
          return next;
        });
        step += 1;
        
        // Continuar con la siguiente letra después de un pequeño delay
        setTimeout(() => {
          runStep();
        }, 30);
      });
    };
    
    runStep();
  };

  // Auto-submit cuando se completa
  useEffect(() => {
    if (!disabled && isComplete && !hasSubmitted) {
      setHasSubmitted(true);
      
      const answerLetters = answer.replace(/\s+/g, '');
      const isCorrect = normalize(currentValue) === normalize(answerLetters);
      setShowResult(isCorrect ? 'correct' : 'incorrect');
      
      if (isCorrect) {
        // El sonido se reproduce en JergaBasicaScreen.tsx cuando recibe la respuesta
        // No reproducir aquí para evitar duplicación
        
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
      
      // Calcular el tiempo total de animación de las baldosas
      const maxSlotDelay = (slots.length - 1) * 120; // Delay máximo de las baldosas
      const slotAnimationDuration = 1600; // Duración aproximada de las 4 animaciones spring
      const totalSlotTime = maxSlotDelay + slotAnimationDuration;
      
      Animated.sequence([
        Animated.timing(resultAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(Math.max(1000, totalSlotTime - 300)), // Asegurar que las baldosas terminen
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
      
      // Mostrar animación de gasto de pistolitas
      showPistolSpendAnimation();
      
      // Reproducir sonido de tecla al inicio del efecto
      playKeySound();
      
      // Animación sutil de ocultación con efecto cascada
      wrong.forEach((letter, idx) => {
        setTimeout(() => {
          const keyAnim = keyAnimations.current[letter];
          if (keyAnim) {
            // Secuencia de animación más suave y elegante
            Animated.sequence([
              // Primero un pequeño "shake" o vibración sutil
              Animated.timing(keyAnim, {
                toValue: 1.05,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.timing(keyAnim, {
                toValue: 0.95,
                duration: 150,
                useNativeDriver: true,
              }),
              // Luego el efecto de desvanecimiento gradual
              Animated.timing(keyAnim, {
                toValue: 0.7,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(keyAnim, {
                toValue: 0.4,
                duration: 200,
                useNativeDriver: true,
              }),
              // Finalmente ocultar completamente
              Animated.timing(keyAnim, {
                toValue: 0.1,
                duration: 250,
                useNativeDriver: true,
              }),
            ]).start();
          }
        }, idx * 80); // Efecto cascada más lento para mejor visibilidad
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
        
        // Activar animaciones de las baldosas (efecto de rebote verde)
        slots.forEach((ch, index) => {
          if (ch !== ' ') {
            setTimeout(() => {
              const anim = slotScaleAnimations[index];
              if (anim) {
                // Resetear la animación y aplicar rebote
                anim.setValue(1);
                
                // Efecto de rebote múltiple como una pelota
                Animated.sequence([
                  // Primer rebote grande
                  Animated.spring(anim, {
                    toValue: 1.6,
                    tension: 200,
                    friction: 2,
                    useNativeDriver: true,
                  }),
                  // Segundo rebote medio
                  Animated.spring(anim, {
                    toValue: 1.3,
                    tension: 220,
                    friction: 4,
                    useNativeDriver: true,
                  }),
                  // Tercer rebote pequeño
                  Animated.spring(anim, {
                    toValue: 1.15,
                    tension: 240,
                    friction: 6,
                    useNativeDriver: true,
                  }),
                  // Retorno final suave
                  Animated.spring(anim, {
                    toValue: 1,
                    tension: 120,
                    friction: 10,
                    useNativeDriver: true,
                  }),
                ]).start();
              }
            }, index * 120); // Efecto cascada en orden secuencial
          }
        });
        
        // Activar animación de resultado (colores)
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
          onSubmit(answer);
        });
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
        selectedIndex={selectedIndex}
        onSelectSlot={(idx: number) => {
          if (disabled || showResult) return;
          setSelectedIndex(idx);
          // Si la baldosa tiene una letra, eliminarla con animación
          if (slots[idx] !== ' ' && filled[idx]) {
            onInputChange?.();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const removeAnim = new Animated.Value(1);
            setRemovingLetter({ index: idx, anim: removeAnim });
            Animated.timing(removeAnim, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }).start(() => {
              setRemovingLetter(null);
              setFilled(prev => {
                const next = [...prev];
                next[idx] = '';
                return next;
              });
            });
          }
        }}
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

      {/* Animación de gasto de pistolitas */}
      {showPistolSpend && (
        <Animated.View
          style={[
            styles.pistolSpendOverlay,
            {
              opacity: pistolSpendAnim,
              transform: [
                {
                  scale: pistolSpendAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.9, 1.05, 1], // Efecto más sutil
                  }),
                },
                {
                  translateY: pistolSpendAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0], // Menos movimiento
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.pistolSpendContainer}>
            <Text style={styles.pistolSpendText}>-50</Text>
            <Text style={styles.pistolSpendLabel}>Pistolitas</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { 
    gap: 12, 
    marginBottom: 16, 
    paddingTop: 18 
  },
  pistolSpendOverlay: {
    position: 'absolute',
    top: 80, // Exactamente donde está el botón del ojo
    left: '50%',
    marginLeft: -45,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pistolSpendContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.85)', // Más sutil
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  pistolSpendText: {
    fontSize: 24, // Más pequeño
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pistolSpendLabel: {
    fontSize: 12, // Más pequeño
    fontWeight: '600',
    color: '#FEF2F2',
    marginTop: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export default InputKeyboard;

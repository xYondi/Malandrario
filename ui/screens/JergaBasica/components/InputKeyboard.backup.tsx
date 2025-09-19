import React, { useMemo, useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
import { colors } from '../../../theme/colors';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Svg, { Path, G } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import GlassView from '../../../../components/GlassView';

// Función para detectar si es iOS 26+ (obligatorio para liquid glass)
const isiOS26Plus = (): boolean => {
  return Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) >= 26;
};

interface InputKeyboardProps {
  answer: string; // respuesta canónica (se usa para longitud y autocompletar espacios)
  onSubmit: (value: string) => void;
  disabled?: boolean;
  accessoryRight?: React.ReactNode; // ej. botón de pista compacto
  onInputChange?: () => void; // callback cuando el usuario modifica su respuesta
}

export interface InputKeyboardRef {
  revealOneLetter: () => void;
  removeWrongLetters: () => void;
  revealAll: () => void;
  submit: () => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

const screenWidth = Dimensions.get('window').width;

const InputKeyboard = forwardRef<InputKeyboardRef, InputKeyboardProps>(({ answer, onSubmit, disabled, accessoryRight, onInputChange }, ref) => {
  // Detectar si usar liquid glass (obligatorio para iOS 26+)
  const useLiquidGlass = isiOS26Plus();
  
  const normalizedAnswer: string = useMemo(() => answer.replace(/\s+/g, ' ').trim(), [answer]);
  const slots: string[] = useMemo(() => normalizedAnswer.split(''), [normalizedAnswer]);
  const [filled, setFilled] = useState<string[]>(Array(slots.length).fill(''));
  const horizontalPadding: number = 32; // margen aproximado de la pantalla
  
  // Resetear estado cuando cambia la pregunta
  useEffect(() => {
    setFilled(Array(slots.length).fill(''));
    setHasSubmitted(false);
    // CRÍTICO: Resetear letras deshabilitadas entre preguntas
    setDisabledLetters(new Set());
    
    // Inicializar animaciones para cada baldosa
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
    
    // Animar aparición de baldosas inmediatamente, sin esperar otras animaciones
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
          }, index * 120); // Aparición escalonada cada 120ms en orden secuencial
        }
      });
    }, 100); // Empezar casi inmediatamente
  }, [answer, slots.length]);
  const gap: number = 3;
  const maxPerLineWidth: number = screenWidth - horizontalPadding;
  
  // Calcular distribución inteligente de baldosas
  const slotDistribution = useMemo(() => {
    const totalSlots = slots.length;
    
    // Calcular cuántas baldosas pueden caber en una fila basado en el ancho disponible
    const minSlotSize = 20; // Tamaño mínimo más pequeño para permitir más baldosas
    
    // Calcular máximo número de baldosas que caben en una fila con tamaño mínimo
    const maxPossiblePerRow = Math.floor((maxPerLineWidth + gap) / (minSlotSize + gap));
    
    // Ser más generoso: permitir hasta 12 baldosas en una fila si caben físicamente
    const actualMaxPerRow = Math.min(maxPossiblePerRow, 12);
    
    // Si todas las baldosas caben en una fila, usar una fila
    if (totalSlots <= actualMaxPerRow) {
      return { rows: 1, maxPerRow: totalSlots };
    }
    
    // Si no caben todas, distribuir en 2 filas
    const maxPerRow = Math.ceil(totalSlots / 2);
    return { rows: 2, maxPerRow };
  }, [slots, maxPerLineWidth, gap]);
  
  const computedSlotSize: number = useMemo(() => {
    const target = Math.floor((maxPerLineWidth - gap * (slotDistribution.maxPerRow - 1)) / Math.max(slotDistribution.maxPerRow, 1));
    // límites para que no sean demasiado pequeños o grandes
    return Math.max(20, Math.min(38, target));
  }, [slotDistribution.maxPerRow, maxPerLineWidth, gap]);
  const [disabledLetters, setDisabledLetters] = useState<Set<string>>(new Set());
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [flyingLetter, setFlyingLetter] = useState<{key: string, anim: Animated.Value} | null>(null);
  const keyAnimations = useRef<{[key: string]: Animated.Value}>({});
  const [showResult, setShowResult] = useState<'correct' | 'incorrect' | null>(null);
  
  const resultAnim = useRef(new Animated.Value(0)).current;
  const [letterAnimations, setLetterAnimations] = useState<{[key: number]: Animated.Value}>({});
  const [removingLetter, setRemovingLetter] = useState<{index: number, anim: Animated.Value} | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [slotScaleAnimations, setSlotScaleAnimations] = useState<{[key: number]: Animated.Value}>({});
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  // Tamaño de teclas para asegurar máximo 3 líneas y sin wrap
  // Distribución QWERTY con Ñ como en el ejemplo
  const rows = useMemo(
    () => [
      ['Q','W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L','Ñ'],
      ['Z','X','C','V','B','N','M'],
    ],
    []
  );
  const maxCols = useMemo(() => Math.max(rows[0].length, rows[1].length, rows[2].length + 3), [rows]);
  const kbAvailable = screenWidth - (horizontalPadding + 16);
  const kbGap = 2;
  const keySize = useMemo(() => {
    const size = Math.floor((kbAvailable - kbGap * (maxCols - 1)) / maxCols);
    return Math.max(36, Math.min(48, size));
  }, [kbAvailable, maxCols]);
  const keyHeight = useMemo(() => Math.floor(keySize * 1.08), [keySize]);
  const submitWidth = keySize + Math.floor(keySize * 0.35); // ya no se usa como tecla, se valida fuera
  const backSize = keySize;
  const backHeight = keyHeight;
  const clearSize = keySize;
  const currentIndex: number = useMemo(() => {
    for (let i = 0; i < slots.length; i++) {
      if (slots[i] === ' ') continue;
      if (!filled[i]) return i;
    }
    return -1;
  }, [filled, slots]);


  useEffect(() => { 
    setFilled(Array(slots.length).fill('')); 
    setShowResult(null);
    resultAnim.setValue(0);
    setHasSubmitted(false);
  }, [normalizedAnswer]);

  const handleKey = (key: string) => {
    // Siempre permitir resetear feedback
    onInputChange?.();
    
    if (disabled) return;
    if (disabledLetters.has(key)) return;
    
    // Resetear estado de envío para permitir nueva validación automática
    setHasSubmitted(false);
    
    // Feedback háptico y visual
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

    // Encontrar el índice donde se va a insertar la letra (solo en slots de letras, no espacios)
    let insertIndex = -1;
    for (let i = 0; i < slots.length; i++) {
      if (slots[i] === ' ') {
        // Los espacios se manejan automáticamente en currentValue, no necesitamos llenarlos aquí
        continue;
      }
      if (!filled[i]) {
        insertIndex = i;
        break;
      }
    }

    if (insertIndex !== -1) {
      // Crear animación de entrada para la letra
      const letterAnim = new Animated.Value(0);
      setLetterAnimations(prev => ({ ...prev, [insertIndex]: letterAnim }));
      
      // Animación de entrada: escala desde 0, rotación y desvanecimiento
      Animated.parallel([
        Animated.timing(letterAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Actualizar el estado
      const next = [...filled];
      next[insertIndex] = key;
      setFilled(next);
    }
  };

  const handleBackspace = () => {
    // Siempre permitir resetear feedback, incluso si está disabled
    onInputChange?.();
    
    // Si está disabled o animating, solo resetear feedback pero no modificar respuesta
    if (disabled || isAnimating) {
      return;
    }
    
    // Resetear estado de envío para permitir nueva validación automática
    setHasSubmitted(false);
    
    // Encontrar la última letra para animar su salida (saltando espacios)
    let removeIndex = -1;
    for (let i = slots.length - 1; i >= 0; i--) {
      if (slots[i] === ' ') {
        // Los espacios se manejan automáticamente, no necesitamos eliminarlos manualmente
        continue;
      }
      if (filled[i]) { 
        removeIndex = i; 
        break; 
      }
    }

    if (removeIndex !== -1) {
      // Crear animación de salida
      const removeAnim = new Animated.Value(1);
      setRemovingLetter({ index: removeIndex, anim: removeAnim });
      setIsAnimating(true);
      
      // Animación de salida: escala a 0, rotación y desvanecimiento
      Animated.parallel([
        Animated.timing(removeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRemovingLetter(null);
        setIsAnimating(false);
        // Actualizar el estado después de la animación
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

  const currentValue: string = useMemo(() => {
    // Solo tomar las letras que el usuario escribió, ignorando los espacios automáticos
    const userLetters = filled.filter((letter, index) => slots[index] !== ' ' && letter).join('');
    return userLetters;
  }, [filled, slots]);
  
  const normalize = (s: string): string => s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Detectar cuando todos los huecos (no espacios) están completos y validar automáticamente
  const isComplete: boolean = useMemo(() => {
    for (let i = 0; i < slots.length; i++) {
      if (slots[i] === ' ') continue;
      if (!filled[i]) return false;
    }
    return slots.length > 0;
  }, [filled, slots]);

  useEffect(() => {
    if (!disabled && isComplete && !hasSubmitted) {
      // Marcar como enviado para evitar múltiples envíos
      setHasSubmitted(true);
      
      // Validar respuesta - comparar solo las letras sin espacios
      const answerLetters = answer.replace(/\s+/g, '');
      const isCorrect = normalize(currentValue) === normalize(answerLetters);
      setShowResult(isCorrect ? 'correct' : 'incorrect');
      
      if (isCorrect) {
        // Animación especial de éxito: baldosas rebotan dramáticamente una por una
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
      }
      
      // Animación de resultado (colores)
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

  // Hint helpers
  useImperativeHandle(ref, () => ({
    revealOneLetter: () => {
      // Solo revelar una letra si no está completa la respuesta
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
      
      // Animación de revelación
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
      // Resetear el estado de envío para evitar auto-submit
      setHasSubmitted(false);
    },
    removeWrongLetters: () => {
      // Solo remover letras incorrectas si no está completa la respuesta
      if (isComplete) return;
      
      const targetSet = new Set(slots.map(s => s.toUpperCase()).filter(s => s !== ' '));
      const wrong = ALPHABET.filter(l => !targetSet.has(l));
      
      // Animación de "barrido" para las letras incorrectas
      const wrongKeys = wrong.map(letter => 
        ALPHABET.indexOf(letter)
      ).filter(index => index !== -1);
      
      // Animar cada tecla incorrecta con un efecto de "desvanecimiento" usando React Native
      wrong.forEach((letter, idx) => {
        setTimeout(() => {
          // Usar el sistema de animaciones de React Native
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
        }, idx * 50); // Efecto cascada
      });
      
      setDisabledLetters(new Set(wrong));
    },
    revealAll: () => {
      // Solo revelar todo si no está completa la respuesta
      if (isComplete) return;
      
      const newFilled = slots.map(ch => (ch === ' ' ? ' ' : ch.toUpperCase()));
      
      // Animación de revelación para todas las letras
      const revealedIndices = [];
      for (let i = 0; i < slots.length; i++) {
        if (slots[i] !== ' ' && !filled[i]) {
          revealedIndices.push(i);
        }
      }
      
      // Animar cada letra revelada con un efecto cascada
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
        }, idx * 100); // Efecto cascada más lento
      });
      
      setFilled(newFilled);
      // Resetear el estado de envío para evitar auto-submit
      setHasSubmitted(false);
    },
    submit: () => {
      // Solo permitir submit manual si no está deshabilitado y no se ha enviado ya
      if (!disabled && !hasSubmitted) {
        setHasSubmitted(true);
        
        // Rellenar todas las baldosas con la respuesta correcta
        const correctAnswer = slots.map(ch => (ch === ' ' ? ' ' : ch.toUpperCase()));
        setFilled(correctAnswer);
        
        // Animación de "rellenado" para todas las baldosas
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
          }, idx * 50); // Efecto cascada
        });
        
        // Enviar la respuesta correcta después de la animación
        setTimeout(() => {
          onSubmit(answer);
        }, allSlots.length * 50 + 300); // Esperar a que termine la animación
      }
    }
  }), [filled, slots, isComplete, disabled, hasSubmitted, currentValue]);

  // Dividir slots en filas según la distribución calculada
  const slotRows = useMemo(() => {
    if (slotDistribution.rows === 1) {
      return [slots];
    }
    
    // Dividir en 2 filas
    const midPoint = Math.ceil(slots.length / 2);
    return [slots.slice(0, midPoint), slots.slice(midPoint)];
  }, [slots, slotDistribution.rows]);

  return (
    <View style={styles.wrapper}>
      {/* Slots distribuidos en filas */}
      <View style={styles.slotsContainer}>
        {slotRows.map((row, rowIndex) => (
          <View key={`slot-row-${rowIndex}`} style={[styles.slotsRow, { gap, flexWrap: 'nowrap' }]}>
            {row.map((ch, idx) => {
              const globalIdx = slotDistribution.rows === 1 ? idx : (rowIndex * Math.ceil(slots.length / 2)) + idx;
              const letterAnim = letterAnimations[globalIdx];
              const isRemoving = removingLetter?.index === globalIdx;
              const removeAnim = removingLetter?.anim;
              
              // No renderizar baldosas para espacios
              if (ch === ' ') {
                return <View key={`space-${globalIdx}`} style={{ width: computedSlotSize / 3 }} />;
              }
              
              const scaleAnim = slotScaleAnimations[globalIdx];
              const celebrationAnim = letterAnimations[globalIdx];
              
              return (
                <Animated.View
                  key={`slot-${globalIdx}`}
                  style={[
                    styles.slot,
                    { width: computedSlotSize, height: computedSlotSize + 8 },
                    globalIdx === currentIndex && !showResult && styles.slotActive,
                    !!filled[globalIdx] && !showResult && styles.slotFilled,
                    // Estados de resultado con animación
                    showResult === 'correct' && styles.slotCorrect,
                    showResult === 'incorrect' && styles.slotIncorrect,
                    {
                      opacity: scaleAnim || 1,
                      transform: [
                        {
                          scale: scaleAnim ? scaleAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0, 1.2, 1],
                          }) : 1,
                        },
                        {
                          translateY: scaleAnim ? scaleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                          }) : 0,
                        },
                        {
                          rotateY: scaleAnim ? scaleAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: ['90deg', '45deg', '0deg'],
                          }) : '0deg',
                        },
                      ],
                    },
                  ]}
                >
                  {ch !== ' ' && (
                    <Animated.View
                      style={[
                        styles.letterContainer,
                        letterAnim && {
                          transform: [
                            {
                              scale: letterAnim.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0, 1.2, 1],
                              }),
                            },
                            {
                              rotate: letterAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['180deg', '0deg'],
                              }),
                            },
                          ],
                          opacity: letterAnim,
                        },
                        isRemoving && removeAnim && {
                          transform: [
                            {
                              scale: removeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1],
                              }),
                            },
                            {
                              rotate: removeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '-180deg'],
                              }),
                            },
                          ],
                          opacity: removeAnim,
                        },
                      ]}
                    >
                      <Text style={[
                        styles.slotText, 
                        globalIdx === currentIndex && !showResult && styles.slotTextActive,
                        showResult === 'correct' && styles.slotTextCorrect,
                        showResult === 'incorrect' && styles.slotTextIncorrect,
                      ]}>
                        {filled[globalIdx] || ''}
                      </Text>
                    </Animated.View>
                  )}
                </Animated.View>
              );
            })}
          </View>
        ))}
      </View>


      {/* Keyboard panel */}
      <View style={styles.kbPanel}>
        {/* Keyboard rows */}
        <View style={styles.kb}>
        <View style={styles.kbHeader}>{accessoryRight}</View>
        {rows.map((row, r) => (
          <View key={`row-${r}`} style={[styles.kbRow, r === 1 && { paddingHorizontal: 0 }] }>
            {r === 2 && (
              <View style={{ width: keySize }} />
            )}
            {row.map((k) => (
              <Animated.View
                key={k}
                style={[
                  { transform: [{ scale: keyAnimations.current[k] || 1 }] }
                ]}
              >
                <TouchableOpacity
                  style={[
                    useLiquidGlass ? styles.keyLiquidGlass : styles.key,
                    { width: keySize, height: keyHeight },
                    disabledLetters.has(k) && (useLiquidGlass ? styles.keyDisabledLiquidGlass : styles.keyDisabled),
                    pressedKey === k && (useLiquidGlass ? styles.keyPressedLiquidGlass : styles.keyPressed),
                  ]}
                  onPress={() => handleKey(k)}
                  onPressIn={() => setPressedKey(k)}
                  onPressOut={() => setPressedKey(null)}
                  disabled={disabled || disabledLetters.has(k)}
                >
                  {useLiquidGlass && (
                    <GlassView 
                      style={styles.keyGlassBackground}
                      glassEffectStyle="clear"
                      isInteractive={true}
                      tintColor="rgba(255, 255, 255, 0.12)"
                    />
                  )}
                  <Text style={[
                    useLiquidGlass ? styles.keyTextLiquidGlass : styles.keyText, 
                    disabledLetters.has(k) && styles.keyTextDisabled
                  ]}>{k}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
            {r === 2 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: kbGap, gap: kbGap }}>
                <TouchableOpacity
                  style={[
                    useLiquidGlass ? styles.backKeyLiquidGlass : styles.backKey, 
                    { width: backSize, height: backHeight, borderRadius: 10 }, 
                    pressedKey === 'BACK' && (useLiquidGlass ? styles.roundKeyPressedLiquidGlass : styles.roundKeyPressed)
                  ]}
                  onPress={handleBackspace}
                  onPressIn={() => setPressedKey('BACK')}
                  onPressOut={() => setPressedKey(null)}
                  disabled={disabled}
                >
                  {useLiquidGlass && (
                    <GlassView 
                      style={styles.specialKeyGlassBackground}
                      glassEffectStyle="clear"
                      isInteractive={true}
                      tintColor="rgba(255, 255, 255, 0.12)"
                    />
                  )}
                  <Svg viewBox="0 -5 32 32" width={Math.floor(backSize * 0.56)} height={Math.floor(backHeight * 0.56)}>
                    <G transform="translate(-518  -1146)" fill="#FFFFFF">
                      <Path d="M540.647,1159.24 C541.039,1159.63 541.039,1160.27 540.647,1160.66 C540.257,1161.05 539.623,1161.05 539.232,1160.66 L536.993,1158.42 L534.725,1160.69 C534.331,1161.08 533.692,1161.08 533.298,1160.69 C532.904,1160.29 532.904,1159.65 533.298,1159.26 L535.566,1156.99 L533.327,1154.76 C532.936,1154.37 532.936,1153.73 533.327,1153.34 C533.718,1152.95 534.352,1152.95 534.742,1153.34 L536.981,1155.58 L539.281,1153.28 C539.676,1152.89 540.314,1152.89 540.708,1153.28 C541.103,1153.68 541.103,1154.31 540.708,1154.71 L538.408,1157.01 L540.647,1159.24 L540.647,1159.24 Z M545.996,1146 L528.051,1146 C527.771,1145.98 527.485,1146.07 527.271,1146.28 L518.285,1156.22 C518.074,1156.43 517.983,1156.71 517.998,1156.98 C517.983,1157.26 518.074,1157.54 518.285,1157.75 L527.271,1167.69 C527.467,1167.88 527.723,1167.98 527.979,1167.98 L527.979,1168 L545.996,1168 C548.207,1168 550,1166.21 550,1164 L550,1150 C550,1147.79 548.207,1146 545.996,1146 L545.996,1146 Z"/>
                    </G>
                  </Svg>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    useLiquidGlass ? styles.clearKeyLiquidGlass : styles.clearKey, 
                    { width: keySize, height: keyHeight }, 
                    pressedKey === 'CLEAR' && (useLiquidGlass ? styles.keyPressedLiquidGlass : styles.keyPressed)
                  ]}
                  onPress={handleClear}
                  onPressIn={() => setPressedKey('CLEAR')}
                  onPressOut={() => setPressedKey(null)}
                  disabled={disabled}
                >
                  {useLiquidGlass && (
                    <GlassView 
                      style={styles.specialKeyGlassBackground}
                      glassEffectStyle="clear"
                      isInteractive={true}
                      tintColor="rgba(255, 255, 255, 0.12)"
                    />
                  )}
                  <Icon name="trash-can-outline" size={Math.floor(keySize * 0.42)} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: 12, marginBottom: 16, paddingTop: 18 },
  slotsContainer: { alignItems: 'center', gap: 8 },
  slotsRow: { flexDirection: 'row', flexWrap: 'nowrap', gap: 3, justifyContent: 'center', alignItems: 'center' },
  slot: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra 3D igual a las teclas
    shadowColor: '#9FB7DA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  slotActive: { 
    borderColor: '#3B82F6', 
    shadowColor: '#3B82F6', 
    backgroundColor: '#3B82F6',
    // Sombra 3D igual a las teclas
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  slotFilled: { 
    backgroundColor: '#FFFFFF', 
    borderColor: '#E2E8F0',
    // Sombra 3D igual a las teclas
    shadowColor: '#9FB7DA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  slotSpace: { backgroundColor: 'transparent', borderColor: 'transparent' },
  slotCorrect: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  slotIncorrect: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  slotText: { fontWeight: '900', color: '#1E293B', fontSize: 18 },
  slotTextActive: { color: '#FFFFFF' },
  slotTextCorrect: { color: '#FFFFFF' },
  slotTextIncorrect: { color: '#FFFFFF' },
  kb: { gap: 12 },
  kbPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 14,
    paddingBottom: 72,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 3,
    marginTop: 26,
    // Extiende el fondo blanco hacia abajo sin mover el contenido
    marginBottom: -78,
  },
  kbHeader: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, marginBottom: 12, width: '100%' },
  kbRow: { flexDirection: 'row', gap: 2, justifyContent: 'center', alignItems: 'center' },
  utilBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 10, paddingHorizontal: 8 },
  key: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D7E3F4',
    shadowColor: '#9FB7DA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  keyText: { fontWeight: '900', color: '#2E6CA8', fontSize: 22, letterSpacing: 0.2 },
  keyPressed: { 
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  keyDisabled: { backgroundColor: '#E5E7EB' },
  keyTextDisabled: { color: '#9CA3AF' },
  roundKeyPressed: { 
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  roundKey: { 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E40AF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backKey: { backgroundColor: '#235B93', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, shadowColor: '#163C62', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 0 },
  backKeyInner: { display: 'none' },
  deleteBody: { display: 'none' },
  deleteArrow: { display: 'none' },
  deleteX: { display: 'none' },
  clearKey: { 
    backgroundColor: '#D95D75', 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 2,
    borderColor: '#C94B63',
    shadowColor: '#B04257',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  letterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  
  // Estilos Liquid Glass para iOS 26+
  keyLiquidGlass: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Fondo blanco con opacidad reducida
    borderWidth: 2,
    borderColor: '#D7E3F4',
    shadowColor: '#9FB7DA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  keyTextLiquidGlass: {
    fontWeight: '900',
    color: '#2E6CA8',
    fontSize: 22,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  keyPressedLiquidGlass: {
    transform: [{ scale: 0.95 }],
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Más opaco al presionar
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  keyDisabledLiquidGlass: {
    backgroundColor: 'rgba(229, 231, 235, 0.4)', // Fondo gris con opacidad
    borderColor: 'rgba(156, 163, 175, 0.5)',
  },
  keyGlassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
  backKeyLiquidGlass: {
    backgroundColor: 'rgba(35, 91, 147, 0.7)', // Azul con opacidad reducida
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 12,
    shadowColor: '#163C62',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 0,
  },
  clearKeyLiquidGlass: {
    backgroundColor: 'rgba(217, 93, 117, 0.7)', // Rosa con opacidad reducida
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#C94B63',
    shadowColor: '#B04257',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  roundKeyPressedLiquidGlass: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  specialKeyGlassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
});

export default InputKeyboard;



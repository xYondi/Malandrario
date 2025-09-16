import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import HudBar from './components/HudBar';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import QuestionCard from './components/QuestionCard';
import OptionsList, { OptionItem } from './components/OptionsList';
import HintButton from './components/HintButton';
import { VictoryModal, DefeatModal } from './components/Modals';
import SuccessOverlay from './components/SuccessOverlay';
import InputKeyboard, { InputKeyboardRef } from './components/InputKeyboard';
import InputActionsRow from './components/InputActionsRow';

import { QUESTIONS_LEVEL_1, Question } from './data/questions';

export const JergaBasicaScreen: React.FC = () => {
  const navigation = useNavigation();
  // Estados del juego
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [vidas, setVidas] = useState<number>(3);
  const [metras, setMetras] = useState<number>(5);
  const [streak, setStreak] = useState<number>(0);
  const [nivel, setNivel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [disabledOptions, setDisabledOptions] = useState<boolean>(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<number>>(new Set());
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [showDefeatModal, setShowDefeatModal] = useState<boolean>(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const optionAnimations = useRef<Animated.Value[]>([]).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const questionCardAnim = useRef(new Animated.Value(0)).current;
  const optionsContainerAnim = useRef(new Animated.Value(0)).current;
  const hudAnim = useRef(new Animated.Value(0)).current;
  const victoryAnim = useRef(new Animated.Value(0)).current;
  const defeatAnim = useRef(new Animated.Value(0)).current;
  const titleGradientAnim = useRef(new Animated.Value(0)).current;
  const lastQuestionCueAnim = useRef(new Animated.Value(0)).current;
  const successBurstAnim = useRef(new Animated.Value(0)).current;
  const [showSuccessOverlay, setShowSuccessOverlay] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const kbRef = useRef<InputKeyboardRef>(null);

  const questions = QUESTIONS_LEVEL_1;

  // Timeout de seguridad por si onLoad no se dispara
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (!imageLoaded) {
        setImageLoaded(true);
      }
    }, 5000); // 5 segundos de timeout de seguridad

    return () => clearTimeout(safetyTimeout);
  }, [imageLoaded]);

  const normalize = (s: string): string => s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  useEffect(() => {
    // Animación de entrada más dramática y coordinada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(hudAnim, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(questionCardAnim, {
        toValue: 1,
        duration: 700,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(optionsContainerAnim, {
        toValue: 1,
        duration: 800,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Degradado del título en movimiento continuo
    const loopGradient = Animated.loop(
      Animated.sequence([
        Animated.timing(titleGradientAnim, {
          toValue: 1,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.timing(titleGradientAnim, {
          toValue: 0,
          duration: 2800,
          useNativeDriver: true,
        })
      ])
    );
    loopGradient.start();

    return () => {
      try {
        loopGradient.stop();
      } catch (error) {
        // Ignorar errores de stopTracking
        console.warn('Animation stop error:', error);
      }
    };
  }, []);

  useEffect(() => {
    // Actualizar progreso basado en preguntas respondidas
    const progressPercentage = (currentQuestion / questions.length) * 100;
    
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Animación de transición entre preguntas
    if (currentQuestion > 0) {
      questionCardAnim.setValue(0);
      optionsContainerAnim.setValue(0);
      
      Animated.parallel([
        Animated.timing(questionCardAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(optionsContainerAnim, {
          toValue: 1,
          duration: 500,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentQuestion, questions.length]);

  // Cue especial al llegar a la última pregunta (persistente mientras sea la última)
  const lastCueLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  useEffect(() => {
    const isLast: boolean = currentQuestion === questions.length - 1;
    if (isLast) {
      lastQuestionCueAnim.setValue(0);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(lastQuestionCueAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(lastQuestionCueAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      lastCueLoopRef.current = loop;
      loop.start();
    } else {
      try {
        lastCueLoopRef.current?.stop?.();
      } catch (error) {
        console.warn('Animation stop error:', error);
      }
      lastQuestionCueAnim.setValue(0);
    }
    return () => {
      try {
        lastCueLoopRef.current?.stop?.();
      } catch (error) {
        console.warn('Animation stop error:', error);
      }
    };
  }, [currentQuestion, questions.length, lastQuestionCueAnim]);


  const handleAnswer = (answer: string, index: number) => {
    if (disabledOptions || (index >= 0 && eliminatedOptions.has(index))) return;

    setSelectedAnswer(answer);
    setDisabledOptions(true);
    
    const question = questions[currentQuestion];
    const answerLetters = answer.replace(/\s+/g, '');
    const questionLetters = question.a.replace(/\s+/g, '');
    const correct = normalize(answerLetters) === normalize(questionLetters) ||
      (Array.isArray(question.accepted) && question.accepted.some(a => normalize(answerLetters) === normalize(a.replace(/\s+/g, ''))));

    // Feedback háptico diferenciado
    if (correct) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    // Actualizar progreso inmediatamente al responder
    const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Animación de feedback mejorada
    Animated.timing(feedbackAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    if (correct) {
      setScore(score + 1);
      setStreak(streak + 1);
      
      // Efecto de acierto más dramático
      if (index >= 0 && optionAnimations[index]) {
        Animated.sequence([
          Animated.timing(optionAnimations[index], {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(optionAnimations[index], {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Animación de celebración para streak
      if (streak >= 2) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else {
      setStreak(0);
      setVidas(vidas - 1);
      
      // Efecto de error más pronunciado
      if (index >= 0 && optionAnimations[index]) {
        Animated.sequence([
          Animated.timing(optionAnimations[index], {
            toValue: 0.9,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(optionAnimations[index], {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      setDisabledOptions(false);
      setEliminatedOptions(new Set());
      feedbackAnim.setValue(0);
      
      if (currentQuestion + 1 >= questions.length) {
        // Última pregunta: solo victoria si fue correcto
        if (correct) {
          // Animación especial de éxito antes del modal
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setShowSuccessOverlay(true);
          successBurstAnim.setValue(0);
          Animated.timing(successBurstAnim, {
            toValue: 1,
            duration: 1400,
            useNativeDriver: true,
          }).start(() => {
            Animated.timing(victoryAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }).start();
            setShowSuccessOverlay(false);
            setShowVictoryModal(true);
          });
        } else {
          // Si falló la última, solo avanzar a modal de derrota si sin vidas, o quedarse en estado final
          if (vidas - 1 <= 0) {
            // derrota ya la maneja el efecto de vidas
          } else {
            // feedback pero sin modal de victoria
          }
        }
      } else {
        // Avanzar solo si fue correcta; si no, repetir la misma pregunta
        if (correct) {
          setCurrentQuestion(currentQuestion + 1);
        }
      }
    }, 1800);
  };

  const handleHint = () => {
    if (metras < 1) return;

    const question = questions[currentQuestion];
    const availableOptions = (question.choices || [])
      .map((choice, index) => ({ choice, index }))
      .filter((_, index) => !eliminatedOptions.has(index) && (question.choices || [])[index] !== question.a);

    if (availableOptions.length <= 1) return;

    const randomIndex = Math.floor(Math.random() * availableOptions.length);
    const optionToEliminate = availableOptions[randomIndex].index;
    
    setEliminatedOptions(new Set([...eliminatedOptions, optionToEliminate]));
    setMetras(metras - 1);
    
    // Feedback háptico y visual mejorado
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Animación de eliminación de opción
    if (optionAnimations[optionToEliminate]) {
      Animated.sequence([
        Animated.timing(optionAnimations[optionToEliminate], {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(optionAnimations[optionToEliminate], {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setVidas(3);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setDisabledOptions(false);
    setEliminatedOptions(new Set());
    setShowVictoryModal(false);
    setShowDefeatModal(false);
  };

  const continueWithMetras = () => {
    if (metras < 2) {
      setShowDefeatModal(false);
      // Navegar de vuelta al lobby con animación
      goHome();
      return;
    }
    
    setMetras(metras - 2);
    setVidas(1);
    setShowDefeatModal(false);
  };

  const nextLevel = () => {
    setNivel(nivel + 1);
    setMetras(metras + 5);
    setShowVictoryModal(false);
    resetGame();
  };

  const goHome = () => {
    // Animación de salida antes de navegar
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navegar de vuelta al lobby
      navigation.goBack();
    });
  };

  useEffect(() => {
    if (vidas <= 0) {
      // Animación de derrota
      Animated.timing(defeatAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      setShowDefeatModal(true);
    }
  }, [vidas]);

  // Inicializar animaciones de opciones
  useEffect(() => {
    optionAnimations.length = 0;
    for (let i = 0; i < 4; i++) {
      optionAnimations.push(new Animated.Value(1));
    }
  }, [currentQuestion]);

  const currentQ = questions[currentQuestion];
  const progress = (currentQuestion / questions.length) * 100;
  const optionItems: OptionItem[] = (currentQ.choices || []).map((choice, index) => {
    const isSelected: boolean = selectedAnswer === choice;
    const isCorrectAnswer: boolean = choice === currentQ.a;
    const isEliminated: boolean = eliminatedOptions.has(index);
    const showCorrect: boolean = disabledOptions && isCorrectAnswer;
    const showIncorrect: boolean = disabledOptions && isSelected && !isCorrectAnswer;
    return {
      label: choice,
      isEliminated,
      isCorrect: showCorrect,
      isIncorrect: showIncorrect,
    };
  });

  const isInputMode: boolean = currentQ.mode === 'input';
  const onValidateInput = (value: string) => {
    // Reusar handleAnswer con index -1 para indicar input
    handleAnswer(value, -1);
  };

  // Mostrar loading mientras la imagen no esté cargada
  if (!imageLoaded) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <Animated.View 
          style={[
            styles.loadingContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.loadingContent,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })}
                ]
              }
            ]}
          >
            <ActivityIndicator size="large" color="#2E6CA8" />
            <Text style={styles.loadingText}>Cargando...</Text>
            <Text style={styles.loadingSubtext}>Preparando tu aventura</Text>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
        source={require('../../../assets/FONDO2.png')}
        resizeMode="cover"
        style={styles.background}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(true)} // Si falla, mostrar UI de todas formas
      >
        <LinearGradient
          colors={["rgba(255, 248, 225, 0.85)", "rgba(255, 248, 225, 0.95)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.scrim}
        />
        {/* HUD Superior */}
        <HudBar vidas={vidas} streak={streak} metras={metras} onHome={goHome} hudAnim={hudAnim} />

        {/* Contenido Principal */}
        <Animated.View 
          style={[
            styles.contentContainer,
            { 
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Header */}
          <Header
            nivel={nivel}
            currentQuestion={currentQuestion}
            totalQuestions={questions.length}
            titleGradientAnim={titleGradientAnim}
            lastQuestionCueAnim={lastQuestionCueAnim}
          />

          {/* Barra de Progreso */}
          <ProgressBar progressAnim={progressAnim} />

          {/* Tarjeta de Pregunta */}
          <QuestionCard
            question={currentQ.q}
            questionCardAnim={questionCardAnim}
            showFeedback={showFeedback}
            isCorrect={isCorrect}
            feedbackAnim={feedbackAnim}
          />

          {/* Respuesta: opciones o input */}
          {isInputMode ? (
            <View style={{ alignItems: 'center', justifyContent: 'flex-end', width: '100%', marginTop: -6, paddingBottom: 0, flexGrow: 1 }}>
              <InputKeyboard
                answer={currentQ.a}
                onSubmit={onValidateInput}
                disabled={disabledOptions}
                accessoryRight={
                  <InputActionsRow
                    onRevealOne={() => kbRef.current?.revealOneLetter()}
                    onRemoveWrong={() => kbRef.current?.removeWrongLetters()}
                    onCheck={() => kbRef.current?.submit()}
                    costs={{ revealOne: 25, removeWrong: 50, check: 150 }}
                  />
                }
                ref={kbRef}
              />
            </View>
          ) : (
            <Animated.View
              style={{
                opacity: optionsContainerAnim,
                transform: [
                  { translateY: optionsContainerAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
                ],
              }}
            >
              <OptionsList
                options={optionItems}
                optionAnimations={optionAnimations}
                disabledOptions={disabledOptions}
                onPressOption={(idx) => handleAnswer(currentQ.choices![idx], idx)}
              />
            </Animated.View>
          )}

          {/* Botón de Pista */}
          {null}
        </Animated.View>
      </ImageBackground>

      {/* Overlay de éxito especial */}
      <SuccessOverlay visible={showSuccessOverlay} successAnim={successBurstAnim} />

      {/* Modal de Victoria */}
      <VictoryModal visible={showVictoryModal} victoryAnim={victoryAnim} onNextLevel={nextLevel} />

      {/* Modal de Derrota */}
      <DefeatModal visible={showDefeatModal} defeatAnim={defeatAnim} onContinue={continueWithMetras} onExit={goHome} />
    </SafeAreaView>
  );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: '#2E6CA8',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  background: { flex: 1, backgroundColor: 'transparent' },
  scrim: { ...StyleSheet.absoluteFillObject },
  contentContainer: { flex: 1, paddingHorizontal: 16, paddingBottom: 16 },
});

export default JergaBasicaScreen;

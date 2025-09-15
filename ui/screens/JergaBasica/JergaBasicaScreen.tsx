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
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

interface Question {
  q: string;
  choices: string[];
  a: string;
  hint: string;
}

const QUESTIONS_LEVEL_1: Question[] = [
  {
    q: "¿Cómo se dice 'muchacho' o 'muchacha' en la jerga venezolana de barrio?",
    choices: ["Chamín", "Chamo", "Pibe", "Convive"],
    a: "Convive",
    hint: "La palabra empieza con 'Ch'."
  },
  {
    q: "Si un chamo se queda sin trabajo y no tiene ni un bolívar para pagar la renta, ¿en qué situación está?",
    choices: ["En el limbo", "En la cuerda floja", "En la olla", "En el aire"],
    a: "En la olla",
    hint: "Es un dicho que se usa cuando estás en aprietos."
  },
  {
    q: "¿Qué significa 'Echar los perros'?",
    choices: ["Estar con tu perro o pasearlo", "Coquetear o seducir a alguien", "Tener mala suerte", "Regalarle un perro a alguien"],
    a: "Coquetear o seducir a alguien",
    hint: "Esta frase tiene que ver con el romance."
  },
  {
    q: "En la jerga, ¿qué es un 'coroto'?",
    choices: ["Un tipo de comida exótica", "Un animal de la calle", "Un objeto o una cosa cualquiera que no tiene mucho valor", "Una persona muy perezosa"],
    a: "Un objeto o una cosa cualquiera que no tiene mucho valor",
    hint: "Todos tenemos corotos en la casa."
  },
  {
    q: "¿Qué significa 'darle al coco'?",
    choices: ["Golpearse la cabeza", "Pensar o analizar algo intensamente", "Comer un coco", "Darse un golpe"],
    a: "Pensar o analizar algo intensamente",
    hint: "Es algo que todos hacemos cuando estudiamos."
  },
  {
    q: "¿Qué significa 'burda de'?",
    choices: ["Algo muy feo", "Una gran cantidad o mucho", "Una palabra sin sentido", "Algo muy bueno"],
    a: "Una gran cantidad o mucho",
    hint: "Se usa para describir la cantidad de algo."
  },
  {
    q: "En la jerga, ¿qué significa la frase 'Echar una vaina'?",
    choices: ["Tener una discusión o pelear con alguien", "Echar algo en un recipiente", "Hablar de algo sin importancia", "Comer una comida tradicional"],
    a: "Tener una discusión o pelear con alguien",
    hint: "Se usa para describir una acción de conflicto."
  },
  {
    q: "¿Qué significa 'Chevere'?",
    choices: ["Algo viejo o pasado de moda", "Algo muy bueno, genial o de calidad", "Estar cansado", "Estar triste"],
    a: "Algo muy bueno, genial o de calidad",
    hint: "Es un adjetivo para describir algo que te gusta mucho."
  },
  {
    q: "Llegas a la casa y tu vecina te dice: '¡Ponte las pilas que en la esquina se armó un brollo!'. ¿Qué te está avisando?",
    choices: ["Que hay una fiesta con mucha gente", "Que hay un problema, un chisme o un escándalo en la calle", "Que alguien está borracho", "Que hay mucho tráfico"],
    a: "Que hay un problema, un chisme o un escándalo en la calle",
    hint: "Se usa mucho en las telenovelas y en los grupos de WhatsApp."
  },
  {
    q: "Cuando a alguien le llega una gran cantidad de dinero de forma inesperada, ¿qué dirían los panas que le cayó?",
    choices: ["Un maná", "Una guayaba", "Un palo", "Una patilla"],
    a: "Un palo",
    hint: "Es algo que todos quisiéramos que nos caiga."
  }
];

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

  const questions = QUESTIONS_LEVEL_1;

  useEffect(() => {
    // Animación de entrada coordinada y fluida
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(hudAnim, {
        toValue: 1,
        duration: 300,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(questionCardAnim, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(optionsContainerAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
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


  const handleAnswer = (answer: string, index: number) => {
    if (disabledOptions || eliminatedOptions.has(index)) return;

    setSelectedAnswer(answer);
    setDisabledOptions(true);
    
    const question = questions[currentQuestion];
    const correct = answer === question.a;

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
      if (optionAnimations[index]) {
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
      if (optionAnimations[index]) {
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
        // Nivel completado - mostrar modal de victoria
        Animated.timing(victoryAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
        setShowVictoryModal(true);
      } else {
        // Avanzar a la siguiente pregunta
        setCurrentQuestion(currentQuestion + 1);
      }
    }, 1800);
  };

  const handleHint = () => {
    if (metras < 1) return;

    const question = questions[currentQuestion];
    const availableOptions = question.choices
      .map((choice, index) => ({ choice, index }))
      .filter((_, index) => !eliminatedOptions.has(index) && question.choices[index] !== question.a);

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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
        source={require('../../../assets/FONDO2.png')}
        resizeMode="cover"
        style={styles.background}
      >
        <LinearGradient
          colors={["rgba(255, 248, 225, 0.85)", "rgba(255, 248, 225, 0.95)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.scrim}
        />
        {/* HUD Superior */}
        <Animated.View 
          style={[
            styles.hudContainer,
            { 
              opacity: hudAnim,
              transform: [
                { translateY: hudAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0]
                })}
              ]
            }
          ]}
        >
          <TouchableOpacity style={styles.lobbyButton} onPress={goHome}>
            <LinearGradient
              colors={['#FFFFFF', '#FEF3C7']}
              style={styles.lobbyButtonGradient}
            >
              <Ionicons name="home" size={18} color="#0F172A" />
              <Text style={styles.lobbyButtonText}>Lobby</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.hudStats}>
            <View style={styles.statChip}>
              <LinearGradient colors={['#FEF2F2', '#FECACA']} style={styles.statChipGradient}>
                <Ionicons name="heart" size={18} color="#DC2626" />
                <Text style={styles.statText}>{vidas}</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statChip}>
              <LinearGradient colors={['#FFF7ED', '#FED7AA']} style={styles.statChipGradient}>
                <Ionicons name="flame" size={18} color="#F97316" />
                <Text style={styles.statText}>{streak}</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statChip}>
              <LinearGradient colors={['#EFF6FF', '#BFDBFE']} style={styles.statChipGradient}>
                <Ionicons name="diamond" size={18} color="#2563EB" />
                <Text style={styles.statText}>{metras}</Text>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>

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
          <View style={styles.header}>
            <LinearGradient
              colors={[colors.yellowPrimary, colors.white]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.titleGradient}
            >
              <Text style={styles.title}>
                Traduce la Jerga · Nivel {nivel}
              </Text>
            </LinearGradient>
            <Text style={styles.questionCounter}>
              Pregunta {currentQuestion + 1}/{questions.length}
            </Text>
            <Text style={styles.subtitle}>
              Traduce la palabra o frase al "criollísimo".
            </Text>
          </View>

          {/* Barra de Progreso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { 
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    })
                  }
                ]} 
              />
            </View>
          </View>

          {/* Tarjeta de Pregunta */}
          <Animated.View 
            style={[
              styles.questionCard,
              {
                opacity: questionCardAnim,
                transform: [
                  { translateY: questionCardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })},
                  { scale: questionCardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1]
                  })}
                ]
              }
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF', '#FEF3C7']}
              style={styles.questionCardGradient}
            >
              <Text style={styles.questionText}>{currentQ.q}</Text>
              
              {showFeedback && (
                <Animated.View 
                  style={[
                    styles.feedbackContainer,
                    { 
                      opacity: feedbackAnim,
                      transform: [
                        { scale: feedbackAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1]
                        })}
                      ]
                    }
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {isCorrect ? (
                      <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                    ) : (
                      <Ionicons name="close-circle" size={18} color="#DC2626" />
                    )}
                    <Text style={[
                      styles.feedbackText,
                      { color: isCorrect ? '#16A34A' : '#DC2626' }
                    ]}>
                      {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                    </Text>
                  </View>
                </Animated.View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Opciones */}
          <Animated.View 
            style={[
              styles.optionsContainer,
              {
                opacity: optionsContainerAnim,
                transform: [
                  { translateY: optionsContainerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  })}
                ]
              }
            ]}
          >
            {currentQ.choices.map((choice, index) => {
              const isSelected = selectedAnswer === choice;
              const isCorrectAnswer = choice === currentQ.a;
              const isEliminated = eliminatedOptions.has(index);
              const showCorrect = disabledOptions && isCorrectAnswer;
              const showIncorrect = disabledOptions && isSelected && !isCorrectAnswer;

              return (
                <Animated.View
                  key={index}
                  style={[
                    { transform: [{ scale: optionAnimations[index] || 1 }] }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      isEliminated && styles.optionEliminated,
                      showCorrect && styles.optionCorrect,
                      showIncorrect && styles.optionIncorrect,
                    ]}
                    onPress={() => handleAnswer(choice, index)}
                    disabled={disabledOptions || isEliminated}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        isEliminated 
                          ? ['#F3F4F6', '#E5E7EB']
                          : showCorrect
                          ? ['#DCFCE7', '#BBF7D0']
                          : showIncorrect
                          ? ['#FEE2E2', '#FECACA']
                          : ['#FFFFFF', '#FEF3C7']
                      }
                      style={styles.optionGradient}
                    >
                      <View style={styles.optionContent}>
                        <View style={styles.optionKey}>
                          <Text style={[
                            styles.optionKeyText,
                            isEliminated && styles.optionEliminatedText
                          ]}>
                            {String.fromCharCode(65 + index)}
                          </Text>
                        </View>
                        {isEliminated && (
                          <MaterialCommunityIcons name="star-four-points" size={16} color="#9CA3AF" />
                        )}
                        <Text style={[
                          styles.optionText,
                          isEliminated && styles.optionEliminatedText
                        ]}>
                          {choice}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>

          {/* Botón de Pista */}
          <TouchableOpacity 
            style={[
              styles.hintButton,
              metras < 1 && styles.hintButtonDisabled
            ]}
            onPress={handleHint}
            disabled={metras < 1 || eliminatedOptions.size >= 2}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                metras < 1 
                  ? ['#F3F4F6', '#E5E7EB']
                  : ['#FEF3C7', '#FDE68A', '#F59E0B']
              }
              style={styles.hintButtonGradient}
            >
              <Ionicons name="bulb" size={20} color={metras < 1 ? '#9CA3AF' : '#FFFFFF'} />
              <Text style={[
                styles.hintButtonText,
                metras < 1 && styles.hintButtonDisabledText
              ]}>
                Pista
              </Text>
              <View style={[
                styles.hintCost,
                metras < 1 && styles.hintCostDisabled
              ]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={[
                    styles.hintCostText,
                    metras < 1 && styles.hintCostDisabledText
                  ]}>
                    1
                  </Text>
                  <Ionicons name="diamond" size={14} color={metras < 1 ? '#9CA3AF' : '#0F172A'} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ImageBackground>

      {/* Modal de Victoria */}
      {showVictoryModal && (
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: victoryAnim }
          ]}
        >
          <Animated.View 
            style={[
              styles.modal,
              {
                transform: [
                  { scale: victoryAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })},
                  { translateY: victoryAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })}
                ]
              }
            ]}
          >
            <Text style={styles.modalTitle}>¡Nivel completado!</Text>
            <Text style={styles.modalText}>
              Ganaste <Text style={styles.modalHighlight}>5 Metras</Text>. 
              Se desbloquea el siguiente nivel.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={nextLevel}>
              <LinearGradient
                colors={['#FACC15', '#F59E0B']}
                style={styles.modalButtonGradient}
              >
                <Text style={styles.modalButtonText}>Siguiente nivel</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      {/* Modal de Derrota */}
      {showDefeatModal && (
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: defeatAnim }
          ]}
        >
          <Animated.View 
            style={[
              styles.modal,
              {
                transform: [
                  { scale: defeatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })},
                  { translateY: defeatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })}
                ]
              }
            ]}
          >
            <Text style={styles.modalTitle}>Te quedaste sin vidas</Text>
            <Text style={styles.modalText}>
              Puedes continuar este nivel con 1 vida pagando 2 Metras.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={continueWithMetras}
              >
                <LinearGradient
                  colors={['#FACC15', '#F59E0B']}
                  style={styles.modalButtonGradient}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.modalButtonText}>Continuar (2</Text>
                    <Ionicons name="diamond" size={16} color="#0F172A" />
                    <Text style={styles.modalButtonText}>)</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalButtonSecondary} 
                onPress={goHome}
              >
                <Text style={styles.modalButtonSecondaryText}>Salir</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrim: { ...StyleSheet.absoluteFillObject },
  hudContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  lobbyButton: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  lobbyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lobbyButtonEmoji: {
    fontSize: 18,
  },
  lobbyButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  hudStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleGradient: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  questionCounter: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.grayLight,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 9999,
  },
  questionCard: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  questionCardGradient: {
    padding: 16,
    borderRadius: 14,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  feedbackContainer: {
    marginTop: 8,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  optionGradient: {
    padding: 14,
    borderRadius: 14,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionKey: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionKeyText: {
    fontWeight: '900',
    color: colors.primary,
    fontSize: 14,
  },
  optionText: {
    flex: 1,
    fontWeight: '800',
    color: colors.textPrimary,
    fontSize: 14,
  },
  optionCorrect: {
    borderColor: '#22C55E',
  },
  optionIncorrect: {
    borderColor: '#EF4444',
  },
  optionEliminated: {
    borderColor: colors.gray,
  },
  optionEliminatedText: {
    color: colors.gray,
  },
  hintButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  hintButtonDisabled: {
    borderColor: colors.grayLight,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  hintButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 13,
  },
  hintButtonText: {
    fontWeight: '800',
    color: colors.onPrimary,
    fontSize: 16,
  },
  hintButtonDisabledText: {
    color: colors.gray,
  },
  hintCost: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hintCostDisabled: {
    backgroundColor: 'rgba(156, 163, 175, 0.3)',
  },
  hintCostText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  hintCostDisabledText: {
    color: colors.gray,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60,
  },
  modal: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
    width: '85%',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  modalTitle: {
    fontWeight: '900',
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  modalText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalHighlight: {
    fontWeight: 'bold',
    color: colors.secondary,
  },
  modalButtons: {
    gap: 8,
  },
  modalButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  modalButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 13,
    alignItems: 'center',
  },
  modalButtonText: {
    fontWeight: '900',
    color: colors.textPrimary,
    fontSize: 16,
  },
  modalButtonSecondary: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontWeight: '600',
    color: colors.textSecondary,
    fontSize: 16,
  },
});

export default JergaBasicaScreen;

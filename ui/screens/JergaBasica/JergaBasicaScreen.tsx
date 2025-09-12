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
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

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
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const optionAnimations = useRef<Animated.Value[]>([]).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const questions = QUESTIONS_LEVEL_1;

  useEffect(() => {
    // Animación de entrada más suave
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Actualizar progreso
    Animated.timing(progressAnim, {
      toValue: (currentQuestion / questions.length) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestion]);

  // Animación de entrada inicial
  useEffect(() => {
    // Resetear valores iniciales para entrada suave
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    scaleAnim.setValue(0.95);
  }, []);

  const handleAnswer = (answer: string, index: number) => {
    if (disabledOptions || eliminatedOptions.has(index)) return;

    setSelectedAnswer(answer);
    setDisabledOptions(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const question = questions[currentQuestion];
    const correct = answer === question.a;

    setIsCorrect(correct);
    setShowFeedback(true);

    // Animación de feedback
    Animated.timing(feedbackAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (correct) {
      setScore(score + 1);
      setStreak(streak + 1);
      // Efecto de acierto
      if (optionAnimations[index]) {
        Animated.sequence([
          Animated.timing(optionAnimations[index], {
            toValue: 1.05,
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
    } else {
      setStreak(0);
      setVidas(vidas - 1);
      
      // Efecto de error
      if (optionAnimations[index]) {
        Animated.sequence([
          Animated.timing(optionAnimations[index], {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(optionAnimations[index], {
            toValue: 1,
            duration: 100,
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
        // Nivel completado
        setShowVictoryModal(true);
      } else {
        setCurrentQuestion(currentQuestion + 1);
      }
    }, 1500);
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
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      
      <View style={styles.background}>
        {/* HUD Superior */}
        <Animated.View 
          style={[
            styles.hudContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <TouchableOpacity style={styles.lobbyButton} onPress={goHome}>
            <LinearGradient
              colors={['#FFFFFF', '#FEF3C7']}
              style={styles.lobbyButtonGradient}
            >
              <Text style={styles.lobbyButtonEmoji}>🎮</Text>
              <Text style={styles.lobbyButtonText}>Lobby</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.hudStats}>
            <View style={styles.statChip}>
              <LinearGradient colors={['#FEF2F2', '#FECACA']} style={styles.statChipGradient}>
                <Text style={styles.statEmoji}>❤️</Text>
                <Text style={styles.statText}>{vidas}</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statChip}>
              <LinearGradient colors={['#FFF7ED', '#FED7AA']} style={styles.statChipGradient}>
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={styles.statText}>{streak}</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statChip}>
              <LinearGradient colors={['#EFF6FF', '#BFDBFE']} style={styles.statChipGradient}>
                <Text style={styles.statEmoji}>💎</Text>
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
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }] 
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Traduce la Jerga · Nivel {nivel}
            </Text>
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
                  { width: progressAnim }
                ]} 
              />
            </View>
          </View>

          {/* Tarjeta de Pregunta */}
          <View style={styles.questionCard}>
            <LinearGradient
              colors={['#FFFFFF', '#FEF3C7']}
              style={styles.questionCardGradient}
            >
              <Text style={styles.questionText}>{currentQ.q}</Text>
              
              {showFeedback && (
                <Animated.View 
                  style={[
                    styles.feedbackContainer,
                    { opacity: feedbackAnim }
                  ]}
                >
                  <Text style={[
                    styles.feedbackText,
                    { color: isCorrect ? '#16A34A' : '#DC2626' }
                  ]}>
                    {isCorrect ? '¡Correcto!' : '❌ Incorrecto'}
                  </Text>
                </Animated.View>
              )}
            </LinearGradient>
          </View>

          {/* Opciones */}
          <View style={styles.optionsContainer}>
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
                        <Text style={[
                          styles.optionText,
                          isEliminated && styles.optionEliminatedText
                        ]}>
                          {isEliminated ? '✨ ' + choice : choice}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

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
              <MaterialCommunityIcons 
                name="lightbulb-on" 
                size={20} 
                color={metras < 1 ? '#9CA3AF' : '#0F172A'} 
              />
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
                <Text style={[
                  styles.hintCostText,
                  metras < 1 && styles.hintCostDisabledText
                ]}>
                  1 💎
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Modal de Victoria */}
      {showVictoryModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
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
          </View>
        </View>
      )}

      {/* Modal de Derrota */}
      {showDefeatModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
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
                  <Text style={styles.modalButtonText}>Continuar (2 💎)</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalButtonSecondary} 
                onPress={goHome}
              >
                <Text style={styles.modalButtonSecondaryText}>Salir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  background: {
    flex: 1,
    backgroundColor: 'transparent',
  },
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
    borderColor: '#E2E8F0',
    shadowColor: '#000',
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
    color: '#0F172A',
  },
  hudStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
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
  statEmoji: {
    fontSize: 18,
  },
  statText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#0F172A',
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
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  questionCounter: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#CBD5E1',
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
    borderColor: '#E2E8F0',
    shadowColor: '#000',
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
    color: '#0F172A',
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
    borderColor: '#E2E8F0',
    shadowColor: '#000',
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
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionKeyText: {
    fontWeight: '900',
    color: '#3730A3',
    fontSize: 14,
  },
  optionText: {
    flex: 1,
    fontWeight: '800',
    color: '#0F172A',
    fontSize: 14,
  },
  optionCorrect: {
    borderColor: '#22C55E',
  },
  optionIncorrect: {
    borderColor: '#EF4444',
  },
  optionEliminated: {
    borderColor: '#9CA3AF',
  },
  optionEliminatedText: {
    color: '#9CA3AF',
  },
  hintButton: {
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FACC15',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  hintButtonDisabled: {
    borderColor: '#D1D5DB',
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
    color: '#0F172A',
    fontSize: 16,
  },
  hintButtonDisabledText: {
    color: '#9CA3AF',
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
    color: '#0F172A',
  },
  hintCostDisabledText: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 15, 25, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 18,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  modalTitle: {
    fontWeight: '900',
    fontSize: 18,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalHighlight: {
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  modalButtons: {
    gap: 8,
  },
  modalButton: {
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FDE68A',
    shadowColor: '#D97706',
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
    color: '#0F172A',
    fontSize: 16,
  },
  modalButtonSecondary: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontWeight: '600',
    color: '#374151',
    fontSize: 16,
  },
});

export default JergaBasicaScreen;

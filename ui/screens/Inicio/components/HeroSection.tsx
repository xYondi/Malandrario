import React, { useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Animated, ScrollView, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../theme/colors';
import * as Haptics from 'expo-haptics';

interface GameMode {
  id: string;
  title: string;
  description: string;
  character: any; // Imagen del personaje
  progress: number;
  level: number;
  totalQuestions: number;
}

interface HeroSectionProps {
  playButtonAnim: Animated.Value;
  onPlay: () => void;
  userLevel: number;
}

const gameModes: GameMode[] = [
  {
    id: 'jerga-basica',
    title: 'Jerga Básica',
    description: 'Palabras que todo venezolano sabe de memoria.',
    character: require('../../../../assets/PERSONAJE.png'),
    progress: 20, // Nivel 2 de 10 = 20%
    level: 1, // Se usará el nivel real del usuario
    totalQuestions: 10
  },
  {
    id: 'entre-corotos',
    title: 'Entre corotos',
    description: 'Cosas y objetos todos los días.',
    character: require('../../../../assets/PERSONAJE.png'), // Cambiar por imagen de olla
    progress: 10, // Nivel 1 de 10 = 10%
    level: 2,
    totalQuestions: 10
  },
  {
    id: 'calle-broma',
    title: 'Calle y broma',
    description: 'Expresiones de la calle y chistes criollos.',
    character: require('../../../../assets/PERSONAJE.png'), // Cambiar por imagen específica
    progress: 0, // Nivel 0 de 10 = 0%
    level: 3,
    totalQuestions: 10
  },
  {
    id: 'memes-virales',
    title: 'Memes y virales',
    description: 'Lo que está de moda en las redes.',
    character: require('../../../../assets/PERSONAJE.png'), // Cambiar por imagen específica
    progress: 0, // Nivel 0 de 10 = 0%
    level: 4,
    totalQuestions: 10
  }
];

const { width: screenWidth } = Dimensions.get('window');

const HeroSection: React.FC<HeroSectionProps> = ({
  playButtonAnim,
  onPlay,
  userLevel,
}) => {
  const [currentModeIndex, setCurrentModeIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const currentMode = gameModes[currentModeIndex];
  
  // Usar el nivel real del usuario para el primer modo
  const getModeLevel = (modeIndex: number) => {
    if (modeIndex === 0) {
      return userLevel;
    }
    return Math.max(1, userLevel - modeIndex);
  };

  // Calcular progreso basado en nivel (escala 1-10)
  const getModeProgress = (modeIndex: number) => {
    const currentLevel = getModeLevel(modeIndex);
    return (currentLevel / 10) * 100; // Convertir a porcentaje
  };

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const newIndex = Math.round(contentOffset.x / screenWidth);
    if (newIndex !== currentModeIndex && newIndex >= 0 && newIndex < gameModes.length) {
      setCurrentModeIndex(newIndex);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const scrollToMode = (index: number) => {
    if (index >= 0 && index < gameModes.length) {
      setCurrentModeIndex(index);
      scrollViewRef.current?.scrollTo({ x: index * screenWidth, animated: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // PanResponder para manejar el scroll manualmente en la zona del personaje
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Solo activar si es un movimiento horizontal significativo
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
    },
    onPanResponderGrant: () => {
      // Inicio del gesto
    },
    onPanResponderMove: (evt, gestureState) => {
      // Durante el movimiento, no hacemos nada especial
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Al soltar, determinar si cambiar de modo basado en la velocidad y distancia
      const { dx, vx } = gestureState;
      const threshold = screenWidth * 0.25; // 25% de la pantalla
      const velocityThreshold = 0.5;
      
      if (Math.abs(dx) > threshold || Math.abs(vx) > velocityThreshold) {
        if (dx > 0 && currentModeIndex > 0) {
          // Swipe derecha - modo anterior
          const newIndex = currentModeIndex - 1;
          setCurrentModeIndex(newIndex);
          scrollViewRef.current?.scrollTo({ x: newIndex * screenWidth, animated: true });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (dx < 0 && currentModeIndex < gameModes.length - 1) {
          // Swipe izquierda - siguiente modo
          const newIndex = currentModeIndex + 1;
          setCurrentModeIndex(newIndex);
          scrollViewRef.current?.scrollTo({ x: newIndex * screenWidth, animated: true });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    },
  });

  return (
    <View style={styles.heroSection}>
      {/* Carrusel de modos de juego con scroll deshabilitado por defecto */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.carouselContainer}
        scrollEnabled={false} // Siempre deshabilitado, se controla con zona táctil específica
      >
        {gameModes.map((mode, index) => (
          <View key={mode.id} style={styles.gameModeSlide}>
            {/* Personaje 3D */}
            <Animated.View style={styles.characterContainer}>
              <Animated.Image 
                source={mode.character} 
                style={[
                  styles.characterImage,
                  index === 0 && styles.characterImageLarge,
                  {
                    transform: [
                      { scale: index === currentModeIndex ? 1 : 0.8 },
                      { translateY: index === currentModeIndex ? -40 : 0 } // Subir la imagen específicamente
                    ]
                  }
                ]} 
              />
              {/* Vista previa del siguiente modo (solo si no es el último) */}
              {index < gameModes.length - 1 && (
                <View style={styles.nextModePreview}>
                  <Image source={gameModes[index + 1].character} style={styles.previewImage} />
                </View>
              )}
              
              {/* Zona táctil invisible para controlar el scroll solo en el área del personaje */}
              <View 
                style={styles.characterTouchZone}
                {...panResponder.panHandlers}
                pointerEvents="box-only" // Solo capturar eventos en esta zona específica
              />
            </Animated.View>

            {/* Contenido del modo */}
            <Animated.View style={[
              styles.modeContent,
              {
                opacity: index === currentModeIndex ? 1 : 0.6,
                transform: [{ translateY: index === currentModeIndex ? 0 : 10 }]
              }
            ]}>
              {/* Título del modo */}
              <View style={styles.modeTitleContainer}>
                <Animated.Text style={[
                  styles.modeTitle,
                  index === 0 && styles.modeTitleJergaBasica,
                  {
                    transform: [{ scale: index === currentModeIndex ? 1 : 0.9 }]
                  }
                ]}>{mode.title}</Animated.Text>
              </View>

              {/* Descripción del modo */}
              <Animated.Text style={[
                styles.modeDescription,
                index === 0 && styles.modeDescriptionJergaBasica,
                {
                  opacity: index === currentModeIndex ? 1 : 0.7
                }
              ]}>{mode.description}</Animated.Text>

              {/* Barra de progreso */}
              <Animated.View style={[
                styles.progressContainer,
                {
                  transform: [{ scale: index === currentModeIndex ? 1 : 0.95 }]
                }
              ]}>
                <View style={styles.progressBar}>
                  <View style={styles.progressBarBackground} />
                  <Animated.View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${getModeProgress(index)}%` }
                    ]} 
                  />
                </View>
                <Text style={[
                  styles.progressText,
                  index === 0 && styles.progressTextJergaBasica
                ]}>
                  {getModeLevel(index)}/{mode.totalQuestions}
                </Text>
              </Animated.View>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      {/* Botón JUGAR fijo (fuera del scroll) */}
      <Animated.View style={[
        styles.fixedButtonContainer, 
        { transform: [{ scale: playButtonAnim }] }
      ]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Jugar ${gameModes[currentModeIndex].title}`}
          accessibilityHint={`Inicia el juego ${gameModes[currentModeIndex].title}`}
          style={[
            styles.levelButton,
            currentModeIndex === 0 && styles.levelButtonJergaBasica
          ]}
          onPress={() => {
            console.log('Botón JUGAR presionado');
            onPlay();
          }}
          activeOpacity={0.85}
        >
          <View style={[
            styles.levelButtonGradient,
            currentModeIndex === 0 && styles.levelButtonGradientJergaBasica,
            { backgroundColor: '#FDE68A' } // Color base amarillo
          ]}>
            <View style={[
              styles.levelButtonBottomHalf,
              currentModeIndex === 0 && styles.levelButtonBottomHalfJergaBasica
            ]} />
            <Text style={[
              styles.levelButtonText,
              currentModeIndex === 0 && styles.levelButtonTextJergaBasica,
              styles.levelButtonTextStroke
            ]}>JUGAR</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Indicadores de página */}
      <View style={styles.pageIndicators}>
        {gameModes.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.pageIndicator,
              index === currentModeIndex && styles.pageIndicatorActive
            ]}
            onPress={() => scrollToMode(index)}
            activeOpacity={0.7}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -50, // Subido más para acercar todo al HUD
    marginBottom: 20, // Reducido para compactar
    alignSelf: 'center',
    position: 'relative',
    zIndex: 1, // Debajo del HUD (que tiene zIndex: 100)
  },
  carouselContainer: {
    width: screenWidth,
    height: 450, // Reducido de 500 a 450
    marginTop: -80, // Subido más para acercar al HUD
    zIndex: 1, // Debajo del HUD (que tiene zIndex: 100)
  },
  gameModeSlide: {
    width: screenWidth,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  characterContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, // Sin cambios
    marginTop: -30, // Subido solo el personaje más hacia arriba
  },
  characterImage: {
    width: (screenWidth * 320) / 412,
    height: (screenWidth * 320) / 412,
    resizeMode: 'contain',
  },
  characterImageLarge: {
    width: (screenWidth * 400) / 412,
    height: (screenWidth * 400) / 412,
    resizeMode: 'contain',
  },
  nextModePreview: {
    position: 'absolute',
    right: -60,
    top: '50%',
    transform: [{ translateY: -30 }],
    opacity: 0.6,
  },
  previewImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modeContent: {
    alignItems: 'center',
    width: '100%',
    gap: 10, // Reducido más para compactar
    marginTop: -50, // Subido más para acercar al personaje
  },
  modeTitleContainer: {
    alignSelf: 'center',
    marginTop: -70, // Subido más para acercar al personaje
  },
  modeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.onPrimary,
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: colors.primary,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    elevation: 6,
  },
  modeTitleJergaBasica: {
    color: colors.onPrimary,
    borderRadius: 24,
    backgroundColor: colors.bluePrimary, // Fondo azul
    shadowColor: colors.white, // Sombra blanca
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
    borderWidth: 3,
    borderColor: colors.onPrimary,
    // Efecto 3D adicional en azul oscuro
    borderBottomWidth: 6,
    borderBottomColor: colors.bluePrimaryDark, // Borde inferior azul oscuro
    borderRightWidth: 4,
    borderRightColor: colors.bluePrimaryDark, // Borde derecho azul oscuro
    // Tamaño reducido (como el botón de jugar)
    fontSize: 18,
    paddingHorizontal: 40,
    paddingVertical: 16,
    minWidth: 180,
  },
  modeDescription: {
    fontSize: 16,
    color: '#FFB6C1', // Color rosa de la barra de progreso
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: 'bold',
  },
  modeDescriptionJergaBasica: {
    color: '#FFB6C1', // Color rosa de la barra de progreso
    fontWeight: '900', // Texto grueso
    // Trazo azul creado con múltiples textShadows
    textShadowColor: '#1E3A8A',
    textShadowOffset: { width: -1, height: -1 },
    textShadowRadius: 0,
    // Sombra 3D estilo cartoon
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.6,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 2 },
    elevation: 3,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    width: '60%',
    height: 28,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: colors.onPrimary,
    backgroundColor: colors.primary,
    shadowColor: colors.onPrimary,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFB6C1',
    borderRadius: 12,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.5,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onPrimary,
    marginTop: 4,
  },
  progressTextJergaBasica: {
    color: colors.bluePrimary,
  },
  levelButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: -10,
  },
  fixedButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 5, // Reducido más
    position: 'absolute',
    bottom: 110, // Subido más para acercarlo a los elementos superiores
    zIndex: 10, // Por encima de la zona táctil
  },
  levelButton: {
    borderRadius: 24, // Mismo que el título de Jerga Básica
    borderWidth: 2,
    borderColor: colors.white, // Trazo blanco
    shadowColor: '#F59E0B', // Sombra del color más oscuro
    shadowOpacity: 0.35, // Mismo que el botón A
    shadowRadius: 0, // Mismo que el botón A
    shadowOffset: { width: 0, height: 4 }, // Mismo que el botón A
    elevation: 2, // Mismo que el botón A
  },
  levelButtonGradient: {
    borderRadius: 22, // 24 - 2 (border width) = 22
    paddingVertical: 14, // Reducido de 16 a 14
    paddingHorizontal: 35, // Reducido de 40 a 35
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160, // Reducido de 180 a 160
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
  },
  levelButtonText: {
    fontWeight: '900',
    color: colors.onPrimary,
    fontSize: 18,
    letterSpacing: 1,
    zIndex: 2,
  },
  levelButtonTextStroke: {
    // TRAZO EXTERNO amarillo oscuro como en la imagen
    textShadowColor: '#F59E0B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3, // Radio para crear el trazo externo
  },
  levelButtonBottomHalf: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%', // Subir más la parte oscura
    backgroundColor: '#F3C23F', // Amarillo de arriba pero un poco más oscuro
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  levelButtonJergaBasica: {
    borderRadius: 25, // Mismo que el botón A
    borderColor: colors.white, // Trazo blanco
  },
  levelButtonGradientJergaBasica: {
    borderRadius: 23, // 25 - 2 (border width) = 23
    paddingVertical: 20, // Más padding vertical
    paddingHorizontal: 60, // Más padding horizontal
    minWidth: 280, // Más ancho como el título original
  },
  levelButtonBottomHalfJergaBasica: {
    borderBottomLeftRadius: 23,
    borderBottomRightRadius: 23,
  },
  levelButtonTextJergaBasica: {
    fontSize: 28, // Tamaño de fuente como el título original
    letterSpacing: 0.5,
  },
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10, // Reducido para subir los indicadores
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  pageIndicatorActive: {
    backgroundColor: colors.primary,
    width: 24,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  
  // Zona táctil invisible para el control del scroll (solo en el centro, sin cubrir HUD ni botón)
  characterTouchZone: {
    position: 'absolute',
    top: '20%', // Empezar más abajo para no cubrir el HUD
    left: '15%', // Margen lateral
    right: '15%', // Margen lateral
    bottom: '50%', // Terminar más arriba para no cubrir el botón de jugar
    backgroundColor: 'transparent',
    zIndex: 5, // Menor z-index para no interferir con otros elementos
  },
});

export default HeroSection;




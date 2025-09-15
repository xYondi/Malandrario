import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../ui/theme/colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

interface AdsCardProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: () => void;
  onWatchAd: () => void;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = screenHeight * 0.4;
const MAX_TRANSLATE_Y = -screenHeight * 0.08;

export const AdsCard: React.FC<AdsCardProps> = ({ visible, onClose, onPurchase, onWatchAd }) => {
  const translateY = useSharedValue(BOTTOM_SHEET_HEIGHT);
  const opacity = useSharedValue(0);
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 200,
        mass: 0.8,
      });
      opacity.value = withTiming(1, { duration: 400 });
      // Vibración al abrir
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      translateY.value = withTiming(BOTTOM_SHEET_HEIGHT, { duration: 250 });
      opacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible, translateY, opacity]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // No necesitamos contexto en la nueva API
    })
    .onUpdate((event) => {
      const newTranslateY = translateY.value + event.translationY;
      translateY.value = Math.max(MAX_TRANSLATE_Y, Math.min(BOTTOM_SHEET_HEIGHT, newTranslateY));
    })
    .onEnd((event) => {
      const shouldClose = event.translationY > 80 || event.velocityY > 400;
      const shouldExpand = event.translationY < -40 || event.velocityY < -400;
      
      if (shouldClose) {
        translateY.value = withTiming(BOTTOM_SHEET_HEIGHT, { duration: 250 });
        opacity.value = withTiming(0, { duration: 250 });
        runOnJS(onClose)();
      } else if (shouldExpand) {
        translateY.value = withSpring(MAX_TRANSLATE_Y, {
          damping: 25,
          stiffness: 200,
          mass: 0.8,
        });
        runOnJS(setIsExpanded)(true);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
      } else {
        translateY.value = withSpring(0, {
          damping: 25,
          stiffness: 200,
          mass: 0.8,
        });
        runOnJS(setIsExpanded)(false);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y, 0, BOTTOM_SHEET_HEIGHT],
      [1.02, 1, 0.95],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale }
      ],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handlePurchase = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Animación de salida antes de cerrar
    translateY.value = withTiming(BOTTOM_SHEET_HEIGHT, { duration: 250 });
    opacity.value = withTiming(0, { duration: 250 });
    setTimeout(() => onPurchase(), 250);
  };

  const handleWatchAd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Animación de salida antes de cerrar
    translateY.value = withTiming(BOTTOM_SHEET_HEIGHT, { duration: 250 });
    opacity.value = withTiming(0, { duration: 250 });
    setTimeout(() => onWatchAd(), 250);
  };

  const handleClose = () => {
    // Animación de salida antes de cerrar
    translateY.value = withTiming(BOTTOM_SHEET_HEIGHT, { duration: 250 });
    opacity.value = withTiming(0, { duration: 250 });
    setTimeout(() => onClose(), 250);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity 
          style={styles.backdropTouchable} 
          activeOpacity={1} 
          onPress={handleClose}
        />
      </Animated.View>
      
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.bottomSheet, animatedStyle]}>
          <LinearGradient
            colors={[colors.surface, colors.surfaceAlt]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            {/* Handle indicator */}
            <View style={styles.handleIndicator} />
            

            <View style={styles.contentInner}>
              {/* Título malandro */}
              <Text style={styles.title}>¡Elimina esos anuncios, hermano!</Text>
              <Text style={styles.subtitle}>No más interrupciones pa' jugar tranquilo, pana</Text>
              
              {/* Opciones principales - Más destacadas */}
              <View style={styles.optionsContainer}>
                {/* Premium Option - Más prominente */}
                <TouchableOpacity style={styles.premiumOption} onPress={handlePurchase}>
                  <LinearGradient
                    colors={[colors.secondary, colors.yellowDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.premiumGradient}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.premiumIconContainer}>
                        <MaterialCommunityIcons name="crown" size={24} color={colors.onPrimary} />
                      </View>
                        <View style={styles.optionText}>
                          <Text style={styles.optionTitle}>¡Compra Premium, chamo!</Text>
                          <Text style={styles.optionSubtitle}>Una sola vez y listo, pa' toda la vida</Text>
                          <Text style={styles.optionPrice}>$4.99</Text>
                        </View>
                      <View style={styles.checkIconContainer}>
                        <MaterialCommunityIcons name="check-circle" size={24} color={colors.onPrimary} />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Free Option - Más compacta */}
                <TouchableOpacity style={styles.freeOption} onPress={handleWatchAd}>
                  <View style={styles.freeGradient}>
                    <View style={styles.optionContent}>
                      <View style={styles.freeIconContainer}>
                        <MaterialCommunityIcons name="play-circle" size={24} color={colors.primary} />
                      </View>
                        <View style={styles.optionText}>
                          <Text style={styles.freeOptionTitle}>Ver un anunciito</Text>
                          <Text style={styles.freeOptionSubtitle}>20 minuticos gratis, vale</Text>
                        </View>
                      <View style={styles.arrowIconContainer}>
                        <MaterialCommunityIcons name="arrow-right" size={24} color={colors.primary} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -100, // Extender hacia abajo para cubrir la barra de navegación
    height: BOTTOM_SHEET_HEIGHT + 100, // Altura adicional para cubrir el espacio
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: -15 },
    elevation: 25,
  },
  handleIndicator: {
    backgroundColor: colors.secondary,
    width: 50,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  contentInner: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100, // Padding ajustado para la altura reducida
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  premiumOption: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.secondary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  premiumGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onPrimary,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 4,
    fontWeight: '500',
  },
  optionPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.onPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  premiumIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeOption: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  freeGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  freeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  freeOptionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default AdsCard;

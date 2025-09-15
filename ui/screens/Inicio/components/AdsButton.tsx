import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet, Text, Animated } from 'react-native';
import { colors } from '../../../theme/colors';

interface AdsButtonProps {
  onPress: () => void;
}

const AdsButton: React.FC<AdsButtonProps> = ({ onPress }) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de rebote continuo
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Animación de pulso del corazón
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotación sutil del botón
    const rotateAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    bounceAnimation.start();
    pulseAnimation.start();
    rotateAnimation.start();

    return () => {
      bounceAnimation.stop();
      pulseAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <TouchableOpacity 
      style={styles.adsButton} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={[
        styles.container,
        {
          transform: [
            { scale: bounceAnim },
            { rotate: rotateInterpolate }
          ]
        }
      ]}>
        {/* Sombra del botón */}
        <View style={styles.shadow} />
        
        {/* Botón principal */}
        <View style={styles.mainButton}>
          {/* Efecto de brillo */}
          <View style={styles.glow} />
          
          {/* Contenido del botón */}
          <View style={styles.content}>
            {/* Icono de play */}
            <Animated.View style={[
              styles.playContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <Text style={styles.playIcon}>▶️</Text>
            </Animated.View>
            
            {/* Texto ADS */}
            <Text style={styles.adsText}>ADS</Text>
            
            {/* Línea decorativa */}
            <View style={styles.decorativeLine} />
          </View>
        </View>
        
        {/* Partículas decorativas */}
        <View style={styles.particle1} />
        <View style={styles.particle2} />
        <View style={styles.particle3} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  adsButton: {
    position: 'absolute',
    right: 16,
    top: 80,
  },
  container: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    top: 5,
    left: 5,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.yellowPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 4,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  glow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(250, 204, 21, 0.3)',
    top: -5,
    left: -5,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  playContainer: {
    marginBottom: 2,
  },
  playIcon: {
    fontSize: 22,
  },
  adsText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  decorativeLine: {
    position: 'absolute',
    width: 35,
    height: 3,
    backgroundColor: colors.red,
    borderRadius: 1.5,
    transform: [{ rotate: '45deg' }],
    top: 10,
  },
  particle1: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.red,
    top: 12,
    right: 12,
    opacity: 0.7,
  },
  particle2: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.bluePrimary,
    top: 22,
    left: 6,
    opacity: 0.6,
  },
  particle3: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.yellowDark,
    bottom: 18,
    right: 6,
    opacity: 0.8,
  },
});

export default AdsButton;



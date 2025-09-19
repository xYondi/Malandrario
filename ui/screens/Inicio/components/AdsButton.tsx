import React, { useRef, useEffect, useState } from 'react';
import { Pressable, View, StyleSheet, Text, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import GlassView from '../../../../components/GlassView';
import * as Haptics from 'expo-haptics';

interface AdsButtonProps {
  onPress: () => void;
}

const AdsButton: React.FC<AdsButtonProps> = ({ onPress }) => {
  // Animaciones para efectos de liquid glass
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const glassOpacityAnim = useRef(new Animated.Value(0.08)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  
  // Estado para controlar efectos de presionar
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    // Respiración muy sutil
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    breathe.start();

    return () => {
      breathe.stop();
    };
  }, []);

  // Función para crear efecto ripple
  const createRippleEffect = () => {
    Animated.sequence([
      Animated.timing(rippleAnim, { 
        toValue: 1, 
        duration: 300, 
        useNativeDriver: true 
      }),
      Animated.timing(rippleAnim, { 
        toValue: 0, 
        duration: 200, 
        useNativeDriver: true 
      }),
    ]).start();
  };

  // Función para efecto de presionar
  const handlePressIn = () => {
    setIsPressed(true);
    Animated.parallel([
      Animated.timing(scaleAnim, { 
        toValue: 0.95, 
        duration: 100, 
        useNativeDriver: true 
      }),
      Animated.timing(opacityAnim, { 
        toValue: 0.8, 
        duration: 100, 
        useNativeDriver: true 
      }),
      Animated.timing(glassOpacityAnim, { 
        toValue: 0.2, 
        duration: 100, 
        useNativeDriver: false 
      }),
    ]).start();
  };

  // Función para efecto de soltar
  const handlePressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.timing(scaleAnim, { 
        toValue: 1, 
        duration: 150, 
        useNativeDriver: true 
      }),
      Animated.timing(opacityAnim, { 
        toValue: 1, 
        duration: 150, 
        useNativeDriver: true 
      }),
      Animated.timing(glassOpacityAnim, { 
        toValue: 0.08, 
        duration: 150, 
        useNativeDriver: false 
      }),
    ]).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createRippleEffect();
    onPress();
  };

  return (
    <Pressable
      style={styles.adsButton}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Botón con efecto Liquid Glass */}
        <View style={styles.gameIcon}>
          {/* GlassView VACÍO solo como fondo decorativo */}
          <GlassView 
            style={styles.glassBackground}
            glassEffectStyle="clear"
            isInteractive={true}
            tintColor={`rgba(30, 58, 138, ${glassOpacityAnim})`}
          />
          {/* Efecto ripple */}
          <Animated.View 
            style={[
              styles.rippleEffect,
              {
                transform: [{ scale: rippleAnim }],
                opacity: rippleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3]
                })
              }
            ]}
          />
          {/* Contenido nítido encima del vidrio */}
          <Ionicons name="play" size={28} color="#FFFFFF" />
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  adsButton: {
    position: 'absolute',
    right: 16,
    top: 80,
    zIndex: 10, // Asegurar que esté por encima
  },
  container: {
    position: 'relative',
  },
  gameIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    // Bordes Liquid Glass azul para botón prominente
    borderWidth: 1.5,
    borderColor: 'rgba(30, 58, 138, 0.6)', // Azul
    shadowColor: 'rgba(30, 58, 138, 0.5)', // Azul
    shadowOpacity: 0.9,
    shadowRadius: 3, // Aumentado un poco para mejor efecto
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },

  // Efecto ripple para liquid glass
  rippleEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.5)',
    shadowColor: 'rgba(30, 58, 138, 0.8)',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});

export default AdsButton;



import React, { useRef, useState } from 'react';
import { Text, StyleSheet, Animated, Platform, Pressable } from 'react-native';
import GlassView from '../../../../../../components/GlassView';
import * as Haptics from 'expo-haptics';

// Función para detectar si es iOS 26+ (obligatorio para liquid glass)
const isiOS26Plus = (): boolean => {
  return Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) >= 26;
};

interface KeyboardKeyProps {
  letter: string;
  keySize: number;
  keyHeight: number;
  isDisabled: boolean;
  onPress: (key: string) => void;
  disabled?: boolean;
  scaleAnimation?: Animated.Value;
}

const KeyboardKey: React.FC<KeyboardKeyProps> = ({
  letter,
  keySize,
  keyHeight,
  isDisabled,
  onPress,
  disabled,
  scaleAnimation
}) => {
  const useLiquidGlass = isiOS26Plus();
  
  // Animaciones para efectos de liquid glass (como Hud.tsx)
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const glassOpacityAnim = useRef(new Animated.Value(0.15)).current; // Más opacidad inicial para fondo liquid glass
  const rippleAnim = useRef(new Animated.Value(0)).current;
  
  // Estado para controlar efectos de presionar
  const [isPressed, setIsPressed] = useState(false);
  
  // Función para crear efecto ripple (igual que Hud.tsx)
  const createRippleEffect = (rippleAnim: Animated.Value) => {
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
  
  // Función para efecto de presionar (igual que Hud.tsx)
  const handlePressIn = () => {
    setIsPressed(true);
    if (useLiquidGlass) {
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
    }
  };
  
  // Función para efecto de soltar (igual que Hud.tsx)
  const handlePressOut = () => {
    setIsPressed(false);
    if (useLiquidGlass) {
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
          toValue: 0.15, 
          duration: 150, 
          useNativeDriver: false 
        }),
      ]).start();
    }
  };
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (useLiquidGlass) {
      createRippleEffect(rippleAnim);
    }
    onPress(letter);
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnimation || 1 }] }
      ]}
    >
      <Pressable
        style={[
          useLiquidGlass ? styles.keyLiquidGlass : styles.key,
          { width: keySize, height: keyHeight },
          isDisabled && (useLiquidGlass ? styles.keyDisabledLiquidGlass : styles.keyDisabled),
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isDisabled}
      >
        <Animated.View style={[
          styles.keyContent,
          useLiquidGlass && {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim
          }
        ]}>
          {useLiquidGlass && (
            <>
              <GlassView 
                style={styles.keyGlassBackground}
                glassEffectStyle="clear"
                isInteractive={true}
                tintColor={`rgba(255, 255, 255, ${glassOpacityAnim})`}
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
            </>
          )}
          <Text style={[
            useLiquidGlass ? styles.keyTextLiquidGlass : styles.keyText, 
            isDisabled && styles.keyTextDisabled
          ]} pointerEvents="none">{letter}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Estilos originales
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
  keyText: { 
    fontWeight: '900', 
    color: '#2E6CA8', 
    fontSize: 22, 
    letterSpacing: 0.2 
  },
  keyPressed: { 
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  keyDisabled: { 
    backgroundColor: '#E5E7EB' 
  },
  keyTextDisabled: { 
    color: '#9CA3AF' 
  },
  
  // Contenedor para efectos liquid glass
  keyContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  // Estilos Liquid Glass para iOS 26+
  keyLiquidGlass: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent', // Fondo transparente - solo liquid glass
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', // Borde translúcido
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: 'transparent', // Mantener transparente al presionar
    shadowOpacity: 0.4,
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
  
  // Efecto ripple para liquid glass (igual que Hud.tsx)
  rippleEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: 'rgba(255, 255, 255, 0.8)',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});

export default KeyboardKey;

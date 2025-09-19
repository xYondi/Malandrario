import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import GunIcon from '../../../../components/GunIcon';
import GlassView from '../../../../components/GlassView';
import * as Haptics from 'expo-haptics';

// Función para detectar si el dispositivo soporta efectos avanzados
const supportsAdvancedEffects = (): boolean => {
  if (Platform.OS === 'ios') {
    // iOS 13+ soporta efectos avanzados
    return parseInt(Platform.Version as string, 10) >= 13;
  } else if (Platform.OS === 'android') {
    // Android API 26+ (Android 8.0+) soporta efectos avanzados
    return Platform.Version >= 26;
  }
  return false;
};

export interface HudBarProps {
  vidas: number;
  streak: number;
  metras: number;
  onHome: () => void;
  hudAnim: Animated.Value;
}

const HudBar: React.FC<HudBarProps> = ({ vidas, streak, metras, onHome, hudAnim }) => {
  // Detectar si el dispositivo soporta efectos avanzados
  const hasAdvancedEffects = supportsAdvancedEffects();
  // Animaciones para efectos de liquid glass
  const lobbyScaleAnim = useRef(new Animated.Value(1)).current;
  const lobbyOpacityAnim = useRef(new Animated.Value(1)).current;
  const lobbyGlassOpacityAnim = useRef(new Animated.Value(0.08)).current;
  const lobbyRippleAnim = useRef(new Animated.Value(0)).current;
  
  const vidasScaleAnim = useRef(new Animated.Value(1)).current;
  const vidasOpacityAnim = useRef(new Animated.Value(1)).current;
  const vidasGlassOpacityAnim = useRef(new Animated.Value(0.08)).current;
  const vidasRippleAnim = useRef(new Animated.Value(0)).current;
  
  const streakScaleAnim = useRef(new Animated.Value(1)).current;
  const streakOpacityAnim = useRef(new Animated.Value(1)).current;
  const streakGlassOpacityAnim = useRef(new Animated.Value(0.08)).current;
  const streakRippleAnim = useRef(new Animated.Value(0)).current;
  
  const metrasScaleAnim = useRef(new Animated.Value(1)).current;
  const metrasOpacityAnim = useRef(new Animated.Value(1)).current;
  const metrasGlassOpacityAnim = useRef(new Animated.Value(0.08)).current;
  const metrasRippleAnim = useRef(new Animated.Value(0)).current;

  // Animaciones específicas para los iconos
  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const heartRotateAnim = useRef(new Animated.Value(0)).current;
  
  const flameScaleAnim = useRef(new Animated.Value(1)).current;
  const flameShakeAnim = useRef(new Animated.Value(0)).current;
  
  const gunScaleAnim = useRef(new Animated.Value(1)).current;
  const gunRotateAnim = useRef(new Animated.Value(0)).current;

  // Estados para controlar efectos de presionar
  const [isLobbyPressed, setIsLobbyPressed] = useState(false);
  const [isVidasPressed, setIsVidasPressed] = useState(false);
  const [isStreakPressed, setIsStreakPressed] = useState(false);
  const [isMetrasPressed, setIsMetrasPressed] = useState(false);

  // Función para crear efecto ripple
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

  // Animación del corazón - latido
  const animateHeart = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(heartScaleAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(heartScaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(heartScaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(heartRotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartRotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // Animación de la llama - shake y scale
  const animateFlame = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(flameScaleAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(flameScaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(flameShakeAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(flameShakeAnim, {
          toValue: -1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(flameShakeAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(flameShakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // Animación de la pistolita - rotación y bounce
  const animateGun = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(gunScaleAnim, {
          toValue: 1.25,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(gunScaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(gunRotateAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(gunRotateAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // Función para efecto de presionar
  const handlePressIn = (
    scaleAnim: Animated.Value, 
    opacityAnim: Animated.Value, 
    glassOpacityAnim: Animated.Value,
    setPressed: (value: boolean) => void
  ) => {
    setPressed(true);
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
  const handlePressOut = (
    scaleAnim: Animated.Value, 
    opacityAnim: Animated.Value, 
    glassOpacityAnim: Animated.Value,
    setPressed: (value: boolean) => void,
    originalGlassOpacity: number
  ) => {
    setPressed(false);
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
        toValue: originalGlassOpacity, 
        duration: 150, 
        useNativeDriver: false 
      }),
    ]).start();
  };

  // Función para manejar el press del botón Lobby
  const handleLobbyPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createRippleEffect(lobbyRippleAnim);
    onHome();
  };

  // Funciones para manejar press de stats con animaciones de iconos
  const handleVidasPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    createRippleEffect(vidasRippleAnim);
    animateHeart(); // Animar el corazón
    console.log('vidas info');
  };

  const handleStreakPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    createRippleEffect(streakRippleAnim);
    animateFlame(); // Animar la llama
    console.log('streak info');
  };

  const handleMetrasPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    createRippleEffect(metrasRippleAnim);
    animateGun(); // Animar la pistolita
    console.log('metras info');
  };

  // Función helper para renderizar un chip de estadística
  const renderStatChip = (
    iconName: string,
    iconColor: string,
    value: number,
    onPress: () => void,
    scaleAnim: Animated.Value,
    opacityAnim: Animated.Value,
    glassOpacityAnim: Animated.Value,
    rippleAnim: Animated.Value,
    setPressed: (value: boolean) => void,
    iconScaleAnim: Animated.Value,
    iconTransformAnim: Animated.Value,
    isGunIcon = false,
    isShakeAnimation = false
  ) => (
    <Pressable 
      style={styles.statChip}
      onPress={onPress}
      onPressIn={() => handlePressIn(scaleAnim, opacityAnim, glassOpacityAnim, setPressed)}
      onPressOut={() => handlePressOut(scaleAnim, opacityAnim, glassOpacityAnim, setPressed, 0.08)}
    >
      <Animated.View style={[
        styles.statChipContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim
        }
      ]}>
        {hasAdvancedEffects ? (
          <>
            <GlassView 
              style={styles.glassBackground}
              glassEffectStyle="clear"
              isInteractive={true}
              tintColor={`rgba(255, 255, 255, ${glassOpacityAnim})`}
            />
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
        ) : (
          // Fallback para dispositivos antiguos
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)']}
            style={styles.fallbackBackground}
          />
        )}
        <View style={styles.statChipInner}>
          <Animated.View 
            style={{
              transform: [
                { scale: iconScaleAnim },
                isShakeAnimation 
                  ? { translateX: iconTransformAnim.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: [-3, 0, 3]
                    })}
                  : { rotate: iconTransformAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '15deg']
                    })}
              ]
            }}
          >
            {isGunIcon ? (
              <GunIcon size={18} color={iconColor} pointerEvents="none" />
            ) : (
              <Ionicons name={iconName as any} size={18} color={iconColor} pointerEvents="none" />
            )}
          </Animated.View>
          <Text style={styles.statText} pointerEvents="none">{value}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
  return (
    <Animated.View 
      style={[
        styles.hudContainer,
        { 
          opacity: hudAnim,
          transform: [
            { translateY: hudAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }
          ]
        }
      ]}
    >
      <Pressable 
        style={styles.lobbyButton}
        onPress={handleLobbyPress}
        onPressIn={() => handlePressIn(lobbyScaleAnim, lobbyOpacityAnim, lobbyGlassOpacityAnim, setIsLobbyPressed)}
        onPressOut={() => handlePressOut(lobbyScaleAnim, lobbyOpacityAnim, lobbyGlassOpacityAnim, setIsLobbyPressed, 0.08)}
      >
        <Animated.View style={[
          styles.lobbyButtonContainer,
          {
            transform: [{ scale: lobbyScaleAnim }],
            opacity: lobbyOpacityAnim
          }
        ]}>
          {hasAdvancedEffects ? (
            <>
              <GlassView 
                style={styles.glassBackground}
                glassEffectStyle="clear"
                isInteractive={true}
                tintColor={`rgba(255, 255, 255, ${lobbyGlassOpacityAnim})`}
              />
              {/* Efecto ripple */}
              <Animated.View 
                style={[
                  styles.rippleEffect,
                  {
                    transform: [{ scale: lobbyRippleAnim }],
                    opacity: lobbyRippleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.3]
                    })
                  }
                ]}
              />
            </>
          ) : (
            // Fallback para dispositivos antiguos - gradiente simple
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.fallbackBackground}
            />
          )}
          <View style={styles.lobbyButtonInner}>
            <Ionicons name="home" size={18} color="#0F172A" pointerEvents="none" />
            <Text style={styles.lobbyButtonText} pointerEvents="none">Lobby</Text>
          </View>
        </Animated.View>
      </Pressable>

      <View style={styles.hudStats}>
        {/* Chip de vidas */}
        {renderStatChip(
          'heart',
          '#DC2626',
          vidas,
          handleVidasPress,
          vidasScaleAnim,
          vidasOpacityAnim,
          vidasGlassOpacityAnim,
          vidasRippleAnim,
          setIsVidasPressed,
          heartScaleAnim,
          heartRotateAnim,
          false, // isGunIcon
          false  // isShakeAnimation
        )}
        
        {/* Chip de streak */}
        {renderStatChip(
          'flame',
          '#F97316',
          streak,
          handleStreakPress,
          streakScaleAnim,
          streakOpacityAnim,
          streakGlassOpacityAnim,
          streakRippleAnim,
          setIsStreakPressed,
          flameScaleAnim,
          flameShakeAnim,
          false, // isGunIcon
          true   // isShakeAnimation
        )}
        
        {/* Chip de metras */}
        {renderStatChip(
          '',
          '#2563EB',
          metras,
          handleMetrasPress,
          metrasScaleAnim,
          metrasOpacityAnim,
          metrasGlassOpacityAnim,
          metrasRippleAnim,
          setIsMetrasPressed,
          gunScaleAnim,
          gunRotateAnim,
          true,  // isGunIcon
          false  // isShakeAnimation
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  hudContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    width: '100%', // Asegurar ancho completo
    height: 60, // Altura fija para evitar estiramiento
    overflow: 'hidden', // Prevenir overflow horizontal
  },
  lobbyButton: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lobbyButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: 'relative',
    backgroundColor: 'transparent',
    // Bordes Liquid Glass más visibles
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(255, 255, 255, 0.3)',
    shadowOpacity: 0.8,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    borderRadius: 20,
    minHeight: 36, // Altura mínima en lugar de 100%
  },
  lobbyButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lobbyButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  hudStats: {
    flexDirection: 'row',
    gap: 8,
    flex: 0, // No expandir
    maxWidth: '65%', // Máximo 65% del ancho
  },
  statChip: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statChipContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: 'relative',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // Bordes Liquid Glass más visibles
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(255, 255, 255, 0.2)',
    shadowOpacity: 0.6,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 0.5 },
    elevation: 1,
    minHeight: 36, // Altura mínima consistente
  },
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  fallbackBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  statChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  
  // Efecto ripple para liquid glass
  rippleEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
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

export default HudBar;





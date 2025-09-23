import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { colors } from '../../../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GunIcon from '../../../../components/GunIcon';
import GlassView from '../../../../components/GlassView';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

interface HudProps {
  shimmerAnim: Animated.Value;
  slideAnim: Animated.Value;
  userLevel?: number;
  userGems?: number;
}

const Hud: React.FC<HudProps> = ({ shimmerAnim, slideAnim, userLevel = 1, userGems = 0 }) => {
  const navigation = useNavigation();
  // Animaciones para efectos de liquid glass
  const settingsScaleAnim = useRef(new Animated.Value(1)).current;
  const settingsOpacityAnim = useRef(new Animated.Value(1)).current;
  const settingsGlassOpacityAnim = useRef(new Animated.Value(0.08)).current;
  const settingsRippleAnim = useRef(new Animated.Value(0)).current;
  
  const levelScaleAnim = useRef(new Animated.Value(1)).current;
  const levelOpacityAnim = useRef(new Animated.Value(1)).current;
  const levelGlassOpacityAnim = useRef(new Animated.Value(0.12)).current;
  const levelRippleAnim = useRef(new Animated.Value(0)).current;
  
  const gunsScaleAnim = useRef(new Animated.Value(1)).current;
  const gunsOpacityAnim = useRef(new Animated.Value(1)).current;
  const gunsGlassOpacityAnim = useRef(new Animated.Value(0.08)).current;
  const gunsRippleAnim = useRef(new Animated.Value(0)).current;

  // Animaciones específicas para los iconos
  const settingsRotateAnim = useRef(new Animated.Value(0)).current;
  const settingsScaleIconAnim = useRef(new Animated.Value(1)).current;
  
  const levelPulseAnim = useRef(new Animated.Value(1)).current;
  const levelShakeAnim = useRef(new Animated.Value(0)).current;
  
  const gunScaleAnim = useRef(new Animated.Value(1)).current;
  const gunRotateAnim = useRef(new Animated.Value(0)).current;
  const plusBounceAnim = useRef(new Animated.Value(1)).current;

  // Estados para controlar efectos de presionar
  const [isSettingsPressed, setIsSettingsPressed] = useState(false);
  const [isLevelPressed, setIsLevelPressed] = useState(false);
  const [isGunsPressed, setIsGunsPressed] = useState(false);

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

  // Animación del icono de configuración - rotación y scale
  const animateSettings = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(settingsScaleIconAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(settingsScaleIconAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(settingsRotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(settingsRotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // Animación del texto de nivel - pulso y shake
  const animateLevel = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(levelPulseAnim, {
          toValue: 1.15,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(levelPulseAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(levelShakeAnim, {
          toValue: 1,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(levelShakeAnim, {
          toValue: -1,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(levelShakeAnim, {
          toValue: 1,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(levelShakeAnim, {
          toValue: 0,
          duration: 60,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // Animación de pistolitas y botón plus - bounce y rotación
  const animateGuns = () => {
    Animated.parallel([
      // Animación del icono de pistolita
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
      // Animación del botón plus
      Animated.sequence([
        Animated.timing(plusBounceAnim, {
          toValue: 1.4,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(plusBounceAnim, {
          toValue: 1,
          tension: 400,
          friction: 8,
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

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createRippleEffect(settingsRippleAnim);
    animateSettings(); // Animar el icono de configuración
    console.log('settings');
  };

  const handleLevelPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createRippleEffect(levelRippleAnim);
    animateLevel(); // Animar el texto de nivel
    setTimeout(() => {
      (navigation as any).navigate('LevelHub');
    }, 180);
  };

  const handleGunsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createRippleEffect(gunsRippleAnim);
    animateGuns(); // Animar pistolitas y botón plus
    // Navegar a Tienda enfocando la sección de Pistolitas
    setTimeout(() => {
      console.log('[HUD] Navigating to Tienda with section=pistolitas');
      (navigation as any).navigate('Tienda', { section: 'pistolitas' });
    }, 180);
  };

  return (
    <Animated.View style={[styles.hudContainer, { transform: [{ translateY: slideAnim }] }]}>
      {/* Lado izquierdo */}
      <View style={styles.leftSide}>
        {/* Botón de ajustes */}
        <Pressable 
          style={styles.settingsBtn}
          onPress={handleSettingsPress}
          onPressIn={() => handlePressIn(settingsScaleAnim, settingsOpacityAnim, settingsGlassOpacityAnim, setIsSettingsPressed)}
          onPressOut={() => handlePressOut(settingsScaleAnim, settingsOpacityAnim, settingsGlassOpacityAnim, setIsSettingsPressed, 0.08)}
        >
          <Animated.View style={[
            styles.settingsContent, 
            { 
              transform: [{ scale: settingsScaleAnim }],
              opacity: settingsOpacityAnim
            }
          ]}>
            <GlassView 
              style={styles.settingsGlass}
              glassEffectStyle="clear"
              isInteractive={true}
              tintColor={`rgba(255, 255, 255, ${settingsGlassOpacityAnim})`}
            />
            {/* Efecto ripple */}
            <Animated.View 
              style={[
                styles.rippleEffect,
                {
                  transform: [{ scale: settingsRippleAnim }],
                  opacity: settingsRippleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.3]
                  })
                }
              ]}
            />
            <Animated.View
              style={{
                transform: [
                  { scale: settingsScaleIconAnim },
                  { rotate: settingsRotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg']
                    })}
                ]
              }}
            >
              <MaterialCommunityIcons 
                name="cog-outline" 
                size={24} 
                color="#1E3A8A" 
                pointerEvents="none"
              />
            </Animated.View>
          </Animated.View>
        </Pressable>

        {/* Botón de nivel */}
        <Pressable 
          style={styles.levelBtn}
          onPress={handleLevelPress}
          onPressIn={() => handlePressIn(levelScaleAnim, levelOpacityAnim, levelGlassOpacityAnim, setIsLevelPressed)}
          onPressOut={() => handlePressOut(levelScaleAnim, levelOpacityAnim, levelGlassOpacityAnim, setIsLevelPressed, 0.12)}
        >
          <Animated.View style={[
            styles.levelContent, 
            { 
              transform: [{ scale: levelScaleAnim }],
              opacity: levelOpacityAnim
            }
          ]}>
            <GlassView 
              style={styles.levelGlass}
              glassEffectStyle="clear"
              isInteractive={true}
              tintColor={`rgba(255, 255, 255, ${levelGlassOpacityAnim})`}
            />
            {/* Efecto ripple */}
            <Animated.View 
              style={[
                styles.rippleEffect,
                {
                  transform: [{ scale: levelRippleAnim }],
                  opacity: levelRippleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.3]
                  })
                }
              ]}
            />
            <Animated.View
              style={{
                transform: [
                  { scale: levelPulseAnim },
                  { translateX: levelShakeAnim.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: [-2, 0, 2]
                    })}
                ]
              }}
            >
              <Text style={styles.levelText} pointerEvents="none">
                Nivel {userLevel}
              </Text>
            </Animated.View>
          </Animated.View>
        </Pressable>
      </View>

      {/* Lado derecho */}
      <View style={styles.rightSide}>
        {/* Botón de pistolitas */}
        <Pressable 
          style={styles.gunsBtn}
          onPress={handleGunsPress}
          onPressIn={() => handlePressIn(gunsScaleAnim, gunsOpacityAnim, gunsGlassOpacityAnim, setIsGunsPressed)}
          onPressOut={() => handlePressOut(gunsScaleAnim, gunsOpacityAnim, gunsGlassOpacityAnim, setIsGunsPressed, 0.08)}
        >
          <Animated.View style={[
            styles.gunsContent, 
            { 
              transform: [{ scale: gunsScaleAnim }],
              opacity: gunsOpacityAnim
            }
          ]}>
            <GlassView 
              style={styles.gunsGlass}
              glassEffectStyle="clear"
              isInteractive={true}
              tintColor={`rgba(255, 255, 255, ${gunsGlassOpacityAnim})`}
            />
            {/* Efecto ripple */}
            <Animated.View 
              style={[
                styles.rippleEffect,
                {
                  transform: [{ scale: gunsRippleAnim }],
                  opacity: gunsRippleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.3]
                  })
                }
              ]}
            />
            <Animated.View
              style={{
                transform: [{ scale: plusBounceAnim }]
              }}
            >
              <Text style={styles.plusBtn} pointerEvents="none">+</Text>
            </Animated.View>
            <Text style={styles.gunsText} pointerEvents="none">{userGems}</Text>
            <Animated.View
              style={{
                transform: [
                  { scale: gunScaleAnim },
                  { rotate: gunRotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '15deg']
                    })}
                ]
              }}
            >
              <GunIcon size={18} color={colors.primary} />
            </Animated.View>
          </Animated.View>
        </Pressable>
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
    paddingVertical: 8,
    marginBottom: 12,
    marginTop: -20,
    zIndex: 100, // Asegurar que el HUD esté por encima de todo
    position: 'relative',
  },
  
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Botón de ajustes
  settingsBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsContent: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  settingsGlass: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },

  // Botón de nivel
  levelBtn: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  levelGlass: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },

  // Botón de pistolitas
  gunsBtn: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gunsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  gunsGlass: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  plusBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '900',
    fontSize: 12,
  },
  gunsText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
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

export default Hud;

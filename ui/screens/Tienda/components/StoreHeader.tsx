import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import GunIcon from '../../../../components/GunIcon';
import GlassView from '../../../../components/GlassView';
import * as Haptics from 'expo-haptics';

interface StoreHeaderProps {
  userGems: number;
  onBack: () => void;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
}

const StoreHeader: React.FC<StoreHeaderProps> = ({
  userGems,
  onBack,
  fadeAnim,
  slideAnim,
}) => {
  // Liquid glass animations (based on HUD)
  const backScaleAnim = useRef(new Animated.Value(1)).current;
  const backOpacityAnim = useRef(new Animated.Value(1)).current;
  const backGlassOpacityAnim = useRef(new Animated.Value(0.1)).current;
  const backRippleAnim = useRef(new Animated.Value(0)).current;
  const [isBackPressed, setIsBackPressed] = useState(false);

  const gemsScaleAnim = useRef(new Animated.Value(1)).current;
  const gemsOpacityAnim = useRef(new Animated.Value(1)).current;
  const gemsGlassOpacityAnim = useRef(new Animated.Value(0.08)).current;
  const gemsRippleAnim = useRef(new Animated.Value(0)).current;
  const [isGemsPressed, setIsGemsPressed] = useState(false);

  const createRippleEffect = (rippleAnim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(rippleAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(rippleAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const handlePressIn = (
    scaleAnim: Animated.Value,
    opacityAnim: Animated.Value,
    glassOpacityAnim: Animated.Value,
    setPressed: (v: boolean) => void,
    targetGlassOpacity: number
  ) => {
    setPressed(true);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.98, tension: 220, friction: 18, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0.95, duration: 120, useNativeDriver: true }),
      Animated.timing(glassOpacityAnim, { toValue: targetGlassOpacity, duration: 140, useNativeDriver: false }),
    ]).start();
  };

  const handlePressOut = (
    scaleAnim: Animated.Value,
    opacityAnim: Animated.Value,
    glassOpacityAnim: Animated.Value,
    setPressed: (v: boolean) => void,
    originalGlassOpacity: number
  ) => {
    setPressed(false);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 180, friction: 16, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.timing(glassOpacityAnim, { toValue: originalGlassOpacity, duration: 180, useNativeDriver: false }),
    ]).start();
  };
  return (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Lado izquierdo - Botón de volver (Liquid Glass) */}
      <View style={styles.leftSection}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); createRippleEffect(backRippleAnim); onBack(); }}
          onPressIn={() => handlePressIn(backScaleAnim, backOpacityAnim, backGlassOpacityAnim, setIsBackPressed, 0.2)}
          onPressOut={() => handlePressOut(backScaleAnim, backOpacityAnim, backGlassOpacityAnim, setIsBackPressed, 0.1)}
          style={styles.settingsButton}
        >
          <Animated.View style={[styles.settingsContent, { transform: [{ scale: backScaleAnim }], opacity: backOpacityAnim }]}> 
            <GlassView 
              style={styles.settingsGlass}
              glassEffectStyle="clear"
              isInteractive={true}
              tintColor={`rgba(255, 255, 255, ${backGlassOpacityAnim})`}
            />
            <Animated.View 
              style={[styles.rippleEffect, { transform: [{ scale: backRippleAnim }], opacity: backRippleAnim.interpolate({ inputRange: [0,1], outputRange: [0,0.15] }) }]}
            />
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </Animated.View>
        </Pressable>
      </View>

      {/* Título estilo cartoon */}
      <View style={styles.titleSection}>
        <View style={styles.headerTitleBadge}>
          <Text style={styles.headerTitle}>Tienda</Text>
        </View>
      </View>

      {/* Lado derecho - Pistolitas (Liquid Glass) */}
      <View style={styles.rightSection}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); createRippleEffect(gemsRippleAnim); }}
          onPressIn={() => handlePressIn(gemsScaleAnim, gemsOpacityAnim, gemsGlassOpacityAnim, setIsGemsPressed, 0.18)}
          onPressOut={() => handlePressOut(gemsScaleAnim, gemsOpacityAnim, gemsGlassOpacityAnim, setIsGemsPressed, 0.08)}
          style={styles.resourcePill}
        >
          <Animated.View style={[styles.resourcePillContent, { transform: [{ scale: gemsScaleAnim }], opacity: gemsOpacityAnim }]}> 
            <GlassView 
              style={styles.resourceGlass}
              glassEffectStyle="clear"
              isInteractive={true}
              tintColor={`rgba(255, 255, 255, ${gemsGlassOpacityAnim})`}
            />
            <Animated.View 
              style={[styles.rippleEffect, { borderRadius: 25, transform: [{ scale: gemsRippleAnim }], opacity: gemsRippleAnim.interpolate({ inputRange: [0,1], outputRange: [0,0.15] }) }]}
            />
            <Text style={styles.plusBadge}>+</Text>
            <Text style={styles.resourceNumber}>{userGems}</Text>
            <View style={styles.resourceIcon}>
              <GunIcon size={18} color={colors.primary} />
            </View>
          </Animated.View>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  settingsContent: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  settingsGlass: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 25,
  },
  titleSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 1,
    paddingRight: 8,
  },
  headerTitleBadge: {
    backgroundColor: colors.secondary,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 3,
    borderColor: colors.white,
    transform: [{ rotate: '-2deg' }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.onSecondary,
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  resourcePill: {
    borderRadius: 25,
  },
  resourcePillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 25,
    gap: 6,
    position: 'relative',
  },
  resourceGlass: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 25,
  },
  resourceNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2E6CA8',
  },
  resourceIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBadge: {
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
  rippleEffect: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  resourceEmoji: {
    fontSize: 12,
  },
});

export default StoreHeader;

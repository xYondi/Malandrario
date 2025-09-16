import React from 'react';
import { StyleSheet, Animated, Dimensions, View } from 'react-native';
import { colors } from '../../../theme/colors';

interface SuccessOverlayProps {
  visible: boolean;
  successAnim: Animated.Value;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SuccessOverlay: React.FC<SuccessOverlayProps> = ({ visible, successAnim }) => {
  if (!visible) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.successOverlay, { opacity: successAnim }]}
    >
      {/* Flash */}
      <Animated.View
        style={[
          styles.flash,
          { opacity: successAnim.interpolate({ inputRange: [0, 0.25, 0.5, 1], outputRange: [0, 0.55, 0.15, 0] }) },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          {
            transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.3] }) }],
            opacity: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ringSecondary,
          {
            transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1.1] }) }],
            opacity: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
          },
        ]}
      />
      {/* Confeti mejorado */}
      {Array.from({ length: 28 }).map((_, i) => (
        <Animated.View
          key={`conf-${i}`}
          style={[
            styles.confetti,
            {
              backgroundColor: i % 4 === 0 ? colors.yellowPrimary : i % 4 === 1 ? colors.red : i % 4 === 2 ? colors.bluePrimary : '#34D399',
              transform: [
                { translateY: successAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 200 + (i % 6) * 22] }) },
                { translateX: ((i % 2 === 0 ? 1 : -1) * (16 + (i * 3))) },
                { rotate: `${(i * 48) % 360}deg` },
              ],
              opacity: successAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.95, 1, 0.15] }),
            },
          ]}
        />
      ))}
      {/* Badge central */}
      <Animated.View
        style={[
          styles.badge,
          {
            transform: [
              { scale: successAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.5, 1.05, 1] }) },
            ],
            opacity: successAnim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] }),
          },
        ]}
      >
        <View style={styles.badgeInner} />
      </Animated.View>
      <Animated.View style={[styles.successStar, styles.successStar1, { opacity: successAnim }]} />
      <Animated.View style={[styles.successStar, styles.successStar2, { opacity: successAnim }]} />
      <Animated.View style={[styles.successStar, styles.successStar3, { opacity: successAnim }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 70,
  },
  ring: {
    position: 'absolute',
    width: screenWidth * 0.6,
    height: screenWidth * 0.6,
    borderRadius: (screenWidth * 0.6) / 2,
    borderWidth: 10,
    borderColor: colors.yellowPrimary,
    opacity: 0.8,
  },
  ringSecondary: {
    position: 'absolute',
    width: screenWidth * 0.78,
    height: screenWidth * 0.78,
    borderRadius: (screenWidth * 0.78) / 2,
    borderWidth: 8,
    borderColor: colors.red,
    opacity: 0.6,
  },
  flash: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.white },
  confetti: { position: 'absolute', width: 6, height: 10, borderRadius: 1 },
  badge: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    borderWidth: 4,
    borderColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.yellowPrimary,
  },
  successStar: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: colors.bluePrimary },
  successStar1: { top: screenHeight * 0.28, left: screenWidth * 0.2 },
  successStar2: { top: screenHeight * 0.5, right: screenWidth * 0.18 },
  successStar3: { bottom: screenHeight * 0.22, left: screenWidth * 0.42 },
});

export default SuccessOverlay;




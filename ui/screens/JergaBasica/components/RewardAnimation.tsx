import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import GunIcon from '../../../../components/GunIcon';

interface RewardAnimationProps {
  visible: boolean;
  amount: number;
  onComplete?: () => void;
}

const RewardAnimation: React.FC<RewardAnimationProps> = ({ visible, amount, onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      translateYAnim.setValue(20);
      bounceAnim.setValue(1);

      // Start animation sequence
      Animated.parallel([
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Scale up with bounce
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 200,
          friction: 6,
          useNativeDriver: true,
        }),
        // Slide up
        Animated.timing(translateYAnim, {
          toValue: -30,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Bounce the icon
      const bounceLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      );
      bounceLoop.start();

      // Fade out after delay
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: -60,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete?.();
        });
      }, 1500);
    }
  }, [visible, amount, fadeAnim, scaleAnim, translateYAnim, bounceAnim, onComplete]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.rewardContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
            ],
          },
        ]}
      >
        <View style={styles.rewardContent}>
          <Text style={styles.plusText}>+{amount}</Text>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: bounceAnim }],
              },
            ]}
          >
            <GunIcon size={24} color="#FACC15" />
          </Animated.View>
        </View>
        
        {/* Sparkle effects */}
        <Animated.View style={[styles.sparkle, styles.sparkle1, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.sparkle, styles.sparkle2, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.sparkle, styles.sparkle3, { opacity: fadeAnim }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 1000,
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  rewardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(29, 78, 216, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  plusText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#FACC15',
    borderRadius: 4,
  },
  sparkle1: {
    top: -20,
    left: -15,
    transform: [{ rotate: '45deg' }],
  },
  sparkle2: {
    top: -15,
    right: -20,
    transform: [{ rotate: '45deg' }],
  },
  sparkle3: {
    bottom: -20,
    left: 10,
    transform: [{ rotate: '45deg' }],
  },
});

export default RewardAnimation;

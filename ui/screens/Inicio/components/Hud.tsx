import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors } from '../../../theme/colors';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface HudProps {
  shimmerAnim: Animated.Value;
  slideAnim: Animated.Value;
}

const Hud: React.FC<HudProps> = ({ shimmerAnim, slideAnim }) => {
  return (
    <Animated.View style={[styles.hudRow, { transform: [{ translateY: slideAnim }] }]}> 
      <View style={styles.hudLeft}>
        <TouchableOpacity style={styles.ringBtn} onPress={() => console.log('settings')}>
          <MaterialCommunityIcons name="cog" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={[styles.bubble, { backgroundColor: colors.surface, borderColor: colors.secondary }, styles.levelContainer]}>
          <Animated.View 
            style={[
              styles.shimmerEffect,
              {
                opacity: shimmerAnim,
                transform: [{
                  translateX: shimmerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 100],
                  })
                }]
              }
            ]}
          />
          <Text style={[styles.bubbleTextStrong, { color: colors.primary }]}>Nivel 2</Text>
        </View>
      </View>
      <View style={styles.hudRight}>
        <View style={[styles.bubble, styles.bubblePurple, { backgroundColor: colors.surface, borderColor: colors.secondary }]}>
          <Text style={styles.plus}>+</Text>
          <Text style={styles.bubbleText}>0</Text>
          <Ionicons name="ticket" size={16} color={colors.primary} />
        </View>
        <View style={[styles.bubble, styles.bubbleBlue, { backgroundColor: colors.surface, borderColor: colors.secondary }]}>
          <Text style={styles.plus}>+</Text>
          <Text style={styles.bubbleText}>5</Text>
          <FontAwesome5 name="gem" size={16} color={colors.primary} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  hudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    position: 'relative',
    top: -18,
  },
  hudLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hudRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ringBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.secondary,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  bubble: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  levelContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(250, 204, 21, 0.3)',
    width: 50,
    height: '100%',
  },
  bubblePurple: { borderColor: colors.border },
  bubbleBlue: { borderColor: colors.border },
  bubbleTextStrong: { fontWeight: 'bold' },
  bubbleText: { fontSize: 14 },
  plus: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '900',
    fontSize: 12,
    overflow: 'hidden',
  },
});

export default Hud;



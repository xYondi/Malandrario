import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';

export interface HudBarProps {
  vidas: number;
  streak: number;
  metras: number;
  onHome: () => void;
  hudAnim: Animated.Value;
}

const HudBar: React.FC<HudBarProps> = ({ vidas, streak, metras, onHome, hudAnim }) => {
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
      <TouchableOpacity style={styles.lobbyButton} onPress={onHome}>
        <LinearGradient colors={['#FFFFFF', '#FEF3C7']} style={styles.lobbyButtonGradient}>
          <Ionicons name="home" size={18} color="#0F172A" />
          <Text style={styles.lobbyButtonText}>Lobby</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.hudStats}>
        <View style={styles.statChip}>
          <LinearGradient colors={['#FEF2F2', '#FECACA']} style={styles.statChipGradient}>
            <Ionicons name="heart" size={18} color="#DC2626" />
            <Text style={styles.statText}>{vidas}</Text>
          </LinearGradient>
        </View>
        <View style={styles.statChip}>
          <LinearGradient colors={['#FFF7ED', '#FED7AA']} style={styles.statChipGradient}>
            <Ionicons name="flame" size={18} color="#F97316" />
            <Text style={styles.statText}>{streak}</Text>
          </LinearGradient>
        </View>
        <View style={styles.statChip}>
          <LinearGradient colors={['#EFF6FF', '#BFDBFE']} style={styles.statChipGradient}>
            <Ionicons name="diamond" size={18} color="#2563EB" />
            <Text style={styles.statText}>{metras}</Text>
          </LinearGradient>
        </View>
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
  },
  lobbyButton: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  lobbyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lobbyButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  hudStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.textPrimary,
  },
});

export default HudBar;





import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import GunIcon from '../../../../components/GunIcon';

interface HintButtonProps {
  metras: number;
  disabled: boolean;
  onPress: () => void;
  compact?: boolean;
}

const HintButton: React.FC<HintButtonProps> = ({ metras, disabled, onPress, compact = false }) => {
  const isDisabled: boolean = disabled || metras < 1;
  return (
    <TouchableOpacity
      style={[compact ? styles.hintButtonCompact : styles.hintButton, isDisabled && styles.hintButtonDisabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={isDisabled ? ['#F3F4F6', '#E5E7EB'] : ['#FEF3C7', '#FDE68A', '#F59E0B']}
        style={compact ? styles.hintButtonGradientCompact : styles.hintButtonGradient}
      >
        <Ionicons name="bulb" size={compact ? 16 : 20} color={isDisabled ? '#9CA3AF' : '#FFFFFF'} />
        {!compact && (
          <Text style={[styles.hintButtonText, isDisabled && styles.hintButtonDisabledText]}>Pista</Text>
        )}
        <View style={[compact ? styles.hintCostCompact : styles.hintCost, isDisabled && styles.hintCostDisabled]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[compact ? styles.hintCostTextCompact : styles.hintCostText, isDisabled && styles.hintCostDisabledText]}>1</Text>
            <GunIcon size={compact ? 12 : 14} color={isDisabled ? '#9CA3AF' : '#0F172A'} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  hintButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  hintButtonDisabled: { borderColor: colors.grayLight, shadowOpacity: 0.1, elevation: 2 },
  hintButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 13,
  },
  hintButtonCompact: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.secondary,
    elevation: 4,
    alignSelf: 'center',
  },
  hintButtonGradientCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  hintButtonText: { fontWeight: '800', color: colors.onPrimary, fontSize: 16 },
  hintButtonDisabledText: { color: colors.gray },
  hintCost: { backgroundColor: 'rgba(255, 255, 255, 0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  hintCostCompact: { backgroundColor: 'rgba(255, 255, 255, 0.3)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  hintCostDisabled: { backgroundColor: 'rgba(156, 163, 175, 0.3)' },
  hintCostText: { fontSize: 12, fontWeight: 'bold', color: colors.textPrimary },
  hintCostTextCompact: { fontSize: 10, fontWeight: 'bold', color: colors.textPrimary },
  hintCostDisabledText: { color: colors.gray },
});

export default HintButton;




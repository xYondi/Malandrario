import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';

export interface OptionItem {
  label: string;
  isEliminated: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
}

interface OptionsListProps {
  options: OptionItem[];
  optionAnimations: Animated.Value[];
  disabledOptions: boolean;
  onPressOption: (index: number) => void;
}

const OptionsList: React.FC<OptionsListProps> = ({ options, optionAnimations, disabledOptions, onPressOption }) => {
  return (
    <View style={styles.optionsContainer}>
      {options.map((opt, index) => (
        <Animated.View key={index} style={[{ transform: [{ scale: optionAnimations[index] || 1 }] }]}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              opt.isEliminated && styles.optionEliminated,
              opt.isCorrect && styles.optionCorrect,
              opt.isIncorrect && styles.optionIncorrect,
            ]}
            onPress={() => onPressOption(index)}
            disabled={disabledOptions || opt.isEliminated}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                opt.isEliminated
                  ? ['#F3F4F6', '#E5E7EB']
                  : opt.isCorrect
                  ? ['#DCFCE7', '#BBF7D0']
                  : opt.isIncorrect
                  ? ['#FEE2E2', '#FECACA']
                  : ['#FFFFFF', '#FEF3C7']
              }
              style={styles.optionGradient}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionKey}>
                  <Text style={[styles.optionKeyText, opt.isEliminated && styles.optionEliminatedText]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                {opt.isEliminated && <MaterialCommunityIcons name="star-four-points" size={16} color="#9CA3AF" />}
                <Text style={[styles.optionText, opt.isEliminated && styles.optionEliminatedText]}>{opt.label}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  optionsContainer: { gap: 12, marginBottom: 24 },
  optionButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  optionGradient: { padding: 14, borderRadius: 14 },
  optionContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionKey: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionKeyText: { fontWeight: '900', color: colors.primary, fontSize: 14 },
  optionText: { flex: 1, fontWeight: '800', color: colors.textPrimary, fontSize: 14 },
  optionCorrect: { borderColor: '#22C55E' },
  optionIncorrect: { borderColor: '#EF4444' },
  optionEliminated: { borderColor: colors.gray },
  optionEliminatedText: { color: colors.gray },
});

export default OptionsList;





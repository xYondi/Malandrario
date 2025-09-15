import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';

interface ContributeButtonProps {
  onPress: () => void;
}

const ContributeButton: React.FC<ContributeButtonProps> = ({ onPress }) => {
  return (
    <View style={styles.contributeBtnOuter}>
      <TouchableOpacity
        style={styles.contributeBtnInner}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Aporta tu jerga"
        accessibilityHint="Envía una palabra o expresión"
        activeOpacity={0.85}
      >
        <View style={styles.contributeIconContainer}>
          <MaterialCommunityIcons name="lightbulb-on" size={20} color={colors.onPrimary} />
        </View>
        <Text style={styles.contributeText}>Aporta tu jerga</Text>
        <View style={styles.contributeArrow}>
          <Ionicons name="arrow-forward" size={16} color={colors.onPrimary} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  contributeBtnOuter: {
    marginTop: 8,
    borderRadius: 24,
    padding: 4,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  contributeBtnInner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  contributeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.onPrimary,
  },
  contributeText: { 
    fontWeight: '900', 
    color: colors.onPrimary,
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  contributeArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ContributeButton;



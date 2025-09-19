import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import GunIcon from '../../../../components/GunIcon';

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
      {/* Lado izquierdo - Botón de volver */}
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.settingsButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#2E6CA8" />
        </TouchableOpacity>
      </View>

      {/* Título central */}
      <View style={styles.titleSection}>
        <Text style={styles.headerTitle}>Tienda</Text>
      </View>

      {/* Lado derecho - Pistolitas */}
      <View style={styles.rightSection}>
        <View style={styles.resourcePill}>
          <Ionicons name="add" size={16} color="#2E6CA8" />
          <Text style={styles.resourceNumber}>{userGems}</Text>
          <View style={styles.resourceIcon}>
            <GunIcon size={16} color="#FACC15" />
          </View>
        </View>
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E0E7FF',
    shadowColor: '#C7D2FE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 6,
  },
  titleSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2E6CA8',
    textShadowColor: 'rgba(46, 108, 168, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  resourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 25,
    gap: 6,
    borderWidth: 2,
    borderColor: '#E0E7FF',
    shadowColor: '#C7D2FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 3,
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
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceEmoji: {
    fontSize: 12,
  },
});

export default StoreHeader;

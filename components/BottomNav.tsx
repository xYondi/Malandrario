import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../ui/theme/colors';

export interface BottomNavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  disabled?: boolean;
  isActive?: boolean;
  onPress?: () => void;
}

interface BottomNavProps {
  items: ReadonlyArray<BottomNavItem>;
}

const BottomNav: React.FC<BottomNavProps> = ({ items }) => {
  return (
    <SafeAreaView edges={['bottom']} style={styles.root}>
      <View style={styles.navRow}>
        {items.map((item) => (
          <View key={item.key} style={styles.itemWrap}>
            {item.isActive && <View style={styles.activePill} />}
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.item}
              onPress={item.onPress}
              disabled={item.disabled}
            >
              {item.icon}
              <Text style={styles.label}>{item.label}</Text>
            </TouchableOpacity>
            {typeof item.badge === 'number' && item.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

export const sampleBottomNavItems: ReadonlyArray<BottomNavItem> = [
  {
    key: 'home',
    label: 'Inicio',
    icon: <Ionicons name="home" size={28} color={colors.primary} />,
    isActive: true,
  },
  {
    key: 'book',
    label: 'Diccionario',
    icon: <Ionicons name="book-outline" size={28} color={colors.gray} />, // inactivo
    disabled: true,
  },
  {
    key: 'medal',
    label: 'Logros',
    icon: <Ionicons name="ribbon-outline" size={28} color={colors.gray} />, // inactivo
    disabled: true,
  },
  {
    key: 'games',
    label: 'Juegos',
    icon: <MaterialCommunityIcons name="gamepad-square-outline" size={28} color={colors.gray} />, // inactivo
    disabled: true,
  },
  {
    key: 'shop',
    label: 'Tienda',
    icon: <MaterialCommunityIcons name="storefront-outline" size={28} color={colors.primary} />,
    badge: 1,
    onPress: () => console.log('Navigate to Store'),
  },
];

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#FFFFFF', // 100% blanco sólido
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
    paddingBottom: 0,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -30,
  },
  navRow: {
    minHeight: 85,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  itemWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  activePill: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 4,
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
});

export default BottomNav;



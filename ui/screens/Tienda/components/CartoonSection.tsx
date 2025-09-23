import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CartoonSectionProps {
  title: string;
  color: string; // banner color
  children: React.ReactNode;
}

const CartoonSection: React.FC<CartoonSectionProps> = ({ title, color, children }) => {
  return (
    <View style={styles.section}>
      <View style={[styles.sectionBanner, { backgroundColor: color }]}> 
        <Text style={styles.bannerText}>{title}</Text>
      </View>
      <View style={styles.cartoonSectionContainer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionBanner: {
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    marginLeft: 8,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 4,
    transform: [{ rotate: '-2deg' }],
  },
  bannerText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  cartoonSectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 10,
    shadowColor: '#D1D5DB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 8,
    marginTop: -10,
    overflow: 'visible',
  },
});

export default CartoonSection;





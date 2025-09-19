import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import GunIcon from '../../../../components/GunIcon';

interface StoreItemProps {
  title: string;
  subtitle: string;
  amount: number;
  price: string;
  originalPrice?: string;
  discount?: string;
  color: string;
  darkColor: string;
  onPurchase: () => void;
  isPopular?: boolean;
  isBestValue?: boolean;
}

const StoreItem: React.FC<StoreItemProps> = ({
  title,
  subtitle,
  amount,
  price,
  originalPrice,
  discount,
  color,
  darkColor,
  onPurchase,
  isPopular = false,
  isBestValue = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de brillo continuo para items especiales
    if (isPopular || isBestValue) {
      const shineLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shineAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      shineLoop.start();
      return () => shineLoop.stop();
    }

    // Animación de bounce sutil para todos los items
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.02,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    bounceLoop.start();
    return () => bounceLoop.stop();
  }, [isPopular, isBestValue, shineAnim, bounceAnim]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Animación más dramática estilo videojuego
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPurchase();
  };

  return (
    <Animated.View
      style={[
        styles.cartoonCard,
        {
          transform: [
            { scale: scaleAnim },
            { scale: bounceAnim }
          ],
        },
      ]}
    >
      {/* Badge estilo cartoon */}
      {(isPopular || isBestValue) && (
        <Animated.View
          style={[
            styles.cartoonBadge,
            {
              backgroundColor: isPopular ? '#EF4444' : '#8B5CF6',
              transform: [
                {
                  scale: shineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.cartoonBadgeText}>
            {isPopular ? 'POPULAR' : 'MEJOR'}
          </Text>
        </Animated.View>
      )}

      <TouchableOpacity style={styles.cartoonCardContent} onPress={handlePress} activeOpacity={0.9}>
        {/* Fondo blanco estilo cartoon */}
        <View style={styles.cartoonCardMain}>
          {/* Contenido vertical */}
          <View style={styles.cartoonContent}>
            {/* Stack de pistolitas según cantidad */}
            <View style={styles.coinsStackContainer}>
              <View style={styles.coinShadow} />
              {amount <= 200 ? (
                // Una sola moneda para cantidades menores
                <View style={styles.singleCoin}>
                  <GunIcon size={24} color="#1F2937" />
                </View>
              ) : (
                // Stack de monedas para cantidades mayores
                <View style={styles.multiCoinsContainer}>
                  <View style={[styles.stackedCoin, styles.coin1]}>
                    <GunIcon size={20} color="#1F2937" />
                  </View>
                  <View style={[styles.stackedCoin, styles.coin2]}>
                    <GunIcon size={20} color="#1F2937" />
                  </View>
                  {amount >= 500 && (
                    <View style={[styles.stackedCoin, styles.coin3]}>
                      <GunIcon size={20} color="#1F2937" />
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Número grande azul */}
            <Text style={styles.cartoonNumber}>{amount}</Text>

            {/* Precio original tachado si existe */}
            {originalPrice && (
              <View style={styles.originalPriceContainer}>
                <Text style={styles.originalPriceText}>{originalPrice}</Text>
                {discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{discount}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Botón de precio amarillo */}
            <View style={styles.priceButton}>
              <View style={styles.priceButtonMain}>
                <View style={styles.priceButtonShadow} />
                <Text style={styles.priceButtonText}>{price}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Estilos cartoon para items de pago
  cartoonCard: {
    flex: 1,
    position: 'relative',
  },
  cartoonBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 5,
  },
  cartoonBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  cartoonCardContent: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cartoonCardMain: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    height: 180,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    shadowColor: '#D1D5DB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 8,
  },
  cartoonContent: {
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
    paddingVertical: 16,
  },
  coinsStackContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  coinShadow: {
    position: 'absolute',
    bottom: -8,
    width: 50,
    height: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  singleCoin: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FACC15',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 4,
  },
  multiCoinsContainer: {
    position: 'relative',
    width: 80,
    height: 70,
  },
  stackedCoin: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FACC15',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 3,
  },
  coin1: {
    top: 0,
    left: 15,
    zIndex: 3,
  },
  coin2: {
    top: 8,
    left: 8,
    zIndex: 2,
  },
  coin3: {
    top: 16,
    left: 0,
    zIndex: 1,
  },
  cartoonNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2E6CA8',
    marginBottom: 12,
    textShadowColor: 'rgba(46, 108, 168, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  originalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  originalPriceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  discountText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  priceButton: {
    width: '100%',
  },
  priceButtonMain: {
    backgroundColor: '#FACC15',
    borderRadius: 25,
    paddingVertical: 12,
    position: 'relative',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 4,
  },
  priceButtonShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#F59E0B',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  priceButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    zIndex: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});

export default StoreItem;

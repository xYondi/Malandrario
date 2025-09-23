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
  color?: string;
  darkColor?: string;
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

      <TouchableOpacity
        style={styles.cartoonCardContent}
        onPress={handlePress}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Comprar paquete ${title} de ${amount} pistolitas por ${price}`}
        testID={`store-item-${title}`}
      >
        {/* Wrapper de sombra externo para evitar clipping con bordes redondeados */}
        <View style={styles.shadowWrapper}>
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

            {/* Botón de precio amarillo */}
            <View style={styles.priceButton}>
              <View style={styles.priceButtonMain}>
                <View style={styles.priceButtonShadow} />
                <Text style={styles.priceButtonText}>{price}</Text>
              </View>
            </View>

            {/* Área de precio original/desc. ahora debajo del botón */}
            <View style={styles.originalPriceContainer}>
              {originalPrice ? (
                <>
                  <Text style={styles.originalPriceText}>{originalPrice}</Text>
                  {discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{discount}</Text>
                    </View>
                  )}
                </>
              ) : null}
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
    overflow: 'visible',
  },
  shadowWrapper: {
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  cartoonCardMain: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    paddingBottom: 16,
    height: 200,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    // Sin sombra aquí para que no se corte con el borde redondeado
  },
  cartoonContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingVertical: 6,
    gap: 4,
  },
  coinsStackContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  coinShadow: {
    position: 'absolute',
    bottom: -6,
    width: 40,
    height: 8,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  singleCoin: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FACC15',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 3,
  },
  multiCoinsContainer: {
    position: 'relative',
    width: 56,
    height: 48,
  },
  stackedCoin: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FACC15',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 2,
  },
  coin1: {
    top: 0,
    left: 10,
    zIndex: 3,
  },
  coin2: {
    top: 4,
    left: 4,
    zIndex: 2,
  },
  coin3: {
    top: 8,
    left: 0,
    zIndex: 1,
  },
  cartoonNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E3A8A',
    marginBottom: 2,
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },
  originalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 18,
    marginBottom: 4,
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
    marginTop: 4,
    alignSelf: 'stretch',
  },
  priceButtonMain: {
    backgroundColor: '#FACC15',
    borderRadius: 25,
    paddingVertical: 9,
    position: 'relative',
    borderWidth: 0,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  priceButtonShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '28%',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    // Redondear también arriba para que no se vea corte duro
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  priceButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    zIndex: 2,
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },
});

export default StoreItem;

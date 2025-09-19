import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import GunIcon from '../../../../components/GunIcon';

interface FreeItemProps {
  title: string;
  subtitle: string;
  amount: number;
  onClaim: () => void;
  cooldown?: string;
  isAvailable?: boolean;
  buttonText: string;
}

const FreeItem: React.FC<FreeItemProps> = ({
  title,
  subtitle,
  amount,
  onClaim,
  cooldown,
  isAvailable = true,
  buttonText,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAvailable) {
      // Animación de pulso para items disponibles
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [isAvailable, pulseAnim]);

  const handlePress = () => {
    if (!isAvailable) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
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
    
    onClaim();
  };

  return (
    <Animated.View
      style={[
        styles.cartoonCard,
        {
          transform: [
            { scale: scaleAnim },
            { scale: isAvailable ? pulseAnim : 1 }
          ],
          opacity: isAvailable ? 1 : 0.6,
        },
      ]}
    >
      {/* Badge de "GRATIS" */}
      {isAvailable && (
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>GRATIS</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.cartoonCardContent} 
        onPress={handlePress} 
        activeOpacity={0.9}
        disabled={!isAvailable}
      >
        {/* Fondo blanco estilo cartoon */}
        <View style={styles.cartoonCardMain}>
          {/* Contenido vertical */}
          <View style={styles.cartoonContent}>
            {/* Título y subtítulo */}
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>{title}</Text>
              <Text style={styles.itemSubtitle}>{subtitle}</Text>
            </View>

            {/* Una sola pistolita dorada como en la imagen */}
            <View style={styles.singleCoinContainer}>
              <View style={styles.coinShadow} />
              <View style={styles.singleCoin}>
                <GunIcon size={20} color="#1F2937" />
              </View>
            </View>

            {/* Número grande azul */}
            <Text style={styles.cartoonNumber}>+{amount}</Text>

            {/* Botón verde redondeado */}
            <View style={styles.cartoonButton}>
              <View style={[styles.cartoonButtonMain, { backgroundColor: isAvailable ? '#4ADE80' : '#9CA3AF' }]}>
                <View style={[styles.cartoonButtonShadow, { backgroundColor: isAvailable ? '#22C55E' : '#6B7280' }]} />
                <Text style={styles.cartoonButtonText}>
                  {buttonText}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Estilos cartoon para items gratuitos
  cartoonCard: {
    flex: 1,
    position: 'relative',
  },
  freeBadge: {
    position: 'absolute',
    top: -6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 5,
  },
  freeBadgeText: {
    fontSize: 9,
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
    minHeight: 180,
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
    justifyContent: 'space-between',
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  singleCoinContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
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
    elevation: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  itemSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.8,
  },
  cartoonNumber: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1E40AF',
    marginBottom: 12,
    textShadowColor: 'rgba(30, 64, 175, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: -0.5,
  },
  cartoonButton: {
    width: '100%',
  },
  cartoonButtonMain: {
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 8,
    position: 'relative',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 4,
    minHeight: 44,
  },
  cartoonButtonShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  cartoonButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    zIndex: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});

export default FreeItem;

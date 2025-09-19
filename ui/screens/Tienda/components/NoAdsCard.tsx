import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NoAdsCardProps {
  onPurchase: () => void;
}

const NoAdsCard: React.FC<NoAdsCardProps> = ({ onPurchase }) => {
  return (
    <View style={styles.noAdsCard}>
      <TouchableOpacity style={styles.noAdsContent} onPress={onPurchase} activeOpacity={0.8}>
        <View style={[styles.noAdsMain, { backgroundColor: '#EF4444' }]}>
          <View style={[styles.noAdsBottom, { backgroundColor: '#DC2626' }]} />
          <View style={styles.noAdsDivider} />
          
          <View style={styles.noAdsLayout}>
            <View style={styles.noAdsIconContainer}>
              <View style={[styles.noAdsIconBg, { backgroundColor: '#DC2626' }]}>
                <Ionicons name="remove-circle" size={32} color="#FFFFFF" />
              </View>
            </View>
            
            <View style={styles.noAdsTextContainer}>
              <Text style={styles.noAdsTitle}>Quitar Anuncios</Text>
              <Text style={styles.noAdsDescription}>Elimina todos los anuncios para siempre</Text>
              <Text style={styles.noAdsPrice}>$5.99</Text>
            </View>
            
            <View style={styles.noAdsPurchaseButton}>
              <View style={[styles.noAdsButtonMain, { backgroundColor: '#FACC15' }]}>
                <View style={[styles.noAdsButtonBottom, { backgroundColor: '#B8860B' }]} />
                <View style={styles.noAdsButtonDivider} />
                <Text style={styles.noAdsButtonText}>COMPRAR</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Estilos para card sin anuncios (horizontal)
  noAdsCard: {
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 4,
  },
  noAdsContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  noAdsMain: {
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    minHeight: 80,
    position: 'relative',
    overflow: 'hidden',
  },
  noAdsBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
  },
  noAdsDivider: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    zIndex: 1,
  },
  noAdsLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    zIndex: 2,
  },
  noAdsIconContainer: {
    marginRight: 16,
  },
  noAdsIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 3,
  },
  noAdsTextContainer: {
    flex: 1,
  },
  noAdsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  noAdsDescription: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  noAdsPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  noAdsPurchaseButton: {
    marginLeft: 12,
  },
  noAdsButtonMain: {
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 3,
  },
  noAdsButtonBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
  },
  noAdsButtonDivider: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1,
  },
  noAdsButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    zIndex: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});

export default NoAdsCard;

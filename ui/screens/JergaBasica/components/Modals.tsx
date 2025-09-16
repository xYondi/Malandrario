import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';

interface VictoryModalProps {
  visible: boolean;
  victoryAnim: Animated.Value;
  onNextLevel: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ visible, victoryAnim, onNextLevel }) => {
  if (!visible) return null;
  return (
    <Animated.View style={[styles.modalOverlay, { opacity: victoryAnim }]}>
      <Animated.View
        style={[
          styles.modal,
          {
            transform: [
              { scale: victoryAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
              { translateY: victoryAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) },
            ],
          },
        ]}
      >
        <Text style={styles.modalTitle}>¡Nivel completado!</Text>
        <Text style={styles.modalText}>
          Ganaste <Text style={styles.modalHighlight}>5 Metras</Text>. Se desbloquea el siguiente nivel.
        </Text>
        <TouchableOpacity style={styles.modalButton} onPress={onNextLevel}>
          <LinearGradient colors={['#FACC15', '#F59E0B']} style={styles.modalButtonGradient}>
            <Text style={styles.modalButtonText}>Siguiente nivel</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

interface DefeatModalProps {
  visible: boolean;
  defeatAnim: Animated.Value;
  onContinue: () => void;
  onExit: () => void;
}

export const DefeatModal: React.FC<DefeatModalProps> = ({ visible, defeatAnim, onContinue, onExit }) => {
  if (!visible) return null;
  return (
    <Animated.View style={[styles.modalOverlay, { opacity: defeatAnim }]}>
      <Animated.View
        style={[
          styles.modal,
          {
            transform: [
              { scale: defeatAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
              { translateY: defeatAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) },
            ],
          },
        ]}
      >
        <Text style={styles.modalTitle}>Te quedaste sin vidas</Text>
        <Text style={styles.modalText}>Puedes continuar este nivel con 1 vida pagando 2 Metras.</Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalButton} onPress={onContinue}>
            <LinearGradient colors={['#FACC15', '#F59E0B']} style={styles.modalButtonGradient}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.modalButtonText}>Continuar (2</Text>
                <Ionicons name="diamond" size={16} color="#0F172A" />
                <Text style={styles.modalButtonText}>)</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButtonSecondary} onPress={onExit}>
            <Text style={styles.modalButtonSecondaryText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60,
  },
  modal: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
    width: '85%',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  modalTitle: { fontWeight: '900', fontSize: 18, color: colors.textPrimary, textAlign: 'center', marginBottom: 6 },
  modalText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 12 },
  modalHighlight: { fontWeight: 'bold', color: colors.secondary },
  modalButtons: { gap: 8 },
  modalButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  modalButtonGradient: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 13, alignItems: 'center' },
  modalButtonText: { fontWeight: '900', color: colors.textPrimary, fontSize: 16 },
  modalButtonSecondary: { borderRadius: 16, borderWidth: 2, borderColor: colors.border, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  modalButtonSecondaryText: { fontWeight: '600', color: colors.textSecondary, fontSize: 16 },
});





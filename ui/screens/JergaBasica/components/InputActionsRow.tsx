import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import * as Haptics from 'expo-haptics';
import GunIcon from '../../../../components/GunIcon';

interface ActionButtonProps {
  label?: string; // texto grande opcional
  icon?: React.ReactNode; // icono opcional
  colorsGradient: string[];
  cost?: number; // si no se pasa, no se muestra
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, icon, colorsGradient, cost, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Color de sombra específico según el botón
  const shadowColor = colorsGradient[0] === '#FFD700' ? '#B8860B' : 
                     colorsGradient[0] === '#3B82F6' ? '#2563EB' : 
                     colorsGradient[0] === '#EF4444' ? '#DC2626' : '#9FB7DA';
  
  const handlePress = () => {
    // Feedback háptico
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animación de escala al presionar
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animación de pulso para el badge
    if (typeof cost === 'number') {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    onPress();
  };
  
  return (
    <TouchableOpacity style={styles.buttonWrap} onPress={handlePress} activeOpacity={0.9}>
      <Animated.View style={[styles.buttonPill, { shadowColor, transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.gradientFill, { backgroundColor: colorsGradient[0] }]}>
          <View style={[styles.bottomHalf, { backgroundColor: colorsGradient[1] }]} />
          <View style={styles.dividerLine} />
          {label ? <Text style={styles.buttonLabel}>{label}</Text> : icon}
        </View>
      </Animated.View>
      {typeof cost === 'number' && (
        <Animated.View style={[styles.costBadge, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.costBadgeInner}>
            <GunIcon size={12} color="#FACC15" />
            <Text style={styles.costText}>{cost}</Text>
          </View>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

interface InputActionsRowProps {
  onRevealOne: () => void;
  onRemoveWrong: () => void;
  onCheck?: () => void; // validar respuesta actual manualmente
  costs: { revealOne: number; removeWrong: number; check: number };
}

const InputActionsRow: React.FC<InputActionsRowProps> = ({ onRevealOne, onRemoveWrong, onCheck, costs }) => {
  return (
    <View style={styles.row}>
      <ActionButton label="A" colorsGradient={["#FFD700", "#B8860B"]} cost={costs.revealOne} onPress={onRevealOne} />
      <ActionButton icon={<Ionicons name="checkmark" size={24} color="#FFFFFF" />} colorsGradient={["#3B82F6", "#2563EB"]} cost={costs.check} onPress={onCheck || (()=>{})} />
      <ActionButton icon={<Ionicons name="eye-off" size={22} color="#FFFFFF" />} colorsGradient={["#EF4444", "#DC2626"]} cost={costs.removeWrong} onPress={onRemoveWrong} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 24, marginBottom: 8, gap: 20 },
  buttonWrap: { alignItems: 'center' },
  buttonPill: {
    width: 70,
    height: 50,
    borderRadius: 25,
    // Sombra 3D exactamente igual a las teclas
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  gradientFill: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
  },
  buttonLabel: { fontWeight: '900', fontSize: 18, color: colors.onPrimary, zIndex: 2 },
  bottomHalf: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  dividerLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1,
  },
  costBadge: { marginTop: -8, backgroundColor: 'transparent' },
  costBadgeInner: {
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinText: { color: '#FACC15', fontWeight: '900', marginRight: 2 },
  costText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
});

export default InputActionsRow;



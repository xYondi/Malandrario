import React, { useRef, useState } from 'react';
import { StyleSheet, Animated, Platform, Pressable, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Svg, { Path, G } from 'react-native-svg';
import GlassView from '../../../../../../components/GlassView';
import * as Haptics from 'expo-haptics';

// Función para detectar si es iOS 26+ (obligatorio para liquid glass)
const isiOS26Plus = (): boolean => {
  return Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) >= 26;
};

interface SpecialKeyProps {
  type: 'back' | 'clear';
  keySize: number;
  keyHeight: number;
  onPress: () => void;
  disabled?: boolean;
}

const SpecialKey: React.FC<SpecialKeyProps> = ({
  type,
  keySize,
  keyHeight,
  onPress,
  disabled
}) => {
  const useLiquidGlass = isiOS26Plus();

  const renderBackIcon = () => (
    <Svg viewBox="0 -5 32 32" width={Math.floor(keySize * 0.56)} height={Math.floor(keyHeight * 0.56)}>
      <G transform="translate(-518  -1146)" fill="#FFFFFF">
        <Path d="M540.647,1159.24 C541.039,1159.63 541.039,1160.27 540.647,1160.66 C540.257,1161.05 539.623,1161.05 539.232,1160.66 L536.993,1158.42 L534.725,1160.69 C534.331,1161.08 533.692,1161.08 533.298,1160.69 C532.904,1160.29 532.904,1159.65 533.298,1159.26 L535.566,1156.99 L533.327,1154.76 C532.936,1154.37 532.936,1153.73 533.327,1153.34 C533.718,1152.95 534.352,1152.95 534.742,1153.34 L536.981,1155.58 L539.281,1153.28 C539.676,1152.89 540.314,1152.89 540.708,1153.28 C541.103,1153.68 541.103,1154.31 540.708,1154.71 L538.408,1157.01 L540.647,1159.24 L540.647,1159.24 Z M545.996,1146 L528.051,1146 C527.771,1145.98 527.485,1146.07 527.271,1146.28 L518.285,1156.22 C518.074,1156.43 517.983,1156.71 517.998,1156.98 C517.983,1157.26 518.074,1157.54 518.285,1157.75 L527.271,1167.69 C527.467,1167.88 527.723,1167.98 527.979,1167.98 L527.979,1168 L545.996,1168 C548.207,1168 550,1166.21 550,1164 L550,1150 C550,1147.79 548.207,1146 545.996,1146 L545.996,1146 Z"/>
      </G>
    </Svg>
  );

  const renderClearIcon = () => (
    <Icon name="trash-can-outline" size={Math.floor(keySize * 0.42)} color="#FFFFFF" />
  );

  return (
    <TouchableOpacity
      style={[
        type === 'back' 
          ? (useLiquidGlass ? styles.backKeyLiquidGlass : styles.backKey)
          : (useLiquidGlass ? styles.clearKeyLiquidGlass : styles.clearKey),
        { width: keySize, height: keyHeight, borderRadius: 10 }
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {useLiquidGlass && (
        <GlassView 
          style={styles.specialKeyGlassBackground}
          glassEffectStyle="clear"
          isInteractive={true}
          tintColor="rgba(255, 255, 255, 0.12)"
        />
      )}
      {type === 'back' ? renderBackIcon() : renderClearIcon()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Estilos originales
  backKey: { 
    backgroundColor: '#235B93', 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 12, 
    shadowColor: '#163C62', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.45, 
    shadowRadius: 0 
  },
  clearKey: { 
    backgroundColor: '#D95D75', 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 2,
    borderColor: '#C94B63',
    shadowColor: '#B04257',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  roundKeyPressed: { 
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  
  // Estilos Liquid Glass para iOS 26+
  backKeyLiquidGlass: {
    backgroundColor: 'rgba(35, 91, 147, 0.7)', // Azul con opacidad reducida
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 12,
    shadowColor: '#163C62',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 0,
  },
  clearKeyLiquidGlass: {
    backgroundColor: 'rgba(217, 93, 117, 0.7)', // Rosa con opacidad reducida
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#C94B63',
    shadowColor: '#B04257',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  roundKeyPressedLiquidGlass: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  specialKeyGlassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
});

export default SpecialKey;

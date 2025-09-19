import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, Platform, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import KeyboardKey from './KeyboardKey';
import SpecialKey from './SpecialKey';
import GlassView from '../../../../../../components/GlassView';

// Función para detectar si es iOS 26+ (obligatorio para liquid glass)
const isiOS26Plus = (): boolean => {
  return Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) >= 26;
};

const screenWidth = Dimensions.get('window').width;

interface KeyboardPanelProps {
  disabled?: boolean;
  disabledLetters: Set<string>;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  keyAnimations: React.MutableRefObject<{[key: string]: Animated.Value}>;
  accessoryRight?: React.ReactNode;
}

const KeyboardPanel: React.FC<KeyboardPanelProps> = ({
  disabled,
  disabledLetters,
  onKeyPress,
  onBackspace,
  onClear,
  keyAnimations,
  accessoryRight
}) => {
  const useLiquidGlass = isiOS26Plus();
  const horizontalPadding = 32;
  
  // Animaciones para efectos de liquid glass en el contenedor (copiado del HUD)
  const containerScaleAnim = useRef(new Animated.Value(1)).current;
  const containerOpacityAnim = useRef(new Animated.Value(1)).current;
  const containerRippleAnim = useRef(new Animated.Value(0)).current;
  const containerColorAnim = useRef(new Animated.Value(0)).current; // 0 = color original, 1 = azul oscuro
  
  // Estado para controlar efectos de presionar
  const [isContainerPressed, setIsContainerPressed] = useState(false);
  
  // Función para crear efecto ripple (copiado del HUD)
  const createRippleEffect = (rippleAnim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(rippleAnim, { 
        toValue: 1, 
        duration: 300, 
        useNativeDriver: true 
      }),
      Animated.timing(rippleAnim, { 
        toValue: 0, 
        duration: 200, 
        useNativeDriver: true 
      }),
    ]).start();
  };
  
  // Función para efecto de presionar (copiado del HUD)
  const handleContainerPressIn = () => {
    if (!useLiquidGlass) return;
    setIsContainerPressed(true);
    Animated.parallel([
      Animated.timing(containerScaleAnim, { 
        toValue: 0.95, 
        duration: 100, 
        useNativeDriver: true 
      }),
      Animated.timing(containerOpacityAnim, { 
        toValue: 0.8, 
        duration: 100, 
        useNativeDriver: true 
      }),
      Animated.timing(containerColorAnim, { 
        toValue: 1, // Cambiar a azul oscuro
        duration: 100, 
        useNativeDriver: false 
      }),
    ]).start();
  };
  
  // Función para efecto de soltar (copiado del HUD)
  const handleContainerPressOut = () => {
    if (!useLiquidGlass) return;
    setIsContainerPressed(false);
    Animated.parallel([
      Animated.timing(containerScaleAnim, { 
        toValue: 1, 
        duration: 150, 
        useNativeDriver: true 
      }),
      Animated.timing(containerOpacityAnim, { 
        toValue: 1, 
        duration: 150, 
        useNativeDriver: true 
      }),
      Animated.timing(containerColorAnim, { 
        toValue: 0, // Volver al color original
        duration: 150, 
        useNativeDriver: false 
      }),
    ]).start();
  };
  
  // Función para manejar toque en el contenedor (copiado del HUD)
  const handleContainerPress = () => {
    if (!useLiquidGlass) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createRippleEffect(containerRippleAnim);
    console.log('keyboard container pressed');
  };
  
  // Distribución QWERTY con Ñ
  const rows = useMemo(
    () => [
      ['Q','W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L','Ñ'],
      ['Z','X','C','V','B','N','M'],
    ],
    []
  );
  
  const maxCols = useMemo(() => Math.max(rows[0].length, rows[1].length, rows[2].length + 3), [rows]);
  const kbAvailable = screenWidth - (horizontalPadding + 16);
  const kbGap = 2;
  
  const keySize = useMemo(() => {
    const size = Math.floor((kbAvailable - kbGap * (maxCols - 1)) / maxCols);
    return Math.max(36, Math.min(48, size));
  }, [kbAvailable, maxCols]);
  
  const keyHeight = useMemo(() => Math.floor(keySize * 1.08), [keySize]);

  // Interpolación de colores para el fondo liquid glass
  const animatedTintColor = containerColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', 'rgba(25, 42, 86, 0.3)'], // Blanco original -> Azul oscuro
  });

  return (
    <Animated.View style={[
      useLiquidGlass ? styles.kbPanelLiquidGlass : styles.kbPanel,
      useLiquidGlass && {
        transform: [{ scale: containerScaleAnim }],
        opacity: containerOpacityAnim
      }
    ]}>
      {useLiquidGlass && (
        <>
          <GlassView 
            style={styles.panelGlassBackground}
            glassEffectStyle="clear"
            isInteractive={false}
            tintColor="rgba(255, 255, 255, 0.1)"
          />
          {/* Overlay de color animado */}
          <Animated.View 
            style={[
              styles.panelColorOverlay,
              {
                backgroundColor: animatedTintColor
              }
            ]}
          />
          {/* Efecto ripple para el contenedor (copiado del HUD) */}
          <Animated.View 
            style={[
              styles.containerRippleEffect,
              {
                transform: [{ scale: containerRippleAnim }],
                opacity: containerRippleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3]
                })
              }
            ]}
          />
          {/* Overlay interactivo invisible para capturar toques */}
          <Pressable
            style={styles.interactiveOverlay}
            onPress={handleContainerPress}
            onPressIn={handleContainerPressIn}
            onPressOut={handleContainerPressOut}
          />
        </>
      )}
      <View style={styles.kb}>
        <View style={styles.kbHeader}>{accessoryRight}</View>
        {rows.map((row, r) => (
          <View key={`row-${r}`} style={[styles.kbRow, r === 1 && { paddingHorizontal: 0 }]}>
            {r === 2 && (
              <View style={{ width: keySize }} />
            )}
            {row.map((k) => (
              <KeyboardKey
                key={k}
                letter={k}
                keySize={keySize}
                keyHeight={keyHeight}
                isDisabled={disabledLetters.has(k)}
                onPress={onKeyPress}
                disabled={disabled}
                scaleAnimation={keyAnimations.current[k]}
              />
            ))}
            {r === 2 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: kbGap, gap: kbGap }}>
                <SpecialKey
                  type="back"
                  keySize={keySize}
                  keyHeight={keyHeight}
                  onPress={onBackspace}
                  disabled={disabled}
                />
                <SpecialKey
                  type="clear"
                  keySize={keySize}
                  keyHeight={keyHeight}
                  onPress={onClear}
                  disabled={disabled}
                />
              </View>
            )}
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  kbPanel: {
    backgroundColor: '#FFFFFF', // Fondo blanco sólido para dispositivos no iOS 26+
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 14,
    paddingBottom: 72,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 3,
    marginTop: 26,
    marginBottom: -78,
  },
  
  // Panel con liquid glass para iOS 26+
  kbPanelLiquidGlass: {
    backgroundColor: 'transparent', // Fondo transparente - solo liquid glass
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 14,
    paddingBottom: 70, // Mantener padding original - no mover contenido
    paddingHorizontal: 16,
    shadowColor: 'rgba(255, 255, 255, 0.3)',
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
    marginTop: 26,
    marginBottom: -80, // Mantener posición original del panel
    position: 'relative',
    overflow: 'hidden', // Asegurar bordes redondeados
  },
  kb: { 
    gap: 12 
  },
  kbHeader: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 8, 
    marginBottom: 12, 
    width: '100%' 
  },
  kbRow: { 
    flexDirection: 'row', 
    gap: 2, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  // Fondo glass para el panel (iOS 26+)
  panelGlassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: -500, // Mover mucho más abajo para cubrir hasta el final de la pantalla
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 0, // Sin redondeo abajo para la extensión
    borderBottomRightRadius: 0, // Sin redondeo abajo para la extensión
  },
  
  // Overlay de color animado sobre el glass
  panelColorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: -500, // Cubrir toda la extensión
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 0, // Sin redondeo abajo para la extensión
    borderBottomRightRadius: 0, // Sin redondeo abajo para la extensión
  },
  
  // Efecto ripple para el contenedor (copiado del HUD)
  containerRippleEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: -500, // Cubrir toda la extensión
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Efecto ripple blanco translúcido
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: 'rgba(255, 255, 255, 0.8)',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  
  // Overlay interactivo invisible para capturar toques
  interactiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: -500, // Cubrir toda la extensión
    backgroundColor: 'transparent',
    zIndex: -1, // Colocar detrás del contenido para no interferir con las teclas
  },
});

export default KeyboardPanel;

import React, { memo } from 'react';
import { ViewStyle, StyleProp, Platform, View, StyleSheet } from 'react-native';
import { GlassView as ExpoGlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';

interface GlassViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glassEffectStyle?: 'clear' | 'regular';
  isInteractive?: boolean;
  tintColor?: string;
}

const GlassView: React.FC<GlassViewProps> = memo(({ 
  children, 
  style,
  glassEffectStyle = 'clear',
  isInteractive = false,
  tintColor
}) => {
  // Para iOS 26+: usar GlassView nativo según documentación oficial
  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) {
    // Si no hay children, es un GlassView decorativo vacío (como en la documentación)
    if (!children) {
      return (
        <ExpoGlassView 
          style={style}
          glassEffectStyle={glassEffectStyle}
          isInteractive={isInteractive}
          tintColor={tintColor}
        />
      );
    }
    
    // Si hay children, crear estructura con fondo de vidrio
    return (
      <View style={style}>
        <ExpoGlassView 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: (style as any)?.borderRadius || 0,
          }}
          glassEffectStyle={glassEffectStyle}
          isInteractive={isInteractive}
          tintColor={tintColor}
        />
        {children}
      </View>
    );
  }

  // Para iOS sin soporte: usar BlurView como fallback
  if (Platform.OS === 'ios') {
    return (
      <View style={style}>
        <BlurView
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: (style as any)?.borderRadius || 0,
          }}
          intensity={15}
          tint="light"
        />
        {children}
      </View>
    );
  }

  // Para Android: efecto similar con gradiente y bordes que simulan vidrio
  const androidStyle = StyleSheet.flatten(style) || {};
  return (
    <View style={style}>
      {/* Fondo simulando vidrio para Android */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: tintColor || 'rgba(255, 255, 255, 0.15)',
          borderRadius: androidStyle.borderRadius || 0,
          borderWidth: 0.5,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          shadowColor: 'rgba(255, 255, 255, 0.2)',
          shadowOpacity: 0.5,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      />
      {children}
    </View>
  );
});

// Nombre para debugging
GlassView.displayName = 'GlassView';

export default GlassView;

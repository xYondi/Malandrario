import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet, Text, Animated, Easing } from 'react-native';
import { colors } from '../../../theme/colors';

interface AdsButtonProps {
  onPress: () => void;
}

const AdsButton: React.FC<AdsButtonProps> = ({ onPress }) => {
  // Animaciones principales
  const scaleAnim = useRef(new Animated.Value(1)).current; // respiración/bounce
  const wobbleAnim = useRef(new Animated.Value(0)).current; // balanceo
  const bobAnim = useRef(new Animated.Value(0)).current; // flotación eje Y
  const shineAnim = useRef(new Animated.Value(0)).current; // barrido de brillo
  const sparklesAnim = useRef(new Animated.Value(0)).current; // partículas

  useEffect(() => {
    // Respiración (escala suave)
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.06,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Balanceo (wobble) tipo caricatura
    const wobble = Animated.loop(
      Animated.sequence([
        Animated.timing(wobbleAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnim, {
          toValue: -1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Flotación vertical
    const bob = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: -1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Barrido de brillo infinito
    const shine = Animated.loop(
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Partículas intermitentes
    const sparkles = Animated.loop(
      Animated.sequence([
        Animated.timing(sparklesAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(sparklesAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    breathe.start();
    wobble.start();
    bob.start();
    shine.start();
    sparkles.start();

    return () => {
      breathe.stop();
      wobble.stop();
      bob.stop();
      shine.stop();
      sparkles.stop();
    };
  }, []);

  const wobbleInterpolate = wobbleAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-6deg', '0deg', '6deg'],
  });

  const bobInterpolate = bobAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [4, -4],
  });

  const handlePress = () => {
    // Squash and stretch al presionar
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 80,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start(() => onPress());
  };

  return (
    <TouchableOpacity
      style={styles.adsButton}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { scale: scaleAnim },
              { rotate: wobbleInterpolate },
              { translateY: bobInterpolate },
            ],
          },
        ]}
      >
        {/* Estallido (starburst) de fondo */}
        <View style={styles.starburstContainer} pointerEvents="none">
          {Array.from({ length: 10 }).map((_, index) => (
            <View
              key={`ray-${index}`}
              style={[
                styles.ray,
                { transform: [{ rotate: `${index * 18}deg` }] },
              ]}
            />
          ))}
        </View>

        {/* Sombra base tipo sticker */}
        <View style={styles.shadow} />

        {/* Botón principal con borde grueso */}
        <View style={styles.mainButton}>
          {/* Capa interior para simular volumen */}
          <View style={styles.innerButton} />

          {/* Barrido de brillo */}
          <Animated.View
            style={[
              styles.shine,
              {
                transform: [
                  {
                    translateX: shineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-60, 60],
                    }),
                  },
                  { rotate: '-25deg' },
                ],
              },
            ]}
          />

          {/* Contenido: icono y texto */}
          <View style={styles.content}>
            <View style={styles.iconBadge}>
              <Text style={styles.iconText}>▶</Text>
            </View>
            <Text style={styles.adsText}>ADS</Text>
          </View>
        </View>

        {/* Cinta tipo badge */}
        <View style={styles.ribbonContainer} pointerEvents="none">
          <View style={styles.ribbon}>
            <Text style={styles.ribbonText}>BONUS</Text>
          </View>
          <View style={styles.ribbonTailLeft} />
          <View style={styles.ribbonTailRight} />
        </View>

        {/* Estrellas decorativas */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.sparkle,
            styles.sparkle1,
            { opacity: sparklesAnim },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.sparkle,
            styles.sparkle2,
            { opacity: sparklesAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.sparkle,
            styles.sparkle3,
            { opacity: sparklesAnim },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  adsButton: {
    position: 'absolute',
    right: 16,
    top: 80,
  },
  container: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    top: 8,
    left: 8,
  },
  mainButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.yellowPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 6,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 12,
  },
  innerButton: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.yellowDark,
    opacity: 0.25,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.red,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconText: {
    fontSize: 20,
    color: 'white',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  adsText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.4,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Estallido
  starburstContainer: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: {
    position: 'absolute',
    width: 12,
    height: 54,
    borderRadius: 6,
    backgroundColor: colors.bluePrimary,
    opacity: 0.5,
  },
  // Brillo en barrido
  shine: {
    position: 'absolute',
    width: 34,
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.35)',
    top: -26,
    left: 0,
    borderRadius: 16,
  },
  // Cinta superior
  ribbonContainer: {
    position: 'absolute',
    top: -6,
    alignSelf: 'center',
    alignItems: 'center',
  },
  ribbon: {
    backgroundColor: colors.red,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  ribbonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  ribbonTailLeft: {
    position: 'absolute',
    left: -8,
    top: 8,
    width: 10,
    height: 10,
    backgroundColor: colors.red,
    borderColor: colors.primary,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    transform: [{ rotate: '45deg' }],
  },
  ribbonTailRight: {
    position: 'absolute',
    right: -8,
    top: 8,
    width: 10,
    height: 10,
    backgroundColor: colors.red,
    borderColor: colors.primary,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    transform: [{ rotate: '-45deg' }],
  },
  // Estrellas
  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 6,
  },
  sparkle1: {
    top: 6,
    right: -2,
    backgroundColor: colors.yellowPrimary,
  },
  sparkle2: {
    bottom: 10,
    left: -4,
    backgroundColor: colors.bluePrimary,
  },
  sparkle3: {
    bottom: 2,
    right: 8,
    backgroundColor: colors.yellowDark,
  },
});

export default AdsButton;



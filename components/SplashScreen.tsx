import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SplashScreenProps {
  onLoadingComplete: () => void;
}

export default function SplashScreen({ onLoadingComplete }: SplashScreenProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    // Animación de entrada del logo
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    // Animación de flotación del glow
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );
    glowAnimation.start();

    // Simulación de carga más simple y confiable
    let currentProgress = 0;
    const loadingInterval = setInterval(() => {
      const increment = Math.floor(Math.random() * 15 + 8);
      currentProgress = Math.min(100, currentProgress + increment);
      
      setProgress(currentProgress);
      
      Animated.timing(progressAnim, {
        toValue: currentProgress,
        duration: 200,
        useNativeDriver: false,
      }).start();

      if (currentProgress >= 100) {
        clearInterval(loadingInterval);
        // Pequeño delay antes del fade out
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            onLoadingComplete();
          });
        }, 300);
      }
    }, 200);

    // Timeout de seguridad - máximo 5 segundos
    const safetyTimeout = setTimeout(() => {
      console.log('Splash screen timeout - forcing completion');
      onLoadingComplete();
    }, 5000);

    return () => {
      clearInterval(loadingInterval);
      clearTimeout(safetyTimeout);
    };
  }, [onLoadingComplete]);

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const logoTranslateY = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 0],
  });

  const glowTranslateY = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Fondo: sin overlay/gradiente. Hereda el fondo del contenedor padre. */}
        
        {/* Efecto glow de fondo */}
        <Animated.View
          style={[
            styles.glow,
            {
              transform: [
                { translateY: glowTranslateY },
                { scale: glowScale },
              ],
            },
          ]}
        />
        
        {/* Contenido principal */}
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { translateY: logoTranslateY },
                  { scale: logoScale },
                ],
              },
            ]}
          >
            <Image
              source={require('../assets/LOGO-PNG.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressBar,
                  { width: progressWidth },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              Cargando… {progress}%
            </Text>
            <Text style={styles.subtitle}>
              Calle, Cultura y Criollísimo
            </Text>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    bottom: -100,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 20,
  },
  progressContainer: {
    width: '100%',
  },
  progressTrack: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 0,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 0,
    elevation: 0,
  },
  progressLabel: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  subtitle: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
  },
});

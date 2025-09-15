import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Animated } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SplashScreenProps {
  onLoadingComplete: () => void;
  renderBackground?: boolean;
}

export default function SplashScreen({ onLoadingComplete, renderBackground = true }: SplashScreenProps) {
  const [progress, setProgress] = React.useState(0);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Simular carga real ~2.5s con progreso suave
    const durationMs = 2500;
    let rafId: number | null = null;
    const start = Date.now();

    const loop = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);
      if (elapsed < durationMs) {
        rafId = requestAnimationFrame(loop);
      } else {
        setProgress(100);
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onLoadingComplete());
      }
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [onLoadingComplete]);

  const progressWidth = `${progress}%`;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {renderBackground ? (
        <ImageBackground
          source={require('../assets/FONDO2.png')}
          style={styles.container}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(255, 248, 225, 0.85)", "rgba(255, 248, 225, 0.95)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.scrim}
          />

          <Animated.View style={[styles.content, { opacity: fadeAnim }] }>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/MALANDRARIO SIN FONDO.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${progress}%` as any }]} />
              </View>
              <Text style={styles.progressLabel}>Cargando… {progress}%</Text>
              <Text style={styles.subtitle}>Calle, Cultura y Criollísimo</Text>
            </View>
          </Animated.View>
        </ImageBackground>
      ) : (
        <>
          <LinearGradient
            colors={["rgba(255, 248, 225, 0.85)", "rgba(255, 248, 225, 0.95)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.scrim}
          />
          <Animated.View style={[styles.contentOverlay, { opacity: fadeAnim }] }>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/MALANDRARIO SIN FONDO.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${progress}%` as any }]} />
              </View>
              <Text style={styles.progressLabel}>Cargando… {progress}%</Text>
              <Text style={styles.subtitle}>Calle, Cultura y Criollísimo</Text>
            </View>
          </Animated.View>
        </>
      )}
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
    width: '100%',
    height: '100%',
  },
  scrim: { ...StyleSheet.absoluteFillObject },
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
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 460,
    height: 220,
  },
  progressContainer: {
    width: '100%',
  },
  progressTrack: {
    height: 22,
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    borderWidth: 3,
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

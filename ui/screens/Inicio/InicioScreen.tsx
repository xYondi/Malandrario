import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import BottomNav, { sampleBottomNavItems } from '../../../components/BottomNav';
import AdsCard from '../../../components/AdsCard';
import Hud from './components/Hud';
import HeroSection from './components/HeroSection';
import AdsButton from './components/AdsButton';
import CollectionsChips from './components/CollectionsChips';
import ContributeButton from './components/ContributeButton';
import { SafeAreaView } from 'react-native-safe-area-context';
 
import { colors } from '../../theme/colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

interface CollectionItem {
  label: string;
  icon: string;
}

const collections: ReadonlyArray<CollectionItem> = [
  { label: 'Jerga básica', icon: '🎯' },
  { label: 'Calle y broma', icon: '🚦' },
  { label: 'Memes y virales', icon: '😂' },
  { label: 'Criollísimo clásico', icon: '📜' },
] as const;

export const InicioScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showAdsCard, setShowAdsCard] = useState<boolean>(false);
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [showLeftFade, setShowLeftFade] = useState<boolean>(true);
  const [showRightFade, setShowRightFade] = useState<boolean>(true);
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const playButtonAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  const selected = useMemo<CollectionItem>(() => collections[selectedIndex], [selectedIndex]);

  const prevCollection = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIndex((prev) => (prev - 1 + collections.length) % collections.length);
  };

  const nextCollection = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIndex((prev) => (prev + 1) % collections.length);
  };

  const startMode = (modeKey: string): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Navegar según el modo seleccionado
    if (modeKey === 'jerga-basica') {
      // Iniciar animación de salida en paralelo a la navegación para solaparla con el slide horizontal del stack
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -14,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      navigation.navigate('JergaBasica' as never);
    } else {
      console.log('startMode', modeKey);
    }
  };

  //

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollX = contentOffset.x;
    const contentWidth = contentSize.width;
    const screenWidth = layoutMeasurement.width;
    
    setScrollOffset(scrollX);
    
    // Mostrar fade izquierdo siempre (siempre visible)
    setShowLeftFade(true);
    
    // Mostrar fade derecho si no hemos llegado al final
    setShowRightFade(scrollX < contentWidth - screenWidth - 10);
  };

  const goAportar = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('goAportar');
  };

  const handlePurchase = (): void => {
    console.log('Purchase ads removal for $4.99');
    setShowAdsCard(false);
  };

  const handleWatchAd = (): void => {
    console.log('Watch ad for free access');
    setShowAdsCard(false);
  };

  const goDiccionario = (): void => {
    console.log('goDiccionario');
  };

  const goRankings = (): void => {
    console.log('goRankings');
  };

  useEffect(() => {
    // Animación shimmer del nivel
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2600,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    // Animación del botón de jugar (pulso muy sutil)
    const playButtonAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(playButtonAnim, {
          toValue: 1.02,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(playButtonAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    playButtonAnimation.start();

    // Animación del borde del botón de jugar
    const borderAnimation = Animated.loop(
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      })
    );
    borderAnimation.start();

    return () => {
      shimmerAnimation.stop();
      playButtonAnimation.stop();
      borderAnimation.stop();
    };
  }, [shimmerAnim, fadeAnim, slideAnim, scaleAnim, playButtonAnim, borderAnim]);

  // Efecto para reanimar cuando se regresa a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      // Resetear animaciones cuando se regresa a la pantalla
      fadeAnim.setValue(0);
      slideAnim.setValue(12);
      scaleAnim.setValue(0.985);

      // Entrada suave coordinada post-splash
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 320,
          delay: 80,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          delay: 80,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 350,
          delay: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, slideAnim, scaleAnim])
  );


  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {/* Scrim sobre el fondo global */}
      <LinearGradient
        colors={["rgba(255, 248, 225, 0.85)", "rgba(255, 248, 225, 0.95)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.scrim}
      />

        {/* Contenido principal */}
        <Animated.View style={[
          styles.mainContent,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }
        ]}>
        {/* HUD superior */}
        <Hud shimmerAnim={shimmerAnim} slideAnim={slideAnim} />

        {/* Hero con personaje con selector superpuesto a la altura de los pies */}
        <HeroSection 
          selected={selected}
          selectedIndex={selectedIndex}
          collections={collections}
          prevCollection={prevCollection}
          nextCollection={nextCollection}
          playButtonAnim={playButtonAnim}
          onPlay={() => startMode('jerga-basica')}
        />

        {/* Botón de Ads mejorado */}
        <AdsButton onPress={() => setShowAdsCard(true)} />

        <View style={styles.scroll}>
          {/* Chips de colecciones */}
          <View style={styles.collectionsHeader}>
            <Text style={styles.collectionsTitle}>Colecciones pa’ vacilar</Text>
            <Text style={[styles.collectionsSubtitle, styles.collectionsSubtitleEmphasis]}>Explora temas de calle, memes y clásico</Text>
          </View>
          <CollectionsChips 
            collections={collections}
            onScroll={handleScroll}
            showLeftFade={showLeftFade}
            showRightFade={showRightFade}
          />

          {/* Botón Aportar mejorado */}
          <ContributeButton onPress={goAportar} />
        </View>
        </Animated.View>
        {/* Footer navegación como componente */}
        <View style={{ transform: [{ translateY: 28 }] }}>
          <BottomNav items={sampleBottomNavItems} />
        </View>

        {/* Ads Card Modal */}
        <AdsCard
          visible={showAdsCard}
          onClose={() => setShowAdsCard(false)}
          onPurchase={handlePurchase}
          onWatchAd={handleWatchAd}
        />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrim: { ...StyleSheet.absoluteFillObject },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  scroll: { flex: 1, backgroundColor: 'transparent' },

  collectionsHeader: {
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 8,
    paddingLeft: 4,
    alignSelf: 'flex-start',
  },
  collectionsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.2,
    marginTop: 0,
  },
  collectionsSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  collectionsSubtitleEmphasis: {
  },
});

export default InicioScreen;



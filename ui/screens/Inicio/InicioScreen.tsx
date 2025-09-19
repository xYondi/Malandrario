import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import BottomNav, { sampleBottomNavItems, BottomNavItem } from '../../../components/BottomNav';
import AdsCard from '../../../components/AdsCard';
import Hud from './components/Hud';
import HeroSection from './components/HeroSection';
import AdsButton from './components/AdsButton';
// import CollectionsChips from './components/CollectionsChips'; // OCULTADO TEMPORALMENTE
// import ContributeButton from './components/ContributeButton'; // OCULTADO TEMPORALMENTE
import { SafeAreaView } from 'react-native-safe-area-context';
 
import { colors } from '../../theme/colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { UserProgressService } from '../../../services/UserProgressService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Colecciones removidas temporalmente - se pueden restaurar más tarde
// interface CollectionItem {
//   label: string;
//   icon: string;
// }

// const collections: ReadonlyArray<CollectionItem> = [
//   { label: 'Jerga básica', icon: '🎯' },
//   { label: 'Calle y broma', icon: '🚦' },
//   { label: 'Memes y virales', icon: '😂' },
//   { label: 'Criollísimo clásico', icon: '📜' },
// ] as const;

export const InicioScreen: React.FC = () => {
  const navigation = useNavigation();
  // const [selectedIndex, setSelectedIndex] = useState<number>(0); // Removido temporalmente
  const [showAdsCard, setShowAdsCard] = useState<boolean>(false);
  // const [scrollOffset, setScrollOffset] = useState<number>(0); // Removido temporalmente
  // const [showLeftFade, setShowLeftFade] = useState<boolean>(true); // Removido temporalmente
  // const [showRightFade, setShowRightFade] = useState<boolean>(true); // Removido temporalmente
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userGems, setUserGems] = useState<number>(0);
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const playButtonAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  // const selected = useMemo<CollectionItem>(() => collections[selectedIndex], [selectedIndex]); // Removido temporalmente

  // const prevCollection = (): void => {
  //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  //   setSelectedIndex((prev) => (prev - 1 + collections.length) % collections.length);
  // };

  // const nextCollection = (): void => {
  //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  //   setSelectedIndex((prev) => (prev + 1) % collections.length);
  // };

  const startMode = (modeKey: string): void => {
    console.log('startMode llamado con:', modeKey);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Navegar según el modo seleccionado
    if (modeKey === 'jerga-basica') {
      console.log('Navegando a JergaBasica...');
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
      console.log('Ejecutando navigation.navigate...');
      navigation.navigate('JergaBasica' as never);
      console.log('navigation.navigate ejecutado');
    } else {
      console.log('startMode', modeKey);
    }
  };

  //

  // const handleScroll = (event: any) => {
  //   const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
  //   const scrollX = contentOffset.x;
  //   const contentWidth = contentSize.width;
  //   const screenWidth = layoutMeasurement.width;
    
  //   setScrollOffset(scrollX);
    
  //   // Mostrar fade izquierdo siempre (siempre visible)
  //   setShowLeftFade(true);
    
  //   // Mostrar fade derecho si no hemos llegado al final
  //   setShowRightFade(scrollX < contentWidth - screenWidth - 10);
  // };

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

  const goToStore = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Tienda' as never);
  };

  // Items del bottom nav con navegación personalizada
  const bottomNavItems: ReadonlyArray<BottomNavItem> = useMemo(() => [
    {
      key: 'home',
      label: 'Inicio',
      icon: <MaterialCommunityIcons name="home" size={28} color={colors.primary} />,
      isActive: true,
    },
    {
      key: 'book',
      label: 'Diccionario',
      icon: <Ionicons name="book-outline" size={28} color={colors.gray} />,
      disabled: true,
    },
    {
      key: 'medal',
      label: 'Logros',
      icon: <Ionicons name="ribbon-outline" size={28} color={colors.gray} />,
      disabled: true,
    },
    {
      key: 'games',
      label: 'Juegos',
      icon: <MaterialCommunityIcons name="gamepad-square-outline" size={28} color={colors.gray} />,
      disabled: true,
    },
    {
      key: 'shop',
      label: 'Tienda',
      icon: <MaterialCommunityIcons name="storefront-outline" size={28} color={colors.primary} />,
      badge: 1,
      onPress: goToStore,
    },
  ], [navigation]);

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

  // Cargar progreso del usuario
  const loadUserProgress = React.useCallback(async () => {
    try {
      const progress = await UserProgressService.getUserProgress();
      setUserLevel(progress.currentLevel);
      setUserGems(progress.gemsEarned);
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  }, []);

  // Efecto para reanimar cuando se regresa a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      // Cargar progreso del usuario cada vez que se enfoca la pantalla
      loadUserProgress();
      
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
    }, [fadeAnim, slideAnim, scaleAnim, loadUserProgress])
  );


  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {/* Scrim más sutil para que se vea mejor el Liquid Glass */}
      <LinearGradient
        colors={["rgba(255, 248, 225, 0.4)", "rgba(255, 248, 225, 0.6)"]}
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
        <Hud shimmerAnim={shimmerAnim} slideAnim={slideAnim} userLevel={userLevel} userGems={userGems} />

        {/* Hero con personaje y contenido del juego */}
        <HeroSection 
          playButtonAnim={playButtonAnim}
          onPlay={() => startMode('jerga-basica')}
          userLevel={userLevel}
        />

        {/* Botón de Ads mejorado */}
        <AdsButton onPress={() => setShowAdsCard(true)} />

        <View style={styles.scroll}>
          {/* Chips de colecciones - OCULTADO TEMPORALMENTE */}
          {/* <View style={styles.collectionsHeader}>
            <Text style={styles.collectionsTitle}>Colecciones pa' vacilar</Text>
            <Text style={[styles.collectionsSubtitle, styles.collectionsSubtitleEmphasis]}>Explora temas de calle, memes y clásico</Text>
          </View>
          <CollectionsChips 
            collections={collections}
            onScroll={handleScroll}
            showLeftFade={showLeftFade}
            showRightFade={showRightFade}
          /> */}

          {/* Botón Aportar mejorado - OCULTADO TEMPORALMENTE */}
          {/* <ContributeButton onPress={goAportar} /> */}
        </View>
        </Animated.View>
        {/* Footer navegación como componente */}
        <View style={{ transform: [{ translateY: 28 }] }}>
          <BottomNav items={bottomNavItems} />
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



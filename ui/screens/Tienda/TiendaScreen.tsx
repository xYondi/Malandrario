import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  Alert,
  ImageBackground,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { UserProgressService } from '../../../services/UserProgressService';
import StoreHeader from './components/StoreHeader';
import StoreItem from './components/StoreItem';
import NoAdsCard from './components/NoAdsCard';
import FreeItem from './components/FreeItem';
import CartoonSection from './components/CartoonSection';

export const TiendaScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute() as any;
  const [userGems, setUserGems] = useState<number>(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollRef = useRef<ScrollView>(null);
  const pistolitasAnchorY = useRef<number>(0);
  const [pendingScrollToPistolitas, setPendingScrollToPistolitas] = useState<boolean>(false);
  const programmaticScrollY = useRef(new Animated.Value(0)).current;
  const topFadeOpacity = useRef(new Animated.Value(0)).current;
  const bottomFadeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserGems();
    
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Si venimos desde HUD con sección a enfocar, marcar scroll pendiente
    const sec = (route?.params as any)?.section;
    if (sec === 'pistolitas') {
      console.log('[Tienda] route param section=pistolitas detected on mount');
      setPendingScrollToPistolitas(true);
    }

    // Sincronizar Animated scrollY con ScrollView para un scroll más suave
    const sub = programmaticScrollY.addListener(({ value }) => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: value, animated: false });
      }
    });
    return () => {
      programmaticScrollY.removeListener(sub);
    };
  }, []);

  // Al enfocar la pantalla, intentar hacer scroll si aplica
  useFocusEffect(
    React.useCallback(() => {
      const sec = (route?.params as any)?.section;
      if (sec === 'pistolitas') {
        console.log('[Tienda] focus effect, trying to scroll to pistolitas. anchorY=', pistolitasAnchorY.current);
        if (pistolitasAnchorY.current > 0 && scrollRef.current) {
          setTimeout(() => {
            const target = Math.max(pistolitasAnchorY.current - 24, 0);
            console.log('[Tienda] smooth scrolling to', target);
            programmaticScrollY.stopAnimation();
            Animated.timing(programmaticScrollY, {
              toValue: target,
              duration: 700,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false,
            }).start();
            setPendingScrollToPistolitas(false);
          }, 100);
        } else {
          console.log('[Tienda] anchor not ready, setting pendingScrollToPistolitas');
          setPendingScrollToPistolitas(true);
        }
      }
      return () => {};
    }, [route?.params])
  );

  const loadUserGems = async () => {
    try {
      const progress = await UserProgressService.getUserProgress();
      setUserGems(progress.gemsEarned);
    } catch (error) {
      console.error('Error loading user gems:', error);
    }
  };

  const handlePurchaseGems = async (amount: number, cost: string) => {
    Alert.alert(
      '💰 Comprar Pistolitas',
      `¿Quieres comprar ${amount} pistolitas por ${cost}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comprar',
          onPress: async () => {
            try {
              // Simular compra exitosa
              await UserProgressService.updateGems(amount);
              await loadUserGems();
              
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('🎉 ¡Compra Exitosa!', `Has recibido ${amount} pistolitas.`);
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudo completar la compra. Intenta de nuevo.');
            }
          },
        },
      ]
    );
  };

  const handleDailyReward = async () => {
    try {
      await UserProgressService.updateGems(5);
      await loadUserGems();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('🎁 ¡Recompensa Diaria!', 'Has recibido 5 pistolitas gratis.');
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo obtener la recompensa. Intenta de nuevo.');
    }
  };

  const handleWatchAd = async () => {
    Alert.alert(
      '📺 Ver Anuncio',
      '¿Quieres ver un anuncio para ganar 25 pistolitas gratis?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ver Anuncio',
          onPress: async () => {
            try {
              // Simular ver anuncio
              await UserProgressService.updateGems(25);
              await loadUserGems();
              
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('🎉 ¡Anuncio Completado!', 'Has ganado 25 pistolitas.');
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudo completar el anuncio. Intenta de nuevo.');
            }
          },
        },
      ]
    );
  };

  const handleInviteFriend = () => {
    Alert.alert(
      '👥 Invitar Amigo',
      '¡Invita a un amigo y ambos ganarán 50 pistolitas!',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Invitar',
          onPress: () => {
            // Simular invitación (aquí se integraría con sistema de referidos)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('📤 ¡Invitación Enviada!', 'Cuando tu amigo se registre, ambos recibirán 50 pistolitas.');
          },
        },
      ]
    );
  };

  const handleRemoveAds = () => {
    Alert.alert(
      '🚫 Quitar Anuncios',
      '¿Quieres quitar los anuncios permanentemente por $5.99?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comprar',
          onPress: () => {
            // Simular compra de quitar anuncios
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('🎉 ¡Compra Exitosa!', 'Los anuncios han sido removidos permanentemente.');
          },
        },
      ]
    );
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {/* Fondo absoluto para cubrir toda la pantalla como en Inicio */}
      <ImageBackground
        source={require('../../../assets/FONDO2.png')}
        resizeMode="cover"
        style={styles.background}
      >
        <LinearGradient
          colors={["rgba(255, 248, 225, 0.35)", "rgba(255, 248, 225, 0.5)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.scrim}
        />
        <View style={[styles.overlayContent, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {/* Header */}
          <StoreHeader
            userGems={userGems}
            onBack={goBack}
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
          />

          {/* Contenido */}
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false}
              ref={scrollRef}
              onScroll={(e) => {
                const y = e.nativeEvent.contentOffset.y;
                const contentH = e.nativeEvent.contentSize.height;
                const viewH = e.nativeEvent.layoutMeasurement.height;
                const atTop = y <= 2;
                const atBottom = y + viewH >= contentH - 2;
                Animated.timing(topFadeOpacity, { toValue: atTop ? 0 : 1, duration: 180, useNativeDriver: true }).start();
                Animated.timing(bottomFadeOpacity, { toValue: atBottom ? 0 : 1, duration: 180, useNativeDriver: true }).start();
              }}
              scrollEventThrottle={16}
            >
            <CartoonSection title="Gratis" color={colors.primary}>
              <View style={styles.cardsRow}
                accessibilityRole="list"
                accessibilityLabel="Recompensas gratuitas"
              >
                <View style={styles.cardCell}>
                  <FreeItem
                    title="Diario"
                    subtitle="Cada 24 horas"
                    amount={5}
                    onClaim={handleDailyReward}
                    isAvailable={true}
                    buttonText="Gratis"
                  />
                </View>
                <View style={styles.cardCell}>
                  <FreeItem
                    title="Ver Anuncio"
                    subtitle="Gana viendo ads"
                    amount={25}
                    onClaim={handleWatchAd}
                    isAvailable={true}
                    buttonText="📺 Ad"
                  />
                </View>
                <View style={styles.cardCell}>
                  <FreeItem
                    title="Invitar Amigo"
                    subtitle="Ambos ganan"
                    amount={50}
                    onClaim={handleInviteFriend}
                    isAvailable={true}
                    buttonText="Invitar"
                  />
                </View>
              </View>
            </CartoonSection>

            {/* Anchor absoluto antes de la sección Pistolitas */}
            <View onLayout={(e) => {
              pistolitasAnchorY.current = e.nativeEvent.layout.y;
              console.log('[Tienda] pistolitas ANCHOR onLayout y=', pistolitasAnchorY.current);
              if (pendingScrollToPistolitas && scrollRef.current) {
                setTimeout(() => {
                  const targetY = Math.max(pistolitasAnchorY.current - 12, 0);
                  console.log('[Tienda] pending smooth scroll (anchor), to', targetY);
                  programmaticScrollY.stopAnimation();
                  Animated.timing(programmaticScrollY, {
                    toValue: targetY,
                    duration: 700,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: false,
                  }).start();
                  setPendingScrollToPistolitas(false);
                }, 80);
              }
            }} />

            <CartoonSection title="Pistolitas" color={colors.primary}>
              <View style={styles.cardsRow}
                accessibilityRole="list"
                accessibilityLabel="Paquetes de pistolitas"
              >
                <View style={styles.cardCell}>
                  <StoreItem
                    title="Básico"
                    subtitle="Para empezar"
                    amount={150}
                    price="$4.99"
                    onPurchase={() => handlePurchaseGems(150, '$4.99')}
                  />
                </View>
                <View style={styles.cardCell}>
                  <StoreItem
                    title="Popular"
                    subtitle="El favorito"
                    amount={300}
                    price="$7.99"
                    originalPrice="$9.99"
                    discount="-20%"
                    onPurchase={() => handlePurchaseGems(300, '$7.99')}
                    isPopular={true}
                  />
                </View>
                <View style={styles.cardCell}>
                  <StoreItem
                    title="Arsenal"
                    subtitle="Máximo poder"
                    amount={500}
                    price="$12.99"
                    originalPrice="$15.99"
                    discount="-19%"
                    onPurchase={() => handlePurchaseGems(500, '$12.99')}
                    isBestValue={true}
                  />
                </View>
              </View>
            </CartoonSection>


            <CartoonSection title="Sin Anuncios" color={colors.primary}>
              <View style={{ flex: 1 }}
                accessibilityRole="summary"
                accessibilityLabel="Comprar quitar anuncios"
              >
                <NoAdsCard onPurchase={handleRemoveAds} />
              </View>
            </CartoonSection>

            {/* Espacio inferior */}
            <View style={{ height: 40 }} />
            </ScrollView>
            {/* Fades superior/inferior suaves y redondeados */}
            <Animated.View pointerEvents="none" style={[styles.edgeFadeTop, { opacity: topFadeOpacity }] }>
              <LinearGradient
                colors={[colors.background + 'CC', colors.background + '00'] as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <Animated.View pointerEvents="none" style={[styles.edgeFadeBottom, { opacity: bottomFadeOpacity }] }>
              <LinearGradient
                colors={[colors.background + '00', colors.background + 'CC'] as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </Animated.View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayContent: { flex: 1 },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  cartoonSectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 10,
    shadowColor: '#D1D5DB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 8,
    marginTop: -10,
    overflow: 'visible',
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    columnGap: 12,
    paddingHorizontal: 2,
    overflow: 'visible',
  },
  cardCell: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 150,
  },
  sectionBanner: {
    backgroundColor: '#EF4444',
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 4,
  },
  bannerCartoon: {
    transform: [{ rotate: '-2deg' }],
    marginBottom: 12,
    alignSelf: 'flex-start',
    marginLeft: 8,
    paddingHorizontal: 18,
  },
  bannerText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  edgeFadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  edgeFadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
});

export default TiendaScreen;

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, StatusBar, Dimensions, Animated } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import BottomNav, { sampleBottomNavItems } from '../../../components/BottomNav';
import AdsCard from '../../../components/AdsCard';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const playButtonAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  const selected = useMemo<CollectionItem>(() => collections[selectedIndex], [selectedIndex]);

  const prevCollection = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSelectedIndex((prev) => (prev - 1 + collections.length) % collections.length);
  };

  const nextCollection = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSelectedIndex((prev) => (prev + 1) % collections.length);
  };

  const startMode = (modeKey: string): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Navegar según el modo seleccionado
    if (modeKey === 'jerga-basica') {
      // Animación de salida antes de navegar
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Navegar a Jerga Básica
        navigation.navigate('JergaBasica' as never);
      });
    } else {
      console.log('startMode', modeKey);
    }
  };

  // Función para detectar si un chip está parcialmente visible
  const isChipPartiallyVisible = (index: number) => {
    const chipWidth = 120;
    const screenWidth = Dimensions.get('window').width;
    const chipLeft = index * chipWidth;
    const chipRight = chipLeft + chipWidth;
    
    const visibleLeft = scrollOffset;
    const visibleRight = scrollOffset + screenWidth;
    
    // El chip está parcialmente visible si está cortado por algún lado
    return (chipLeft < visibleLeft && chipRight > visibleLeft) || 
           (chipLeft < visibleRight && chipRight > visibleRight);
  };

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
    // Animación de entrada sutil
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación shimmer del nivel
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    // Animación del botón de jugar (pulso sutil)
    const playButtonAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(playButtonAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(playButtonAnim, {
          toValue: 1,
          duration: 2000,
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
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      scaleAnim.setValue(1);
    }, [fadeAnim, slideAnim, scaleAnim])
  );


  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Fondo transparente: usa el amarillo del contenedor de la app */}

      {/* Contenido principal */}
      <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
        {/* HUD superior */}
        <Animated.View style={[styles.hudRow, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.hudLeft}>
              <TouchableOpacity style={styles.ringBtn} onPress={() => console.log('settings')}>
                <MaterialCommunityIcons name="cog" size={24} color="#1E3A8A" />
              </TouchableOpacity>
              <View style={[styles.bubble, { backgroundColor: '#FFFFFF', borderColor: '#FACC15' }, styles.levelContainer]}>
                <Animated.View 
                  style={[
                    styles.shimmerEffect,
                    {
                      opacity: shimmerAnim,
                      transform: [{
                        translateX: shimmerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-100, 100],
                        })
                      }]
                    }
                  ]}
                />
                <Text style={[styles.bubbleTextStrong, { color: '#1E3A8A' }]}>Nivel 2</Text>
              </View>
            </View>
          <View style={styles.hudRight}>
            <View style={[styles.bubble, styles.bubblePurple, { backgroundColor: '#FFFFFF', borderColor: '#FACC15' }]}>
              <Text style={styles.plus}>+</Text>
              <Text style={styles.bubbleText}>0</Text>
              <Ionicons name="ticket" size={16} color="#1E3A8A" />
            </View>
            <View style={[styles.bubble, styles.bubbleBlue, { backgroundColor: '#FFFFFF', borderColor: '#FACC15' }]}>
              <Text style={styles.plus}>+</Text>
              <Text style={styles.bubbleText}>5</Text>
              <FontAwesome5 name="gem" size={16} color="#1E3A8A" />
            </View>
          </View>
        </Animated.View>

        {/* Hero con personaje con selector superpuesto a la altura de los pies */}
        <Animated.View style={[styles.heroSection, { transform: [{ translateY: slideAnim }] }]}>
          <Image source={require('../../../assets/PERSONAJE.png')} style={styles.heroImg} />

          <View style={styles.selectorOverlay} pointerEvents="box-none">
            <View style={styles.selectorWrap}>
              <View style={styles.selectorDots}>
                {collections.map((_, i) => (
                  <View key={i} style={[styles.selectorDot, i === selectedIndex && styles.selectorDotActive]} />
                ))}
              </View>

              <LinearGradient colors={["#FFFFFF", "#FEF3C7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.selector}>
                <TouchableOpacity style={styles.arrowBtn} onPress={prevCollection}>
                  <Text style={styles.arrowText}>◀</Text>
                </TouchableOpacity>
                <View style={styles.selectorContent}>
                  <LinearGradient colors={["#FDE68A", "#F59E0B"]} start={{ x: 0.3, y: 0.3 }} end={{ x: 0.8, y: 0.8 }} style={styles.selectorEmoji}>
                    <Text style={styles.selectorEmojiText}>{selected.icon}</Text>
                  </LinearGradient>
                  <Text style={styles.selectorLabel} numberOfLines={1}>
                    {selected.label}
                  </Text>
                </View>
                <TouchableOpacity style={styles.arrowBtn} onPress={nextCollection}>
                  <Text style={styles.arrowText}>▶</Text>
                </TouchableOpacity>
              </LinearGradient>

          <Animated.View style={{ transform: [{ scale: playButtonAnim }] }}>
            <TouchableOpacity style={styles.gameButtonMain} onPress={() => startMode('jerga-basica')}>
              <View style={styles.gameButtonShadow}>
                <View style={styles.gameButtonWhiteBorder}>
                  <View style={styles.gameButtonYellow}>
                    <Text style={styles.gameButtonText}>JUGAR</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
            </View>
          </View>
        </Animated.View>

        {/* Botón de Ads mejorado */}
        <TouchableOpacity 
          style={styles.adsButton} 
          onPress={() => setShowAdsCard(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.adsButtonGradient}
          >
            <MaterialCommunityIcons name="advertisements" size={24} color="#FFFFFF" />
            <View style={styles.adsProhibitionLine} />
          </LinearGradient>
        </TouchableOpacity>

        <Animated.ScrollView
          style={[styles.scroll, { transform: [{ translateY: slideAnim }] }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Chips de colecciones */}
          <View style={styles.collectionsHeader}>
            <Text style={styles.collectionsTitle}>Colecciones</Text>
          </View>
          <View style={styles.scrollContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.chipsRow}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {collections.map((c) => (
                <LinearGradient key={c.label} colors={["#FDE68A", "#F59E0B"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.collectionChipOuter}>
                  <TouchableOpacity style={styles.collectionChipInner} onPress={() => console.log('openCollection', c.label)}>
                    <LinearGradient colors={["#FDE68A", "#F59E0B"]} start={{ x: 0.3, y: 0.3 }} end={{ x: 0.8, y: 0.8 }} style={styles.chipEmoji}>
                      <Text style={styles.chipEmojiText}>{c.icon}</Text>
                    </LinearGradient>
                    <Text style={styles.collectionChipText}>{c.label}</Text>
                  </TouchableOpacity>
                </LinearGradient>
              ))}
            </ScrollView>
            
            {/* Fade izquierdo - solo cuando hay contenido a la izquierda */}
            {showLeftFade && (
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.8)', 
                  'rgba(255, 255, 255, 0.6)', 
                  'rgba(255, 255, 255, 0.4)', 
                  'rgba(255, 255, 255, 0.2)',
                  'rgba(255, 255, 255, 0.1)',
                  'rgba(255, 255, 255, 0)'
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.containerFadeLeft}
              />
            )}
            
            {/* Fade derecho - solo cuando hay contenido a la derecha */}
            {showRightFade && (
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0)', 
                  'rgba(255, 255, 255, 0.1)',
                  'rgba(255, 255, 255, 0.2)', 
                  'rgba(255, 255, 255, 0.4)', 
                  'rgba(255, 255, 255, 0.6)',
                  'rgba(255, 255, 255, 0.8)'
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.containerFadeRight}
              />
            )}
          </View>

          {/* Botón Aportar mejorado */}
          <View style={styles.contributeBtnOuter}>
            <TouchableOpacity style={styles.contributeBtnInner} onPress={goAportar}>
              <View style={styles.contributeIconContainer}>
                <MaterialCommunityIcons name="lightbulb-on" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.contributeText}>Aportar una palabra</Text>
              <View style={styles.contributeArrow}>
                <Ionicons name="arrow-forward" size={16} color="#1E3A8A" />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
      </Animated.View>

      {/* Footer navegación como componente */}
      <BottomNav items={sampleBottomNavItems} />

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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  hudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    position: 'relative',
    top: -30,
  },
  hudLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hudRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ringBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#FCD34D',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  ringBtnIcon: {
    fontSize: 20,
  },
  bubble: {
    borderWidth: 3,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bubbleYellow: { 
    borderColor: '#F59E0B',
  },
  levelContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(252, 204, 21, 0.3)',
    width: 50,
    height: '100%',
  },
  bubblePurple: { borderColor: '#FBCFE8' },
  bubbleBlue: { borderColor: '#BAE6FD' },
  bubbleTextEmoji: { fontSize: 16 },
  bubbleTextStrong: { fontWeight: 'bold' },
  bubbleText: { fontSize: 14 },
  plus: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1D4ED8',
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '900',
    fontSize: 12,
    overflow: 'hidden',
  },

  heroSection: {
    height: (screenWidth * 382) / 412,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 32,
    alignSelf: 'center',
    position: 'relative',
  },
  heroImg: {
    width: (screenWidth * 382) / 412,
    height: (screenWidth * 382) / 412,
    resizeMode: 'contain',
    marginTop: -130,
  },
  adsButton: {
    position: 'absolute',
    right: 20,
    top: 60,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  adsButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  adsProhibitionLine: {
    position: 'absolute',
    top: '50%',
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: '#EF4444',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },

  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 24, backgroundColor: 'transparent', paddingHorizontal: 16 },

  selectorWrap: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 0,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  selectorOverlay: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#F3F4F6',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  arrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  arrowText: { 
    fontSize: 20, 
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  selectorContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#fff',
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  selectorEmoji: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
  },
  selectorEmojiText: { fontSize: 16 },
  selectorLabel: {
    fontWeight: '900',
    letterSpacing: 0.3,
    flexShrink: 1,
    fontSize: 14,
  },
  selectorDots: { 
    flexDirection: 'row', 
    gap: 12, 
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  selectorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  selectorDotActive: {
    backgroundColor: '#FACC15',
    borderColor: '#EAB308',
    shadowColor: '#FACC15',
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  gameButtonMain: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameButtonShadow: {
    backgroundColor: '#D97706',
    borderRadius: 20,
    paddingTop: 4,
    paddingLeft: 4,
    paddingRight: 0,
    paddingBottom: 0,
  },
  gameButtonWhiteBorder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 3,
  },
  gameButtonYellow: {
    backgroundColor: '#FACC15',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  gameButtonText: {
    fontWeight: '900',
    color: '#1E3A8A',
    fontSize: 16,
    letterSpacing: 1,
  },

  collectionsHeader: {
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: -8,
    paddingLeft: 4,
  },
  collectionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: 10,
  },
  scrollContainer: {
    position: 'relative',
    overflow: 'hidden',
    height: 60, // Altura fija para el contenedor
    borderRadius: 30,
  },
  chipsRow: { 
    paddingLeft: 0,
    paddingRight: 20, 
    gap: 8,
  },
  containerFadeLeft: {
    position: 'absolute',
    top: 0,
    left: -50,
    bottom: 0,
    width: 120,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    pointerEvents: 'none',
    zIndex: 1,
  },
  containerFadeRight: {
    position: 'absolute',
    top: 0,
    right: -80,
    bottom: 0,
    width: 250,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    pointerEvents: 'none',
    zIndex: 1,
  },
  collectionChipOuter: {
    borderRadius: 9999,
    padding: 4,
    borderWidth: 3,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  collectionChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chipEmoji: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  chipEmojiText: { fontSize: 14 },
  collectionChipText: {
    fontWeight: '900',
    color: '#1E3A8A',
    fontSize: 14,
  },

  contributeBtnOuter: {
    marginTop: 8,
    borderRadius: 24,
    padding: 4,
    borderWidth: 3,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  contributeBtnInner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  contributeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  contributeText: { 
    fontWeight: '900', 
    color: '#1E3A8A',
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  contributeArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    paddingBottom: 10,
    minHeight: 105,
  },
  footerNav: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 60,
  },
  footerIcon: { fontSize: 24 },
  footerLabel: { fontSize: 10, fontWeight: '600', color: '#374151', marginTop: 2 },
  footerItemBadgeWrap: { 
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default InicioScreen;



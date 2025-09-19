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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { UserProgressService } from '../../../services/UserProgressService';
import StoreHeader from './components/StoreHeader';
import StoreItem from './components/StoreItem';
import FreeItem from './components/FreeItem';

export const TiendaScreen: React.FC = () => {
  const navigation = useNavigation();
  const [userGems, setUserGems] = useState<number>(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
  }, []);

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
      
      <ImageBackground
        source={require('../../../assets/FONDO2.png')}
        resizeMode="cover"
        style={styles.background}
      >
        <LinearGradient
          colors={["rgba(255, 248, 225, 0.9)", "rgba(255, 248, 225, 0.95)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.scrim}
        />

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
          >
            {/* Sección Gratis con banner */}
            <View style={styles.section}>
              <View style={styles.sectionBanner}>
                <Text style={styles.bannerText}>Gratis</Text>
              </View>

              {/* Fila de 3 recompensas gratuitas */}
              <View style={styles.cardsRow}>
                <FreeItem
                  title="Diario"
                  subtitle="Cada 24 horas"
                  amount={5}
                  onClaim={handleDailyReward}
                  isAvailable={true}
                  buttonText="Gratis"
                />

                <FreeItem
                  title="Ver Anuncio"
                  subtitle="Gana viendo ads"
                  amount={25}
                  onClaim={handleWatchAd}
                  isAvailable={true}
                  buttonText="📺 Ad"
                />

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

            {/* Sección de Paquetes de Pistolitas con banner */}
            <View style={styles.section}>
              <View style={[styles.sectionBanner, { backgroundColor: '#8B5CF6' }]}>
                <Text style={styles.bannerText}>Pistolitas</Text>
              </View>

              {/* Fila de 3 tarjetas verticales */}
              <View style={styles.cardsRow}>
                <StoreItem
                  title="Básico"
                  subtitle="Para empezar"
                  amount={150}
                  price="$4.99"
                  onPurchase={() => handlePurchaseGems(150, '$4.99')}
                />

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


            {/* Espacio inferior */}
            <View style={{ height: 32 }} />
          </ScrollView>
        </Animated.View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    flex: 1,
  },
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 2,
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
  bannerText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});

export default TiendaScreen;

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { ALL_LEVELS, LevelNumber } from '../JergaBasica/data/questions';
import { UserProgressService, UserProgress } from '../../../services/UserProgressService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface LevelHubScreenProps {}

const LevelHubScreen: React.FC<LevelHubScreenProps> = () => {
  const navigation = useNavigation();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [xp, setXp] = useState<number>(0);
  const [xpToNext, setXpToNext] = useState<number>(100);
  const [xpAnim] = useState(new Animated.Value(0));
  const headerScale = useRef(new Animated.Value(0.9)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  
  const currentLevel: number = progress?.currentLevel ?? 1;
  const questions = ALL_LEVELS[currentLevel as LevelNumber] || [];
  const unlockedWords = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
    const set = new Set<string>();
    questions.forEach((q) => {
      if (typeof q.a === 'string') set.add(normalize(q.a));
      if (Array.isArray((q as any).accepted)) {
        (q as any).accepted.forEach((alt: string) => set.add(normalize(alt)));
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [questions]);
  // Recompensas del nivel anterior (preview divertida)
  const prevLevel: number = Math.max(1, currentLevel - 1);
  const prevWords = useMemo(() => {
    const list = ALL_LEVELS[prevLevel as LevelNumber] || [];
    const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
    const set = new Set<string>();
    list.forEach((q: any) => {
      if (typeof q.a === 'string') set.add(normalize(q.a));
      if (Array.isArray(q.accepted)) q.accepted.forEach((alt: string) => set.add(normalize(alt)));
    });
    return Array.from(set).slice(0, 12);
  }, [currentLevel]);

  const screenWidth = Dimensions.get('window').width;
  const horizontalPadding = 32; // container padding 16 * 2
  const wordCardWidth = Math.max(220, screenWidth - horizontalPadding);
  const minGems = questions.length * 2 + 10;
  const maxGems = questions.length >= 3 ? minGems + (questions.length - 2) : minGems;
  const completedCount = useMemo(() => progress?.totalCorrectAnswers ?? 0, [progress]);
  
  useEffect(() => {
    const load = async () => {
      const p = await UserProgressService.getUserProgress();
      setProgress(p);
      // Ejemplo simple de XP basada en correctas
      const currentXp = (p.totalCorrectAnswers % 100);
      setXp(currentXp);
      setXpToNext(100);
      xpAnim.setValue(0);
      Animated.timing(xpAnim, { toValue: currentXp / 100, duration: 600, useNativeDriver: false }).start();
    };
    load();
  }, [xpAnim]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(headerScale, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [headerOpacity, headerScale]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => (navigation as any).goBack?.()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
          <Text style={styles.backText}>Atrás</Text>
        </TouchableOpacity>
      </View>

      {/* Header Cartoon */}
      <Animated.View style={[styles.headerCard, { opacity: headerOpacity, transform: [{ scale: headerScale }] }]}> 
        <LinearGradient colors={[colors.secondary, '#FFE58A']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.headerGradient} />
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Nivel {currentLevel}</Text>
            <View style={styles.headerBadgeRow}>
              <View style={styles.headerBadge}>
                <Ionicons name="sparkles" size={14} color={colors.onSecondary} />
                <Text style={styles.headerBadgeText}>{xp}/{xpToNext} XP</Text>
              </View>
              <View style={styles.headerBadge}>
                <MaterialCommunityIcons name="pistol" size={14} color={colors.onSecondary} />
                <Text style={styles.headerBadgeText}>{progress?.gemsEarned ?? 0}</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.headerCircle}>
              <Text style={styles.headerCircleText}>{Math.min(100, Math.round((xp/xpToNext)*100))}%</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerProgressBg}>
          <Animated.View style={[styles.headerProgressFill, { width: xpAnim.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }) }]} />
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Recompensas/cartoon chips */}
        <View style={styles.cardSurface}>
        <Text style={styles.sectionTitle}>Tus recompensas</Text>
        <View style={styles.totalsRow}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Pistolitas totales</Text>
            <Text style={styles.totalValue}>{progress?.gemsEarned ?? 0}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Palabras del nivel</Text>
            <Text style={styles.totalValue}>{unlockedWords.length}</Text>
          </View>
        </View>
        {unlockedWords.length > 0 ? (
          <FlatList
            data={unlockedWords}
            keyExtractor={(item) => item}
            horizontal
            pagingEnabled
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            getItemLayout={(_, index) => ({ length: wordCardWidth, offset: wordCardWidth * index, index })}
            renderItem={({ item }) => (
              <View style={[styles.wordCard, { width: wordCardWidth }]}> 
                <View style={styles.wordCardBadge}>
                  <MaterialCommunityIcons name="bookmark-outline" size={16} color={colors.onSecondary} />
                  <Text style={styles.wordCardBadgeText}>Palabra del nivel</Text>
                </View>
                <Text style={styles.wordCardText}>{item}</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.emptyWords}>Aún no has desbloqueado palabras de este nivel.</Text>
        )}
        </View>

        {/* Recompensas del nivel anterior (carrusel divertido) */}
        <View style={styles.cardSurface}>
          <Text style={styles.sectionTitle}>Del nivel anterior</Text>
          <FlatList
            data={prevWords}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            renderItem={({ item, index }) => (
              <View style={[styles.rewardCard, index % 2 === 0 ? styles.rewardCardBlue : styles.rewardCardYellow]}>
                <Text style={styles.rewardEmoji}>{index % 2 === 0 ? '🎁' : '🏅'}</Text>
                <Text style={styles.rewardTitle}>{item}</Text>
                <Text style={styles.rewardDesc}>Palabra ganada</Text>
              </View>
            )}
            ListFooterComponent={() => (
              <View style={[styles.rewardCard, styles.rewardCardGem]}>
                <Text style={styles.rewardEmoji}>💎</Text>
                <Text style={styles.rewardTitle}>+{Math.max(2, Math.floor((progress?.gemsEarned ?? 0) * 0.05))}</Text>
                <Text style={styles.rewardDesc}>Bonus estimado</Text>
              </View>
            )}
          />
        </View>

        {/* Estadísticas */}
        <View style={styles.cardSurface}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Ionicons name="help-circle" size={14} color={colors.primary} /><Text style={styles.statPillText}>Preguntas: {questions.length}</Text></View>
          <View style={styles.statPill}><Ionicons name="cash-outline" size={14} color={colors.primary} /><Text style={styles.statPillText}>Gemas: {minGems}-{maxGems}</Text></View>
          <View style={styles.statPill}><Ionicons name="checkmark-circle" size={14} color={colors.primary} /><Text style={styles.statPillText}>Correctas totales: {progress?.totalCorrectAnswers ?? 0}</Text></View>
          <View style={styles.statPill}><Ionicons name="flame" size={14} color={colors.primary} /><Text style={styles.statPillText}>Racha máx: {progress?.streakRecord ?? 0}</Text></View>
        </View>
        </View>

        {/* Acciones */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => (navigation as any).navigate('JergaBasica')}>
            <Text style={styles.actionText}>Jugar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnOutline} onPress={() => (navigation as any).navigate('Inicio')}>
            <Text style={styles.actionTextOutline}>Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '900', color: colors.primary, marginBottom: 12 },
  headerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  headerGradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerLeft: {},
  headerTitle: { fontSize: 22, fontWeight: '900', color: colors.onSecondary, textShadowColor: 'rgba(0,0,0,0.15)', textShadowRadius: 2, textShadowOffset: { width: 0, height: 1 } },
  headerBadgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  headerBadgeText: { color: colors.onSecondary, fontWeight: '800', fontSize: 12 },
  headerRight: {},
  headerCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  headerCircleText: { color: colors.onSecondary, fontWeight: '900' },
  headerProgressBg: { height: 10, backgroundColor: 'rgba(255,255,255,0.35)', marginHorizontal: 16, marginBottom: 12, borderRadius: 8, overflow: 'hidden' },
  headerProgressFill: { height: 10, backgroundColor: colors.onSecondary },
  scrollContent: { paddingBottom: 24 },
  cardSurface: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: colors.textPrimary, marginBottom: 10 },
  rewardsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rewardPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  rewardText: { fontSize: 12, fontWeight: '800', color: colors.textSecondary },
  totalsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  totalBox: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  totalLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '700' },
  totalValue: { marginTop: 4, fontSize: 18, color: colors.textPrimary, fontWeight: '900' },
  wordsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wordChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: colors.border },
  wordChipText: { fontSize: 12, fontWeight: '800', color: colors.primary, textTransform: 'capitalize' },
  emptyWords: { fontSize: 12, color: colors.textSecondary },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  statPillText: { fontSize: 12, fontWeight: '800', color: colors.textSecondary },
  statLine: { fontSize: 14, color: colors.textSecondary, marginBottom: 4, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 12 },
  actionText: { color: colors.onPrimary, fontWeight: '900' },
  actionBtnOutline: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, borderRadius: 12 },
  actionTextOutline: { color: colors.textPrimary, fontWeight: '900' },
  carouselContent: { paddingHorizontal: 4, paddingVertical: 6 },
  rewardCard: { width: 120, borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  rewardCardBlue: { backgroundColor: '#E0F2FE', borderColor: '#7DD3FC' },
  rewardCardYellow: { backgroundColor: '#FEF9C3', borderColor: '#FDE68A' },
  rewardCardGem: { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' },
  rewardEmoji: { fontSize: 20, marginBottom: 4 },
  rewardTitle: { fontWeight: '900', color: colors.textPrimary, textTransform: 'capitalize' },
  rewardDesc: { fontSize: 11, color: colors.textSecondary },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  backText: { color: colors.primary, fontWeight: '800' },
  wordCard: { height: 120, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: '#EFF6FF', paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center', marginRight: 10 },
  wordCardBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.secondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  wordCardBadgeText: { color: colors.onSecondary, fontWeight: '900', fontSize: 11 },
  wordCardText: { fontSize: 20, fontWeight: '900', color: colors.primary, textTransform: 'capitalize' },
});

export default LevelHubScreen;



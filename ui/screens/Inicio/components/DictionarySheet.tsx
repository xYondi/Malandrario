import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, FlatList, TextInput, Share, PanResponder, GestureResponderEvent, PanResponderGestureState, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';

interface DictionarySheetProps {
  visible: boolean;
  onClose: () => void;
  words: ReadonlyArray<string>;
  onSelectWord?: (word: string) => void;
}

const { height: screenHeight } = Dimensions.get('window');

const DictionarySheet: React.FC<DictionarySheetProps> = ({ visible, onClose, words, onSelectWord }) => {
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [query, setQuery] = useState<string>('');
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const detailVisibleRef = useRef(false);
  const detailOpacity = useRef(new Animated.Value(0)).current;
  const detailScale = useRef(new Animated.Value(0.9)).current;
  const detailFlip = useRef(new Animated.Value(0)).current; // 0..1 -> rotateY
  const [detailWord, setDetailWord] = useState<string>('');
  const [detailQuestion, setDetailQuestion] = useState<string>('');
  // Eliminamos flip de lista para evitar glitch visual al saltar entre letras
  const flatRef = useRef<FlatList>(null);
  const headerYMapRef = useRef<Record<string, number>>({});
  const headerIndexMapRef = useRef<Record<string, number>>({});
  const sheetDragY = useRef(new Animated.Value(0)).current;
  const [alphaIndexTop, setAlphaIndexTop] = useState<number>(130);

  const isClosingRef = useRef(false);
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        return Math.abs(g.dy) > 6;
      },
      onPanResponderMove: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        if (isClosingRef.current) return;
        if (g.dy > 0) {
          const clamped = Math.max(0, Math.min(200, g.dy));
          sheetDragY.setValue(clamped);
        }
      },
      onPanResponderRelease: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        if (isClosingRef.current) return;
        if (g.dy > 100 || g.vy > 0.8) {
          // Cerrar por deslizamiento
          isClosingRef.current = true;
          Animated.parallel([
            Animated.timing(backdropOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: screenHeight, duration: 240, useNativeDriver: true }),
          ]).start(() => {
            sheetDragY.setValue(0);
            isClosingRef.current = false;
            onClose();
          });
        } else {
          // Volver a su lugar
          Animated.spring(sheetDragY, { toValue: 0, tension: 140, friction: 10, useNativeDriver: true }).start();
        }
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => {
        if (!isClosingRef.current) {
          Animated.spring(sheetDragY, { toValue: 0, tension: 140, friction: 10, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0.35, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: screenHeight, duration: 240, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return words;
    return words.filter((w) => w.toLowerCase().includes(q));
  }, [query, words]);

  const itemsWithHeaders = useMemo(() => {
    // Alfabeto completo (incluye Ñ)
    const ALPHABET: ReadonlyArray<string> = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
    const list: Array<{ type: 'header' | 'item'; key: string; value?: string }> = [];
    headerIndexMapRef.current = {};

    // Ordenar y agrupar palabras por letra
    const sorted = [...new Set(filtered)].sort((a, b) => a.localeCompare(b));
    const letterToWords: Record<string, string[]> = {};
    ALPHABET.forEach((l) => (letterToWords[l] = []));
    sorted.forEach((w) => {
      const letter = (w[0] || '#').toUpperCase();
      if (letterToWords[letter]) {
        letterToWords[letter].push(w);
      }
    });

    // Construir lista completa con headers aunque no haya palabras
    ALPHABET.forEach((letter) => {
      headerIndexMapRef.current[letter] = list.length;
      list.push({ type: 'header', key: `h-${letter}` });
      const arr = letterToWords[letter] || [];
      arr.forEach((w) => list.push({ type: 'item', key: w, value: w }));
    });

    return list;
  }, [filtered]);

  const indexLetters = useMemo(() => {
    return 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  }, []);

  const lettersWithWords = useMemo(() => {
    const set = new Set<string>();
    const ALPHABET: ReadonlyArray<string> = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
    filtered.forEach((w) => {
      if (!w || !w[0]) return;
      const l = w[0].toUpperCase();
      if (ALPHABET.includes(l)) set.add(l);
    });
    return set;
  }, [filtered]);

  const showDetail = (word: string) => {
    setDetailWord(word);
    // Buscar la pregunta correspondiente en niveles
    try {
      const { ALL_LEVELS } = require('../../JergaBasica/data/questions');
      const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ').trim();
      const target = normalize(word);
      let found: string | null = null;
      const levels = Object.keys(ALL_LEVELS) as unknown as number[];
      for (const lvl of levels) {
        const qs = ALL_LEVELS[lvl as 1 | 2] || [];
        for (let i = 0; i < qs.length; i++) {
          const q = qs[i] as any;
          const answer = normalize(String(q.a));
          const accepted = Array.isArray(q.accepted) ? q.accepted.map((a: string) => normalize(a)) : [];
          if (answer.includes(target) || accepted.some((a: string) => a.includes(target))) {
            found = String(q.q);
            break;
          }
        }
        if (found) break;
      }
      setDetailQuestion(found || '');
    } catch (e) {
      setDetailQuestion('');
    }

    setDetailVisible(true);
    detailOpacity.setValue(0);
    detailScale.setValue(0.9);
    detailFlip.setValue(1);
    Animated.parallel([
      Animated.timing(detailOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(detailScale, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
      Animated.timing(detailFlip, { toValue: 0, duration: 220, useNativeDriver: true })
    ]).start();
  };

  const hideDetail = () => {
    Animated.parallel([
      Animated.timing(detailOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(detailScale, { toValue: 0.95, duration: 150, useNativeDriver: true })
    ]).start(() => setDetailVisible(false));
  };

  useEffect(() => {
    detailVisibleRef.current = detailVisible;
  }, [detailVisible]);

  const renderRow = ({ item }: { item: { type: 'header' | 'item'; key: string; value?: string } }) => {
    if (item.type === 'header') {
      const letter = item.key.replace('h-', '');
      return (
        <View
          style={styles.sectionHeader}
          onLayout={(e) => {
            headerYMapRef.current[letter] = e.nativeEvent.layout.y;
            if (letter === 'A') {
              // Ajustar el top del índice para alinear con la primera cabecera A
              try {
                const y = e.nativeEvent.layout.y;
                // Offset adicional para compensar paddings internos
                setAlphaIndexTop(120 + Math.max(0, y - 8) + 16);
              } catch {}
            }
          }}
        >
          <Text style={styles.sectionHeaderText}>{letter}</Text>
        </View>
      );
    }
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => item.value && showDetail(item.value)}>
        <View style={styles.wordItem}>
          <View style={styles.wordRow}>
            <MaterialCommunityIcons name="bookmark-outline" size={18} color={colors.bluePrimary} />
            <Text style={styles.wordText}>{item.value}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Desbloqueada</Text>
            </View>
          </View>
          <View style={styles.divider} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        {visible && (
          <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={onClose} />
        )}
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[ 
        styles.sheet,
        {
          transform: [
            { translateY: Animated.add(translateY, sheetDragY) }
          ]
        }
      ]}>
        {/* Lomo de libro decorativo */}
        <View style={styles.bookSpine} />
        {/* Área amplia para arrastrar y cerrar */}
        <View style={styles.dragArea} pointerEvents="box-only" {...panResponder.panHandlers} />
        <View style={styles.grabber} hitSlop={{ top: 16, bottom: 16, left: 40, right: 40 }} {...panResponder.panHandlers} />
        <View style={styles.dragStrip} pointerEvents="box-only" {...panResponder.panHandlers} />
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <Ionicons name="book-outline" size={22} color={colors.onSecondary} />
            <Text style={styles.title}>Diccionario</Text>
          </View>
          <TouchableOpacity onPress={() => {
            if (!isClosingRef.current) {
              isClosingRef.current = true;
              Animated.parallel([
                Animated.timing(backdropOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: screenHeight, duration: 240, useNativeDriver: true }),
              ]).start(() => {
                sheetDragY.setValue(0);
                isClosingRef.current = false;
                onClose();
              });
            }
          }} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Buscador */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.grayDark} />
          <TextInput
            placeholder="Buscar palabra..."
            placeholderTextColor={colors.gray}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>

        {itemsWithHeaders.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Aún no has desbloqueado palabras.</Text>
            <Text style={styles.emptySub}>Juega niveles para llenar tu diccionario.</Text>
          </View>
        ) : (
          <FlatList
            data={itemsWithHeaders}
            keyExtractor={(item) => item.key}
            renderItem={renderRow}
            contentContainerStyle={styles.listContent}
            ref={flatRef}
          />
        )}

        {/* Índice lateral A–Z (dentro de la sheet para que se oculte con ella) */}
        {visible && indexLetters.length > 0 && (
          <View style={[styles.alphaIndexWrap, { top: alphaIndexTop }]} pointerEvents={visible ? 'auto' : 'none'}>
            <ScrollView style={styles.alphaIndexScroll} contentContainerStyle={styles.alphaIndexContent} showsVerticalScrollIndicator={false}>
              {indexLetters.map((ltr) => (
                <TouchableOpacity
                  key={ltr}
                  style={styles.alphaIndexLetter}
                  onPress={() => {
                    const idx = headerIndexMapRef.current[ltr];
                    if (typeof idx === 'number' && flatRef.current) {
                      try {
                        flatRef.current.scrollToIndex({ index: idx, animated: true, viewPosition: 0 });
                      } catch {
                        const y = headerYMapRef.current[ltr];
                        if (typeof y === 'number') {
                          flatRef.current.scrollToOffset({ offset: Math.max(0, y - 12), animated: true });
                        }
                      }
                    }
                  }}
                >
                  <Text style={[
                    styles.alphaIndexText,
                    lettersWithWords.has(ltr) ? styles.alphaIndexTextActive : styles.alphaIndexTextInactive
                  ]}>{ltr}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Animated.View>

      {/* Modal de detalle de palabra */}
      {detailVisible && (
        <Animated.View style={[styles.detailBackdrop, { opacity: detailOpacity }]}> 
          <TouchableOpacity style={styles.detailBackdropTouchable} activeOpacity={1} onPress={hideDetail} />
          <Animated.View style={[
            styles.detailCard,
            {
              transform: [
                { perspective: 800 },
                { scale: detailScale },
                { rotateY: detailFlip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) }
              ]
            }
          ]}> 
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>{detailWord}</Text>
              <TouchableOpacity onPress={hideDetail} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {detailQuestion ? (
              <Text style={styles.detailQuestion}>{detailQuestion}</Text>
            ) : (
              <Text style={styles.detailQuestionFallback}>No se encontró una pregunta asociada.</Text>
            )}
            <View style={styles.detailActions}>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={async () => {
                  const message = `Palabra: ${detailWord}\nPregunta: ${detailQuestion || '—'}`;
                  try { await Share.share({ message }); } catch {}
                }}
              >
                <Ionicons name="share-social" size={16} color={colors.onSecondary} />
                <Text style={styles.shareBtnText}>Compartir</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}

      {/* Índice lateral movido dentro de la sheet */}
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: Math.round(screenHeight * 0.75),
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
  },
  bookSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: colors.secondary,
    borderTopLeftRadius: 22,
  },
  grabber: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.grayLight,
    marginBottom: 10,
  },
  dragArea: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    height: 84,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  dragStrip: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    height: 32,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    position: 'relative',
    zIndex: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: colors.secondary,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.onSecondary,
    letterSpacing: 0.2,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  listContent: {
    paddingVertical: 8,
  },
  alphaIndexWrap: {
    position: 'absolute',
    right: -2,
    bottom: 28,
    top: 120,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  alphaIndexScroll: {
    flexGrow: 0,
    maxHeight: 500,
  },
  alphaIndexContent: {
    alignItems: 'center',
  },
  alphaIndexLetter: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  alphaIndexText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.primary,
  },
  alphaIndexTextActive: {
    color: colors.primary,
    opacity: 1,
  },
  alphaIndexTextInactive: {
    color: colors.gray,
    opacity: 0.5,
  },
  sectionHeader: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.gray0,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.grayDark,
    letterSpacing: 1,
  },
  wordItem: {
    alignSelf: 'center',
    width: '97%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 12,
    shadowColor: '#9FB7DA',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 2,
    overflow: 'hidden',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  badge: {
    marginLeft: 'auto',
    backgroundColor: colors.blueLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: colors.bluePrimary,
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: colors.grayLight,
    marginTop: 10,
    opacity: 0.6,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  emptySub: {
    fontSize: 13,
    color: colors.grayDark,
    marginTop: 4,
  },
  detailBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailBackdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  detailCard: {
    width: '85%',
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 18,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  detailQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 22,
  },
  detailQuestionFallback: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
  },
  detailActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: colors.secondary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  shareBtnText: {
    color: colors.onSecondary,
    fontWeight: '800',
    fontSize: 12,
  },
});

export default DictionarySheet;



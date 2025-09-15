import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../theme/colors';
import * as Haptics from 'expo-haptics';

interface CollectionItem {
  label: string;
  icon: string;
}

interface HeroSectionProps {
  selected: CollectionItem;
  selectedIndex: number;
  collections: ReadonlyArray<CollectionItem>;
  prevCollection: () => void;
  nextCollection: () => void;
  playButtonAnim: Animated.Value;
  onPlay: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const HeroSection: React.FC<HeroSectionProps> = ({
  selected,
  selectedIndex,
  collections,
  prevCollection,
  nextCollection,
  playButtonAnim,
  onPlay,
}) => {
  const [selectorWidth, setSelectorWidth] = React.useState<number | null>(null);
  return (
    <View style={styles.heroSection}>
      <Image source={require('../../../../assets/PERSONAJE.png')} style={styles.heroImg} />

      <View style={styles.selectorOverlay} pointerEvents="box-none">
        <View style={styles.selectorWrap}>
          <View style={styles.selectorDots}>
            {collections.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  if (i === selectedIndex) return;
                  const delta = i - selectedIndex;
                  const steps = Math.abs(delta);
                  for (let s = 0; s < steps; s++) {
                    setTimeout(() => {
                      delta > 0 ? nextCollection() : prevCollection();
                    }, s * 60);
                  }
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={[styles.selectorDot, i === selectedIndex && styles.selectorDotActive]} />
              </TouchableOpacity>
            ))}
          </View>

          <LinearGradient
            colors={[colors.surface, colors.surfaceAlt]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.selector}
            onLayout={(e) => setSelectorWidth(e.nativeEvent.layout.width)}
          >
            <TouchableOpacity style={styles.arrowBtn} onPress={prevCollection}>
              <Text style={styles.arrowText}>◀</Text>
            </TouchableOpacity>
            <View style={styles.selectorContent}>
              <LinearGradient colors={[colors.yellowPrimary, colors.yellowDark]} start={{ x: 0.3, y: 0.3 }} end={{ x: 0.8, y: 0.8 }} style={styles.selectorEmoji}>
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
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Jugar"
              accessibilityHint="Inicia el juego"
              style={styles.gameButtonMain}
              onPress={onPlay}
              activeOpacity={0.85}
            >
              <View style={styles.playButtonOuter}>
                <LinearGradient
                  colors={["#FEF3C7", "#FDE68A", "#F59E0B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.playButtonGradient,
                    selectorWidth ? { width: selectorWidth * 0.8, alignSelf: 'center' } : null,
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons name="play" size={20} color={colors.onPrimary} />
                    <Text style={styles.playButtonText}>JUGAR</Text>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginTop: -90,
  },
  selectorOverlay: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  selectorWrap: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 0,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  selectorDots: { 
    flexDirection: 'row', 
    gap: 12, 
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  selectorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.grayLight,
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectorDotActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.yellowDark,
    shadowColor: '#FACC15',
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  arrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.yellowDark,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { 
    fontSize: 20, 
    color: colors.yellowDark,
    fontWeight: 'bold',
  },
  selectorContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectorEmoji: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorEmojiText: { fontSize: 16 },
  selectorLabel: {
    fontWeight: '900',
    letterSpacing: 0.3,
    flexShrink: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  gameButtonMain: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonOuter: {
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  playButtonGradient: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontWeight: '900',
    color: colors.onPrimary,
    fontSize: 18,
    letterSpacing: 1.2,
  },
});

export default HeroSection;



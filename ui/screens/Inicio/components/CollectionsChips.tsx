import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../theme/colors';

interface CollectionItem {
  label: string;
  icon: string;
}

interface CollectionsChipsProps {
  collections: ReadonlyArray<CollectionItem>;
  onScroll: (e: any) => void;
  showLeftFade: boolean;
  showRightFade: boolean;
}

const CollectionsChips: React.FC<CollectionsChipsProps> = ({ collections, onScroll, showLeftFade, showRightFade }) => {
  return (
    <View style={styles.scrollContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.chipsRow}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {collections.map((c, idx) => (
          <LinearGradient key={c.label} colors={[colors.secondary, colors.yellowDark]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.collectionChipOuter}>
            <View style={styles.collectionChipInner}>
              <LinearGradient colors={[colors.secondary, colors.yellowDark]} start={{ x: 0.3, y: 0.3 }} end={{ x: 0.8, y: 0.8 }} style={styles.chipEmoji}>
                <Text style={styles.chipEmojiText}>{c.icon}</Text>
              </LinearGradient>
              <View style={{ flexDirection: 'column' }}>
                <Text style={styles.collectionChipText}>{c.label}</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${(idx + 1) * 20}%` }]} />
                </View>
              </View>
              <View style={styles.tagDifficulty}>
                <Text style={styles.tagDifficultyText}>{idx % 3 === 0 ? 'Fácil' : idx % 3 === 1 ? 'Medio' : 'Arrecho'}</Text>
              </View>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>

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
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    position: 'relative',
    overflow: 'hidden',
    height: 60,
    borderRadius: 30,
    width: '100%', // Asegurar ancho completo
  },
  chipsRow: { 
    paddingLeft: 0,
    paddingRight: 20, 
    gap: 8,
  },
  containerFadeLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 80, // Reducido de 120 a 80
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    pointerEvents: 'none',
    zIndex: 1,
  },
  containerFadeRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 120, // Reducido de 250 a 120
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    pointerEvents: 'none',
    zIndex: 1,
  },
  collectionChipOuter: {
    borderRadius: 9999,
    padding: 4,
    borderWidth: 2,
    borderColor: colors.yellowDark,
  },
  collectionChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  progressTrack: {
    marginTop: 4,
    height: 4,
    backgroundColor: colors.grayLight,
    borderRadius: 9999,
    width: 100,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 9999,
  },
  tagDifficulty: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tagDifficultyText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
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
    color: colors.primary,
    fontSize: 14,
  },
});

export default CollectionsChips;



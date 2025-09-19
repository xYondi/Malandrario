import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

interface AnswerSlotsProps {
  slots: string[];
  filled: string[];
  currentIndex: number;
  showResult: 'correct' | 'incorrect' | null;
  slotScaleAnimations: {[key: number]: Animated.Value};
  letterAnimations: {[key: number]: Animated.Value};
  removingLetter: {index: number, anim: Animated.Value} | null;
  slotDistribution: { rows: number; maxPerRow: number };
}

const AnswerSlots: React.FC<AnswerSlotsProps> = ({
  slots,
  filled,
  currentIndex,
  showResult,
  slotScaleAnimations,
  letterAnimations,
  removingLetter,
  slotDistribution
}) => {
  const horizontalPadding = 32;
  const gap = 3;
  const maxPerLineWidth = screenWidth - horizontalPadding;
  
  const computedSlotSize = React.useMemo(() => {
    const target = Math.floor((maxPerLineWidth - gap * (slotDistribution.maxPerRow - 1)) / Math.max(slotDistribution.maxPerRow, 1));
    return Math.max(20, Math.min(38, target));
  }, [slotDistribution.maxPerRow, maxPerLineWidth, gap]);

  // Dividir slots en filas según la distribución calculada
  const slotRows = React.useMemo(() => {
    if (slotDistribution.rows === 1) {
      return [slots];
    }
    
    // Dividir en 2 filas
    const midPoint = Math.ceil(slots.length / 2);
    return [slots.slice(0, midPoint), slots.slice(midPoint)];
  }, [slots, slotDistribution.rows]);

  return (
    <View style={styles.slotsContainer}>
      {slotRows.map((row, rowIndex) => (
        <View key={`slot-row-${rowIndex}`} style={[styles.slotsRow, { gap, flexWrap: 'nowrap' }]}>
          {row.map((ch, idx) => {
            const globalIdx = slotDistribution.rows === 1 ? idx : (rowIndex * Math.ceil(slots.length / 2)) + idx;
            const letterAnim = letterAnimations[globalIdx];
            const isRemoving = removingLetter?.index === globalIdx;
            const removeAnim = removingLetter?.anim;
            
            // No renderizar baldosas para espacios
            if (ch === ' ') {
              return <View key={`space-${globalIdx}`} style={{ width: computedSlotSize / 3 }} />;
            }
            
            const scaleAnim = slotScaleAnimations[globalIdx];
            
            return (
              <Animated.View
                key={`slot-${globalIdx}`}
                style={[
                  styles.slot,
                  { width: computedSlotSize, height: computedSlotSize + 8 },
                  globalIdx === currentIndex && !showResult && styles.slotActive,
                  !!filled[globalIdx] && !showResult && styles.slotFilled,
                  // Estados de resultado con animación
                  showResult === 'correct' && styles.slotCorrect,
                  showResult === 'incorrect' && styles.slotIncorrect,
                  {
                    opacity: scaleAnim || 1,
                    transform: [
                      {
                        scale: scaleAnim ? scaleAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 1.2, 1],
                        }) : 1,
                      },
                      {
                        translateY: scaleAnim ? scaleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }) : 0,
                      },
                      {
                        rotateY: scaleAnim ? scaleAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: ['90deg', '45deg', '0deg'],
                        }) : '0deg',
                      },
                    ],
                  },
                ]}
              >
                {ch !== ' ' && (
                  <Animated.View
                    style={[
                      styles.letterContainer,
                      letterAnim && {
                        transform: [
                          {
                            scale: letterAnim.interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [0, 1.2, 1],
                            }),
                          },
                          {
                            rotate: letterAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['180deg', '0deg'],
                            }),
                          },
                        ],
                        opacity: letterAnim,
                      },
                      isRemoving && removeAnim && {
                        transform: [
                          {
                            scale: removeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 1],
                            }),
                          },
                          {
                            rotate: removeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '-180deg'],
                            }),
                          },
                        ],
                        opacity: removeAnim,
                      },
                    ]}
                  >
                    <Text style={[
                      styles.slotText, 
                      globalIdx === currentIndex && !showResult && styles.slotTextActive,
                      showResult === 'correct' && styles.slotTextCorrect,
                      showResult === 'incorrect' && styles.slotTextIncorrect,
                    ]}>
                      {filled[globalIdx] || ''}
                    </Text>
                  </Animated.View>
                )}
              </Animated.View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  slotsContainer: { 
    alignItems: 'center', 
    gap: 8 
  },
  slotsRow: { 
    flexDirection: 'row', 
    flexWrap: 'nowrap', 
    gap: 3, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  slot: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra 3D igual a las teclas
    shadowColor: '#9FB7DA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  slotActive: { 
    borderColor: '#3B82F6', 
    shadowColor: '#3B82F6', 
    backgroundColor: '#3B82F6',
    // Sombra 3D igual a las teclas
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  slotFilled: { 
    backgroundColor: '#FFFFFF', 
    borderColor: '#E2E8F0',
    // Sombra 3D igual a las teclas
    shadowColor: '#9FB7DA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  slotCorrect: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  slotIncorrect: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  slotText: { 
    fontWeight: '900', 
    color: '#1E293B', 
    fontSize: 18 
  },
  slotTextActive: { 
    color: '#FFFFFF' 
  },
  slotTextCorrect: { 
    color: '#FFFFFF' 
  },
  slotTextIncorrect: { 
    color: '#FFFFFF' 
  },
  letterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});

export default AnswerSlots;

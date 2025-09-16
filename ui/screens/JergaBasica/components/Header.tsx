import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../theme/colors';

interface HeaderProps {
  nivel: number;
  currentQuestion: number;
  totalQuestions: number;
  titleGradientAnim: Animated.Value;
  lastQuestionCueAnim: Animated.Value;
}

const { width: screenWidth } = Dimensions.get('window');

const Header: React.FC<HeaderProps> = ({ nivel, currentQuestion, totalQuestions, titleGradientAnim, lastQuestionCueAnim }) => {
  return (
    <View style={styles.header}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.titleGlow,
          {
            transform: [
              { scale: lastQuestionCueAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.18] }) },
            ],
            opacity: lastQuestionCueAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] }),
          },
        ]}
      />
      {/* Estrellas de cue */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.cueStar,
          styles.cueStar1,
          {
            transform: [
              { scale: lastQuestionCueAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
            ],
            opacity: lastQuestionCueAnim,
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.cueStar,
          styles.cueStar2,
          {
            transform: [
              { scale: lastQuestionCueAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
            ],
            opacity: lastQuestionCueAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] }),
          },
        ]}
      />

      <MaskedView
        style={styles.titleMask}
        maskElement={
          <View style={styles.titleMaskContent}>
            <Text numberOfLines={1} style={styles.titleMaskText}>Traduce la Jerga</Text>
          </View>
        }
      >
        <Animated.View
          style={{
            width: screenWidth * 3,
            height: '100%',
            transform: [
              {
                translateX: titleGradientAnim.interpolate({ inputRange: [0, 1], outputRange: [-screenWidth, 0] }),
              },
            ],
          }}
        >
          <LinearGradient
            colors={['#2E6CA8', '#2E6CA8', '#2E6CA8']}
            start={{ x: -0.2, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          />
        </Animated.View>
      </MaskedView>

      <Text style={styles.questionCounter}>Pregunta {currentQuestion + 1}/{totalQuestions}</Text>
      <Text style={styles.subtitle}>Nivel {nivel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  titleMask: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 8,
    overflow: 'hidden',
    height: 48,
    alignSelf: 'center',
    justifyContent: 'center',
    width: 'auto',
    minWidth: 200,
  },
  titleMaskContent: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    alignSelf: 'stretch',
  },
  titleMaskText: {
    fontSize: 24,
    lineHeight: 28,
    includeFontPadding: false as unknown as boolean,
    fontWeight: '900',
    color: 'black',
    textAlign: 'center',
  },
  titleGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  titleGlow: {
    position: 'absolute',
    top: 4,
    height: 48,
    width: '72%',
    borderRadius: 24,
    backgroundColor: '#2E6CA8',
    shadowColor: '#2E6CA8',
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 0,
  },
  cueStar: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    shadowColor: colors.white,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  cueStar1: { top: 2, right: '18%' },
  cueStar2: { top: 10, left: '16%' },
  questionCounter: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default Header;



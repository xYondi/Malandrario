import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';

interface QuestionCardProps {
  question: string;
  questionCardAnim: Animated.Value;
  showFeedback: boolean;
  isCorrect: boolean;
  feedbackAnim: Animated.Value;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, questionCardAnim, showFeedback, isCorrect, feedbackAnim }) => {
  return (
    <Animated.View
      style={[
        styles.questionCard,
        {
          opacity: questionCardAnim,
          transform: [
            { translateY: questionCardAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
            { scale: questionCardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
          ],
        },
      ]}
    >
      <LinearGradient colors={['#FFFFFF', '#FEF3C7']} style={styles.questionCardGradient}>
        <Text style={styles.questionText}>{question}</Text>
        {showFeedback && (
          <Animated.View
            style={[
              styles.feedbackContainer,
              {
                opacity: feedbackAnim,
                transform: [
                  { scale: feedbackAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
                ],
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {isCorrect ? (
                <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              ) : (
                <Ionicons name="close-circle" size={18} color="#DC2626" />
              )}
              <Text style={[styles.feedbackText, { color: isCorrect ? '#16A34A' : '#DC2626' }]}>
                {isCorrect ? '¡Correcto!' : 'Incorrecto'}
              </Text>
            </View>
          </Animated.View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  questionCard: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  questionCardGradient: {
    padding: 16,
    borderRadius: 14,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  feedbackContainer: { marginTop: 8 },
  feedbackText: { fontSize: 14, fontWeight: '900', textAlign: 'center' },
});

export default QuestionCard;





import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

interface HeaderProps {
  nivel: number;
  currentQuestion: number;
  totalQuestions: number;
}

const Header: React.FC<HeaderProps> = ({ nivel, currentQuestion, totalQuestions }) => {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Traduce la Jerga</Text>
      </View>

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
    width: '100%',
  },
  titleContainer: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    includeFontPadding: false as unknown as boolean,
    fontWeight: '900',
    color: '#2E6CA8',
    textAlign: 'center',
  },
  questionCounter: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    alignSelf: 'center',
  },
});

export default Header;



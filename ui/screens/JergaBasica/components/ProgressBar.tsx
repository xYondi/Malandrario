import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../../../theme/colors';

interface ProgressBarProps {
  progressAnim: Animated.Value;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progressAnim }) => {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: { marginBottom: 16 },
  progressBar: {
    height: 12,
    backgroundColor: colors.grayLight,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 9999,
  },
});

export default ProgressBar;





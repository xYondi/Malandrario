import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../theme/colors';

interface InputAnswerProps {
  placeholder?: string;
  onValidate: (value: string) => void;
  disabled?: boolean;
}

const InputAnswer: React.FC<InputAnswerProps> = ({ placeholder = 'Escribe tu respuesta…', onValidate, disabled }) => {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (disabled) setValue('');
  }, [disabled]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        editable={!disabled}
        placeholder={placeholder}
        placeholderTextColor={colors.gray}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity disabled={disabled || value.trim().length === 0} onPress={() => onValidate(value.trim())}>
        <LinearGradient colors={['#60A5FA', '#3B82F6']} style={[styles.button, (disabled || value.trim().length === 0) && styles.buttonDisabled]}>
          <Text style={styles.buttonText}>Validar</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  button: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.onPrimary, fontWeight: '900' },
});

export default InputAnswer;




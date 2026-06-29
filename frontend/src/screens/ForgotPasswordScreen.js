import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { forgotPassword, resetPassword } from '../api/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [stage, setStage]       = useState('email'); // 'email' | 'reset'
  const [email, setEmail]       = useState('');
  const [code, setCode]         = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy]         = useState(false);

  const handleSendCode = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }
    setBusy(true);
    try {
      await forgotPassword(trimmed);
      Alert.alert('Check your email', 'If that email exists, a 6-digit reset code has been sent.');
      setStage('reset');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Could not send the reset code. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!code.trim() || !newPassword) {
      Alert.alert('Missing fields', 'Please enter the code and your new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Too short', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'The passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email.trim(), code.trim(), newPassword);
      Alert.alert('Success', 'Your password has been reset. Please log in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Could not reset password. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>

          <Text style={styles.title}>Forgot password</Text>

          {stage === 'email' ? (
            <>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you a 6-digit code to reset your password.
              </Text>

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Pressable
                style={[styles.button, busy && { opacity: 0.7 }]}
                onPress={handleSendCode}
                disabled={busy}
              >
                <Text style={styles.buttonText}>{busy ? 'Sending...' : 'Send code'}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Enter the code sent to {email} and choose a new password.
              </Text>

              <Text style={styles.label}>Reset code</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={(v) => setCode(v.replace(/[^0-9]/g, ''))}
                placeholder="6-digit code"
                placeholderTextColor={colors.placeholder}
                keyboardType="number-pad"
                maxLength={6}
              />

              <Text style={styles.label}>New password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
              />

              <Text style={styles.label}>Confirm new password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
              />

              <Pressable
                style={[styles.button, busy && { opacity: 0.7 }]}
                onPress={handleReset}
                disabled={busy}
              >
                <Text style={styles.buttonText}>{busy ? 'Resetting...' : 'Reset password'}</Text>
              </Pressable>

              <Pressable onPress={() => setStage('email')} disabled={busy}>
                <Text style={styles.linkText}>Didn't get a code? Send again</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});

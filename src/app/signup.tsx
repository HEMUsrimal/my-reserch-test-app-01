// src/app/signup.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUp() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.authScrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.authTitle}>Create an Account</Text>
        <Text style={styles.authSubtitle}>Join to plan, track, and ride smarter.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputEmoji}>👤</Text>
          <TextInput style={styles.textInput} placeholder="Enter Full Name" placeholderTextColor="#9CA3AF" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputEmoji}>✉️</Text>
          <TextInput style={styles.textInput} placeholder="Enter Email" placeholderTextColor="#9CA3AF" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputEmoji}>🔒</Text>
          <TextInput style={styles.textInput} placeholder="Enter password" secureTextEntry={!showPassword} placeholderTextColor="#9CA3AF" />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={{fontSize: 16}}>{showPassword ? "👁️" : "🙈"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/home')}>
          <Text style={styles.primaryButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchAuthContainer} onPress={() => router.push('/login')}>
          <Text style={styles.switchAuthText}>Already have an account? <Text style={styles.switchAuthAccent}>Login</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  authScrollContainer: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 80 },
  authTitle: { fontSize: 26, fontWeight: '800', color: '#2F80ED' },
  authSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 6, marginBottom: 40 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, height: 52, paddingHorizontal: 16, marginBottom: 16 },
  inputEmoji: { marginRight: 12, fontSize: 18 },
  textInput: { flex: 1, fontSize: 14, color: '#1F2937' },
  primaryButton: { backgroundColor: '#2F80ED', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  primaryButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  switchAuthContainer: { alignItems: 'center', marginTop: 32 },
  switchAuthText: { fontSize: 13, color: '#4B5563' },
  switchAuthAccent: { color: '#2F80ED', fontWeight: '600' },
});
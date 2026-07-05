// src/app/signup.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function Signup() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [driverNic, setDriverNic] = useState('');
  const [routeNumber, setRouteNumber] = useState('138');
  const [routeName, setRouteName] = useState('Kottawa - Pettah');
  const [busCategory, setBusCategory] = useState<'SLTB' | 'Private' | 'Semi-Luxury' | 'Luxury'>('Private');
  const [ntcPermitNumber, setNtcPermitNumber] = useState('');
  
  const [loading, setLoading] = useState(false);

  const showCustomAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !fullName || !driverNic || !routeNumber || !routeName || !ntcPermitNumber) {
      showCustomAlert('Error', 'Please fill in all fields.');
      return;
    }

    // Sri Lankan NIC verification (9 digits + V/X or 12 digits)
    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!nicRegex.test(driverNic)) {
      showCustomAlert('Invalid NIC', 'Please enter a valid Sri Lankan NIC number.');
      return;
    }

    setLoading(true);
    try {
      // 1. Sign up user in Supabase Auth (with user_metadata so triggers can catch it)
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            driver_nic: driverNic,
            full_name: fullName,
            route_number: routeNumber,
            route_name: routeName,
            bus_category: busCategory,
            ntc_permit_number: ntcPermitNumber,
          }
        }
      });

      if (authError) throw authError;

      const user = data.user;
      if (!user) throw new Error('Signup failed. Please try again.');

      // 2. Save Driver profile to 'drivers' PostgreSQL table
      // First, check if the SQL trigger already inserted it
      const { data: existingProfile } = await supabase
        .from('drivers')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('drivers')
          .insert({
            id: user.id,
            driver_nic: driverNic,
            full_name: fullName,
            route_number: routeNumber,
            route_name: routeName,
            bus_category: busCategory,
            ntc_permit_number: ntcPermitNumber,
          });

        if (profileError) {
          // If the profile insert failed because we aren't authenticated yet (email confirm on),
          // but auth succeeded, we should print a warning but not block the flow.
          if (profileError.message.includes('row-level security') && !data.session) {
            console.warn("RLS blocked insert because email confirmation is required.");
          } else {
            throw profileError;
          }
        }
      }

      if (data.session) {
        showCustomAlert('Success', 'Account created successfully! Logging in...');
        router.replace('/home');
      } else {
        showCustomAlert('Verification Required', 'Account created! Please check your email to verify your account before logging in.');
        router.replace('/login');
      }
    } catch (error: any) {
      console.error(error);
      showCustomAlert('Signup Error', error.message || 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>NTC Driver Registry</Text>
          <Text style={styles.subtitle}>Sri Lanka Intelligent Transit System (ITS) Portal</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Jagath Perera"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="driver@smarttransit.lk"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Min 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>National Identity Card (NIC)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 199912345678 or 991234567V"
            value={driverNic}
            onChangeText={setDriverNic}
          />

          <Text style={styles.label}>NTC Permit Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. NTC-PR-1029"
            value={ntcPermitNumber}
            onChangeText={setNtcPermitNumber}
            autoCapitalize="characters"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Route Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 138"
                value={routeNumber}
                onChangeText={setRouteNumber}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={styles.label}>Route Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Maharagama - Pettah"
                value={routeName}
                onChangeText={setRouteName}
              />
            </View>
          </View>

          <Text style={styles.label}>Bus Service Category</Text>
          <View style={styles.categoryContainer}>
            {(['Private', 'SLTB', 'Semi-Luxury', 'Luxury'] as const).map((category) => {
              const isSelected = busCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                  onPress={() => setBusCategory(category)}
                >
                  <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Register & Proceed</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>Already registered? Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600',
  },
  form: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4B5563',
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  categoryPill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  categoryPillActive: {
    backgroundColor: '#2F80ED',
    borderColor: '#2F80ED',
  },
  categoryText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '700',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  button: {
    backgroundColor: '#2F80ED',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  linkText: {
    color: '#2F80ED',
    fontSize: 14,
    fontWeight: '600',
  },
});
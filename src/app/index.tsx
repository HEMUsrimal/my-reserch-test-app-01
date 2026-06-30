// src/app/index.tsx
import { useRouter } from 'expo-router';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.splashContainer} 
      onPress={() => router.push('/login')} 
      activeOpacity={0.9}
    >
      <View style={styles.waveLayer1} />
      <View style={styles.waveLayer2} />
      <View style={styles.splashCenteredContent}>
        <Text style={styles.splashLogoText}>SmartTransit</Text>
        <Text style={styles.splashSubText}>Guidance & Decision Platform</Text>
      </View>
      <Text style={styles.splashActionTip}>Tap to Start Application</Text>
      <View style={styles.bottomHomeBar} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  splashContainer: { flex: 1, backgroundColor: '#2F80ED', justifyContent: 'center', alignItems: 'center' },
  splashCenteredContent: { alignItems: 'center', zIndex: 10 },
  splashLogoText: { fontSize: 36, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  splashSubText: { fontSize: 14, color: '#D2E3FC', marginTop: 8, fontWeight: '500' },
  splashActionTip: { position: 'absolute', bottom: 100, color: '#E8F0FE', fontSize: 13, fontWeight: '500', zIndex: 10 },
  bottomHomeBar: { position: 'absolute', bottom: 12, width: 140, height: 4, backgroundColor: '#FFF', borderRadius: 2 },
  waveLayer1: { position: 'absolute', top: height * 0.4, left: -100, width: width + 200, height: height, backgroundColor: '#3b86ed', borderRadius: 400, transform: [{ rotate: '-15deg' }] },
  waveLayer2: { position: 'absolute', top: height * 0.48, left: -100, width: width + 200, height: height, backgroundColor: '#478def', borderRadius: 400, transform: [{ rotate: '-10deg' }] },
});
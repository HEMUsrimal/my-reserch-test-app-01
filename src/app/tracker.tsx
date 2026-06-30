// src/app/tracker.tsx
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Tracker() {
  const router = useRouter();

  const activeBuses = [
    { id: '1', route: 'Bole ➔ Piassa (Route 12)', eta: '3 mins', crowd: 'Medium' },
    { id: '2', route: 'Kebena ➔ Meskel Square', eta: '8 mins', crowd: 'Low' },
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenHeading}>Live Tracking</Text>
        <Text style={styles.screenSubtitle}>Objective 1 & 2: Active Transit Route Monitors</Text>

        <View style={styles.liveMapMock}>
          <Text style={styles.liveMapHint}>🗺️ Interactive Route Map View (Simulated)</Text>
        </View>

        <Text style={styles.sectionHeading}>Real-Time Fleet & Crowd Levels</Text>
        {activeBuses.map(bus => (
          <View key={bus.id} style={styles.trackerCard}>
            <View style={{flex: 1}}>
              <Text style={styles.trackerBusRoute}>{bus.route}</Text>
              <Text style={styles.trackerBusPlate}>Plate: ET-3-4832</Text>
            </View>
            <View style={styles.trackerMetrics}>
              <Text style={styles.trackerEta}>{bus.eta}</Text>
              <View style={[
                styles.crowdBadge,
                { backgroundColor: bus.crowd === 'Low' ? '#E6F4EA' : '#FEF7E0' }
              ]}>
                <Text style={[styles.crowdBadgeText, { color: bus.crowd === 'Low' ? '#137333' : '#B06000' }]}>{bus.crowd} Capacity</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.contactDriverButton} onPress={() => router.push('/chat')}>
              <Text style={{fontSize: 16}}>💬</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Global Tab Navigation */}
      <View style={styles.navigationBarContainer}>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/home')}>
          <Text style={{fontSize: 20}}>🏠</Text>
          <Text style={styles.navigationTabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/tracker')}>
          <Text style={{fontSize: 20}}>🛰️</Text>
          <Text style={[styles.navigationTabText, {color: '#2F80ED'}]}>Tracker</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/tickets')}>
          <Text style={{fontSize: 20}}>🎟️</Text>
          <Text style={styles.navigationTabText}>Tickets</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  mainScroll: { paddingHorizontal: 16, paddingTop: 40, paddingBottom: 80 },
  screenHeading: { fontSize: 24, fontWeight: '800', color: '#1F2937' },
  screenSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 4, marginBottom: 20 },
  liveMapMock: { height: 180, backgroundColor: '#E8F0FE', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#2F80ED', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  liveMapHint: { fontSize: 11, color: '#2F80ED', fontWeight: '600' },
  sectionHeading: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 12 },
  trackerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  trackerBusRoute: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  trackerBusPlate: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  trackerMetrics: { alignItems: 'flex-end', marginRight: 12 },
  trackerEta: { fontSize: 13, fontWeight: '700', color: '#2F80ED' },
  crowdBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  crowdBadgeText: { fontSize: 9, fontWeight: '700' },
  contactDriverButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  navigationBarContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 68, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 12 },
  navigationTabItem: { alignItems: 'center' },
  navigationTabText: { fontSize: 10, fontWeight: '600', marginTop: 2, color: '#9CA3AF' }
});
// src/app/home.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Home() {
  const router = useRouter();
  const [startLoc, setStartLoc] = useState('Bole Airport');
  const [destLoc, setDestLoc] = useState('Piassa');

  const recentTrips = [
    { id: '1', from: 'Bole', to: 'Piassa', distance: '7.2 km', time: '18 mins', price: '35 ETB' },
    { id: '2', from: 'Kebena', to: 'Meskel Square', distance: '5.4 km', time: '25 mins', price: '10 ETB' },
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
        
        {/* Header matches Screen 04 */}
        <View style={styles.homeHeader}>
          <View style={styles.profileRow}>
            <View style={styles.avatarMock}><Text style={{color: '#FFF', fontWeight: '700'}}>JC</Text></View>
            <View style={{marginLeft: 12}}>
              <Text style={styles.profileName}>Hi, John Cena!</Text>
              <Text style={styles.profileLocation}>📍 Addis Ababa, Ethiopia</Text>
            </View>
          </View>
        </View>

        {/* Slogan */}
        <View style={styles.sloganBlock}>
          <Text style={styles.sloganBigText}>Plan. <Text style={{color: '#2F80ED'}}>Ride.</Text> Arrive.</Text>
          <Text style={styles.sloganSmallText}>Track public transport in real time.</Text>
        </View>

        {/* Travel Planner Box */}
        <View style={styles.plannerBox}>
          <View style={styles.plannerInputColumn}>
            <TextInput style={styles.plannerInput} value={startLoc} onChangeText={setStartLoc} placeholder="Your location" />
            <View style={styles.plannerDivider} />
            <TextInput style={styles.plannerInput} value={destLoc} onChangeText={setDestLoc} placeholder="Where are you going?" />
          </View>
          <TouchableOpacity style={styles.plannerButton} onPress={() => router.push('/tracker')}>
            <Text style={styles.plannerButtonText}>Plan My Trip</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeading}>Recent Trips</Text>
        {recentTrips.map(trip => (
          <TouchableOpacity key={trip.id} style={styles.tripCard} onPress={() => router.push('/tracker')}>
            <View style={styles.tripIconBox}><Text style={{fontSize: 16}}>🚌</Text></View>
            <View style={{flex: 1}}>
              <Text style={styles.tripRouteName}>{trip.from} ➔ {trip.to}</Text>
              <Text style={styles.tripMetricsText}>{trip.distance} • {trip.time} • {trip.price}</Text>
            </View>
            <Text style={{color: '#9CA3AF'}}>➔</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Global Tab Navigation */}
      <View style={styles.navigationBarContainer}>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/home')}>
          <Text style={{fontSize: 20}}>🏠</Text>
          <Text style={[styles.navigationTabText, {color: '#2F80ED'}]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/tracker')}>
          <Text style={{fontSize: 20}}>🛰️</Text>
          <Text style={styles.navigationTabText}>Tracker</Text>
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
  homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatarMock: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2F80ED', justifyContent: 'center', alignItems: 'center' },
  profileName: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  profileLocation: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  sloganBlock: { marginBottom: 20 },
  sloganBigText: { fontSize: 26, fontWeight: '900', color: '#1F2937', letterSpacing: -0.5 },
  sloganSmallText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  plannerBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, elevation: 3, marginBottom: 24 },
  plannerInputColumn: { flex: 1 },
  plannerInput: { height: 36, fontSize: 13, color: '#1F2937', fontWeight: '500' },
  plannerDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  plannerButton: { backgroundColor: '#2F80ED', borderRadius: 12, height: 46, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  plannerButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  sectionHeading: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 12 },
  tripCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  tripIconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#E8F0FE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  tripRouteName: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  tripMetricsText: { fontSize: 11, color: '#6B7280', marginTop: 3 },
  navigationBarContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 68, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 12 },
  navigationTabItem: { alignItems: 'center' },
  navigationTabText: { fontSize: 10, fontWeight: '600', marginTop: 2, color: '#9CA3AF' }
});
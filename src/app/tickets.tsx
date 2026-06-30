// src/app/tickets.tsx
import { useRouter } from 'expo-router';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
const { width } = Dimensions.get('window');

export default function Tickets() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenHeading}>Digital Tickets</Text>
        <Text style={styles.screenSubtitle}>Objective 3: Reservations & Boarding QR Pass</Text>

        <View style={styles.digitalTicketCard}>
          <View style={styles.ticketCardHeader}>
            <Text style={styles.ticketHeaderTitle}>SMART TRANSIT PASS</Text>
          </View>
          <View style={styles.ticketDetailsContainer}>
            <Text style={styles.ticketLabel}>Passenger</Text>
            <Text style={styles.ticketValue}>John Cena</Text>
            
            <Text style={[styles.ticketLabel, {marginTop: 12}]}>Route</Text>
            <Text style={styles.ticketValue}>Bole Airport ➔ Piassa</Text>

            {/* Mock QR Code */}
            <View style={styles.ticketQrContainer}>
              <View style={styles.qrGridSquare}>
                <View style={styles.qrCenterMockBlocks} />
              </View>
              <Text style={styles.qrScannerHint}>Scan QR at Bus Entry Validator</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Global Tab Navigation */}
      <View style={styles.navigationBarContainer}>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/home')}>
          <Text style={{fontSize: 20}}>🏠</Text>
          <Text style={styles.navigationTabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/tracker')}>
          <Text style={{fontSize: 20}}>🛰️</Text>
          <Text style={styles.navigationTabText}>Tracker</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/tickets')}>
          <Text style={{fontSize: 20}}>🎟️</Text>
          <Text style={[styles.navigationTabText, {color: '#2F80ED'}]}>Tickets</Text>
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
  digitalTicketCard: { backgroundColor: '#2F80ED', borderRadius: 20, overflow: 'hidden', elevation: 4 },
  ticketCardHeader: { padding: 20 },
  ticketHeaderTitle: { color: '#FFF', fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  ticketDetailsContainer: { backgroundColor: '#FFFFFF', padding: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  ticketLabel: { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600' },
  ticketValue: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginTop: 4 },
  ticketQrContainer: { alignItems: 'center', marginTop: 24 },
  qrGridSquare: { width: 130, height: 130, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  qrCenterMockBlocks: { width: 100, height: 100, backgroundColor: '#1F2937', opacity: 0.8 },
  qrScannerHint: { fontSize: 11, color: '#6B7280', marginTop: 12, fontWeight: '500' },
  navigationBarContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 68, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 12 },
  navigationTabItem: { alignItems: 'center' },
  navigationTabText: { fontSize: 10, fontWeight: '600', marginTop: 2, color: '#9CA3AF' }
});
// src/app/diagnostics.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

export default function Diagnostics() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const themeStyles = isDarkMode ? darkTheme : lightTheme;

  // Mock CAN Bus Telemetry
  const sensorData = [
    { name: 'Engine Coolant Temp', value: '88 °C', status: 'Optimal', color: '#10B981' },
    { name: 'Air Brake Pressure', value: '7.8 Bar', status: 'Optimal', color: '#10B981' },
    { name: 'Engine Oil Pressure', value: '3.4 Bar', status: 'Optimal', color: '#10B981' },
    { name: 'Battery Voltage', value: '27.4 V', status: 'Charging', color: '#10B981' },
  ];

  const tires = [
    { pos: 'Front Left', pressure: '118 psi', temp: '42 °C', status: 'Pass', color: '#10B981' },
    { pos: 'Front Right', pressure: '119 psi', temp: '43 °C', status: 'Pass', color: '#10B981' },
    { pos: 'Rear Outer Left', pressure: '116 psi', temp: '48 °C', status: 'Pass', color: '#10B981' },
    { pos: 'Rear Outer Right', pressure: '92 psi', temp: '54 °C', status: 'Low Pressure', color: '#F59E0B' },
  ];

  return (
    <SafeAreaView style={[styles.safeContainer, themeStyles.bg]}>
      {/* Header */}
      <View style={[styles.header, themeStyles.cardBg, themeStyles.border]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backIcon, themeStyles.text]}>⬅️</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, themeStyles.text]}>Bus Telemetry & Diagnostics</Text>
            <Text style={styles.subtitle}>Sri Lanka Intelligent Transit System (ITS)</Text>
          </View>
          <TouchableOpacity 
            style={[styles.themeToggle, themeStyles.toggleBg]} 
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Text style={{ fontSize: 16 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Core System Telemetry */}
        <Text style={[styles.sectionHeading, themeStyles.text]}>Engine & Brake Sensors</Text>
        <View style={[styles.card, themeStyles.cardBg, themeStyles.border]}>
          {sensorData.map((sensor, idx) => (
            <View 
              key={sensor.name} 
              style={[
                styles.telemetryRow, 
                idx < sensorData.length - 1 && styles.rowBorder
              ]}
            >
              <View>
                <Text style={[styles.sensorName, themeStyles.text]}>{sensor.name}</Text>
                <Text style={styles.sensorStatus}>● {sensor.status}</Text>
              </View>
              <Text style={[styles.sensorValue, { color: sensor.color }]}>{sensor.value}</Text>
            </View>
          ))}
        </View>

        {/* Tire Pressure Monitoring System (TPMS) */}
        <Text style={[styles.sectionHeading, themeStyles.text]}>Tire Pressure (TPMS)</Text>
        <View style={styles.tireGrid}>
          {tires.map((tire) => (
            <View key={tire.pos} style={[styles.tireCard, themeStyles.cardBg, themeStyles.border]}>
              <Text style={styles.tirePos}>{tire.pos}</Text>
              <Text style={[styles.tirePressure, themeStyles.text]}>{tire.pressure}</Text>
              <Text style={styles.tireTemp}>{tire.temp}</Text>
              <View style={[styles.tireStatusBadge, { backgroundColor: tire.color + '15' }]}>
                <Text style={[styles.tireStatusText, { color: tire.color }]}>{tire.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Smart Transit Driver Credentials */}
        <Text style={[styles.sectionHeading, themeStyles.text]}>NTC Permit & NIC Credentials</Text>
        <View style={[styles.card, themeStyles.cardBg, themeStyles.border]}>
          <View style={styles.credentialRow}>
            <Text style={styles.credLabel}>Driver Name</Text>
            <Text style={[styles.credVal, themeStyles.text]}>Jagath Perera</Text>
          </View>
          <View style={[styles.credentialRow, styles.rowBorder]}>
            <Text style={styles.credLabel}>National Identity Card (NIC)</Text>
            <Text style={[styles.credVal, themeStyles.text]}>199912345678</Text>
          </View>
          <View style={[styles.credentialRow, styles.rowBorder]}>
            <Text style={styles.credLabel}>NTC Driver Permit</Text>
            <Text style={[styles.credVal, themeStyles.text]}>WP-NTC-1029</Text>
          </View>
          <View style={[styles.credentialRow, styles.rowBorder]}>
            <Text style={styles.credLabel}>Assigned Bus Plate</Text>
            <Text style={[styles.credVal, themeStyles.text]}>WP ND-8842</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Themes
const lightTheme = {
  bg: { backgroundColor: '#F9FAFB' },
  cardBg: { backgroundColor: '#FFFFFF' },
  toggleBg: { backgroundColor: '#E5E7EB' },
  text: { color: '#1F2937' },
  textSec: { color: '#6B7280' },
  border: { borderColor: '#E5E7EB' },
};

const darkTheme = {
  bg: { backgroundColor: '#111827' },
  cardBg: { backgroundColor: '#1F2937' },
  toggleBg: { backgroundColor: '#374151' },
  text: { color: '#F9FAFB' },
  textSec: { color: '#9CA3AF' },
  border: { borderColor: '#374151' },
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 4,
  },
  backIcon: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 18,
    color: '#6B7280',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sensorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  sensorStatus: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '800',
    marginTop: 2,
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  tireGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tireCard: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  tirePos: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  tirePressure: {
    fontSize: 18,
    fontWeight: '900',
    marginVertical: 4,
  },
  tireTemp: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  tireStatusBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 8,
  },
  tireStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  credentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  credLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  credVal: {
    fontSize: 13,
    fontWeight: '800',
  },
});

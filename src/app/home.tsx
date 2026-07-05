// src/app/home.tsx
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
} from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Shift state
  const [isShiftActive, setIsShiftActive] = useState<boolean>(true);
  const [shiftSeconds, setShiftSeconds] = useState<number>(9900); // starts at 2h 45m

  // Fuel Management State
  const [fuelLevel, setFuelLevel] = useState<number>(100);
  const fuelNotified = useRef<boolean>(false);

  // Notification Permissions
  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
      }
    })();
  }, []);

  // Monitor Fuel Level
  useEffect(() => {
    if (fuelLevel <= 15 && !fuelNotified.current) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ Fuel Critical",
          body: `Fuel level is critically low (${fuelLevel}%)! Please route to the nearest CEYPETCO or LIOC filling station.`,
          sound: true,
        },
        trigger: null,
      });
      fuelNotified.current = true;
    } else if (fuelLevel > 15) {
      fuelNotified.current = false;
    }
  }, [fuelLevel]);

  const simulateFuelDrop = () => setFuelLevel(prev => Math.max(0, prev - 25));
  const refuelVehicle = () => setFuelLevel(100);

  // Format seconds to hh:mm:ss
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  // Shift Timer logic
  useEffect(() => {
    let timer: any = null;
    if (isShiftActive) {
      timer = setInterval(() => {
        setShiftSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isShiftActive]);

  const toggleShift = () => {
    if (isShiftActive) {
      setIsShiftActive(false);
    } else {
      setIsShiftActive(true);
      setShiftSeconds(0);
    }
  };

  const themeStyles = isDarkMode ? darkTheme : lightTheme;

  // Mock driver stats
  const stats = [
    { label: 'PASSENGERS', value: '142', emoji: '👥' },
    { label: 'DISTANCE', value: '38.5 km', emoji: '🛣️' },
    { label: 'SAFETY RATING', value: '4.9 ⭐', emoji: '🛡️' },
    { label: 'FLEET RANK', value: '#4 / 25', emoji: '🏆' },
  ];

  // Mock vehicle health metrics
  const checklist = [
    { item: 'Brakes & Air Pressure', status: 'Pass', color: '#10B981' },
    { item: 'Engine & Fluids', status: 'Pass', color: '#10B981' },
    { item: 'Fuel Level', status: '82% Full', color: '#2F80ED' },
    { item: 'Tires & Alignment', status: 'Pass', color: '#10B981' },
  ];

  return (
    <SafeAreaView style={[styles.safeContainer, themeStyles.bg]}>
      <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
        
        {/* Profile / Header */}
        <View style={styles.homeHeader}>
          <View style={styles.profileRow}>
            <View style={styles.avatarMock}>
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 16 }}>JC</Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.profileName, themeStyles.text]}>John Cena</Text>
              <Text style={styles.profileLocation}>🪪 ID: #DRV-LK772 • Route 138 Driver</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.themeToggle, themeStyles.toggleBg]} 
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Text style={{ fontSize: 16 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>

        {/* Live Shift Controller Panel */}
        <View style={[styles.shiftCard, themeStyles.cardBg, themeStyles.border]}>
          <View style={styles.shiftHeader}>
            <View style={styles.shiftBadgeRow}>
              <View style={[styles.pulseDot, { backgroundColor: isShiftActive ? '#10B981' : '#6B7280' }]} />
              <Text style={[styles.shiftStatusLabel, { color: isShiftActive ? '#10B981' : '#6B7280' }]}>
                {isShiftActive ? 'ACTIVE DUTY SHIFT' : 'SHIFT OFFLINE'}
              </Text>
            </View>
            <Text style={[styles.shiftBusDetails, themeStyles.textSec]}>Vehicle: Bus 138-A (WP ND-8842)</Text>
          </View>

          <Text style={[styles.shiftClock, themeStyles.text]}>
            {isShiftActive ? formatTime(shiftSeconds) : '--h --m --s'}
          </Text>

          <TouchableOpacity 
            style={[styles.shiftButton, isShiftActive ? styles.shiftButtonActive : styles.shiftButtonInactive]}
            onPress={toggleShift}
            activeOpacity={0.8}
          >
            <Text style={styles.shiftButtonText}>
              {isShiftActive ? '🛑 Clock Out / End Shift' : '🚀 Clock In / Start Shift'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Driver Action Panel */}
        <Text style={[styles.sectionHeading, themeStyles.text, { marginTop: 24 }]}>Console Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, themeStyles.cardBg, themeStyles.border]}
            onPress={() => router.push('/analytics')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionEmoji}>📊</Text>
            <Text style={[styles.actionLabel, themeStyles.text]}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, themeStyles.cardBg, themeStyles.border]}
            onPress={() => router.push('/diagnostics')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionEmoji}>⚙️</Text>
            <Text style={[styles.actionLabel, themeStyles.text]}>Telemetry</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, themeStyles.cardBg, themeStyles.border]}
            onPress={() => router.push('/break')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionEmoji}>☕</Text>
            <Text style={[styles.actionLabel, themeStyles.text]}>Tea Break</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, themeStyles.cardBg, themeStyles.border]}
            onPress={() => router.push('/chat')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionEmoji}>📡</Text>
            <Text style={[styles.actionLabel, themeStyles.text]}>Comms Hub</Text>
          </TouchableOpacity>
        </View>

        {/* Fleet Metrics Grid */}
        <Text style={[styles.sectionHeading, themeStyles.text, { marginTop: 24 }]}>Shift Performance Metrics</Text>
        <View style={styles.metricsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={[styles.metricCard, themeStyles.cardBg, themeStyles.border]}>
              <Text style={styles.metricEmoji}>{stat.emoji}</Text>
              <Text style={[styles.metricValue, themeStyles.text]}>{stat.value}</Text>
              <Text style={styles.metricLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Assigned Vehicle Logs */}
        <Text style={[styles.sectionHeading, themeStyles.text]}>Pre-Trip Checklist & Vehicle Diagnostics</Text>
        <View style={[styles.checklistCard, themeStyles.cardBg, themeStyles.border]}>
          {checklist.map((check, idx) => (
            <View key={check.item} style={[styles.checkRow, idx < checklist.length - 1 && styles.checkBorder]}>
              <Text style={[styles.checkItemText, themeStyles.text]}>🔧 {check.item}</Text>
              <View style={[styles.checkStatusBadge, { backgroundColor: check.color + '15' }]}>
                <Text style={[styles.checkStatusText, { color: check.color }]}>{check.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Fuel Management UI */}
        <Text style={[styles.sectionHeading, themeStyles.text, { marginTop: 24 }]}>Fuel Management</Text>
        <View style={[styles.fuelCard, themeStyles.cardBg, themeStyles.border]}>
          <View style={styles.fuelHeaderRow}>
            <Text style={[styles.fuelTitle, themeStyles.text]}>Current Fuel Level</Text>
            <Text style={[styles.fuelPercent, fuelLevel <= 15 ? { color: '#EF4444' } : { color: '#10B981' }]}>
              {fuelLevel}%
            </Text>
          </View>
          <View style={styles.fuelBarBackground}>
            <View style={[styles.fuelBarFill, { width: `${fuelLevel}%`, backgroundColor: fuelLevel <= 15 ? '#EF4444' : '#10B981' }]} />
          </View>
          <View style={styles.fuelActions}>
            <TouchableOpacity style={styles.fuelBtnSim} onPress={simulateFuelDrop}>
              <Text style={styles.fuelBtnText}>Simulate Drop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fuelBtnRefill} onPress={refuelVehicle}>
              <Text style={styles.fuelBtnTextRefill}>Refuel ⛽</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dispatch Bulletins */}
        <Text style={[styles.sectionHeading, themeStyles.text]}>Dispatch Bulletins</Text>
        <View style={[styles.bulletinCard, themeStyles.bulletinBg]}>
          <Text style={styles.bulletinTitle}>⚠️ Road Alerts & Delay Warning</Text>
          <Text style={styles.bulletinContent}>
            Heavy traffic jam reported at the Maharagama junction. Drivers on Route 138 are advised to divert via High Level Road bypass if spacing headway allows.
          </Text>
          <View style={styles.bulletinDivider} />
          <Text style={styles.bulletinMeta}>Issued by: Command Center • 14 mins ago</Text>
        </View>

      </ScrollView>

      {/* Global Tab Navigation */}
      <View style={[styles.navigationBarContainer, themeStyles.cardBg, themeStyles.border]}>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/home')}>
          <Text style={{ fontSize: 20 }}>🏠</Text>
          <Text style={[styles.navigationTabText, { color: '#2F80ED' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/tracker')}>
          <Text style={{ fontSize: 20 }}>🛰️</Text>
          <Text style={[styles.navigationTabText, themeStyles.textSec]}>Tracker</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/tickets')}>
          <Text style={{ fontSize: 20 }}>🎟️</Text>
          <Text style={[styles.navigationTabText, themeStyles.textSec]}>Tickets</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Themes
const lightTheme = {
  bg: { backgroundColor: '#F9FAFB' },
  cardBg: { backgroundColor: '#FFFFFF' },
  toggleBg: { backgroundColor: '#E5E7EB' },
  bulletinBg: { backgroundColor: '#FEF7E0' },
  text: { color: '#1F2937' },
  textSec: { color: '#6B7280' },
  border: { borderColor: '#E5E7EB' },
};

const darkTheme = {
  bg: { backgroundColor: '#111827' },
  cardBg: { backgroundColor: '#1F2937' },
  toggleBg: { backgroundColor: '#374151' },
  bulletinBg: { backgroundColor: '#2E2A1A' },
  text: { color: '#F9FAFB' },
  textSec: { color: '#9CA3AF' },
  border: { borderColor: '#374151' },
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  mainScroll: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 90,
  },
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarMock: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2F80ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
  },
  profileLocation: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  shiftStatusLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  shiftBusDetails: {
    fontSize: 10,
    fontWeight: '600',
  },
  shiftClock: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: 18,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  shiftButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftButtonActive: {
    backgroundColor: '#EF4444',
  },
  shiftButtonInactive: {
    backgroundColor: '#10B981',
  },
  shiftButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  metricCard: {
    width: (width - 42) / 2,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '800',
    marginTop: 4,
  },
  checklistCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  checkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  checkBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checkItemText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fuelCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  fuelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fuelTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  fuelPercent: {
    fontSize: 18,
    fontWeight: '900',
  },
  fuelBarBackground: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  fuelBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  fuelActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  fuelBtnSim: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  fuelBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  fuelBtnRefill: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  fuelBtnTextRefill: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  checkStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  checkStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bulletinCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEF08A',
    marginBottom: 16,
  },
  bulletinTitle: {
    color: '#B06000',
    fontSize: 13,
    fontWeight: '800',
  },
  bulletinContent: {
    color: '#713F12',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    fontWeight: '600',
  },
  bulletinDivider: {
    height: 1,
    backgroundColor: 'rgba(176, 96, 0, 0.1)',
    marginVertical: 10,
  },
  bulletinMeta: {
    color: '#A16207',
    fontSize: 9,
    fontWeight: '700',
  },
  navigationBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 12,
  },
  navigationTabItem: {
    alignItems: 'center',
  },
  navigationTabText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
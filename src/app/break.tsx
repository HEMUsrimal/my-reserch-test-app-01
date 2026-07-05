// src/app/break.tsx
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
} from 'react-native';

export default function Break() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [breakType, setBreakType] = useState<'Tea' | 'Lunch' | 'Fuel'>('Tea');
  
  // Timer States
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(900); // 15 mins for tea
  const intervalRef = useRef<any>(null);

  const themeStyles = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerActive]);

  const selectBreak = (type: 'Tea' | 'Lunch' | 'Fuel') => {
    setBreakType(type);
    setTimerActive(false);
    if (type === 'Tea') setSecondsLeft(900); // 15 mins
    else if (type === 'Lunch') setSecondsLeft(2700); // 45 mins
    else setSecondsLeft(600); // 10 mins
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const resetTimer = () => {
    setTimerActive(false);
    selectBreak(breakType);
  };

  // Mock nearby rest stops in Colombo
  const colomboStops = [
    { name: 'CEYPETCO Filling Station - Maharagama', dist: '1.2 km', facil: 'Refuel, Restroom, Tea House' },
    { name: 'LIOC Filling Station - Nugegoda', dist: '2.5 km', facil: 'Refuel, Quick Snacks, Restroom' },
    { name: 'Saranasiri Tea Cabin - Kottawa', dist: '3.4 km', facil: 'Local Meals, Sri Lankan Milk Tea ☕' },
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
            <Text style={[styles.title, themeStyles.text]}>Rest & Break Planner</Text>
            <Text style={styles.subtitle}>Driver Fatigue & Duty Regulations</Text>
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
        
        {/* Selector Pills */}
        <View style={styles.selectorGrid}>
          {[
            { id: 'Tea', label: 'Tea Break ☕' },
            { id: 'Lunch', label: 'Lunch Rest 🍛' },
            { id: 'Fuel', label: 'Fuel Stop ⛽' },
          ].map((item) => {
            const isSelected = breakType === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.selectorCard, themeStyles.cardBg, themeStyles.border, isSelected && styles.selectorCardActive]}
                onPress={() => selectBreak(item.id as any)}
              >
                <Text style={[styles.selectorLabel, themeStyles.text, isSelected && styles.selectorLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Timer Display */}
        <View style={[styles.timerCard, themeStyles.cardBg, themeStyles.border]}>
          <Text style={styles.timerSub}>Break Duration Remaining</Text>
          <Text style={[styles.timerValue, themeStyles.text]}>{formatTimer(secondsLeft)}</Text>
          
          <View style={styles.timerControls}>
            <TouchableOpacity 
              style={[styles.timerBtn, timerActive ? styles.timerBtnPause : styles.timerBtnStart]} 
              onPress={toggleTimer}
            >
              <Text style={styles.timerBtnText}>{timerActive ? 'Pause' : 'Start Break'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.timerBtnReset} onPress={resetTimer}>
              <Text style={styles.timerBtnResetText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nearby Registered Stops */}
        <Text style={[styles.sectionHeading, themeStyles.text]}>Nearby Sri Lankan Fuel & Rest Stops</Text>
        <View style={styles.stopList}>
          {colomboStops.map((stop) => (
            <View key={stop.name} style={[styles.stopCard, themeStyles.cardBg, themeStyles.border]}>
              <View style={styles.stopHeader}>
                <Text style={[styles.stopName, themeStyles.text]}>{stop.name}</Text>
                <Text style={styles.stopDist}>{stop.dist}</Text>
              </View>
              <Text style={styles.stopFacil}>Facilities: {stop.facil}</Text>
            </View>
          ))}
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
    fontSize: 20,
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
  selectorGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  selectorCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorCardActive: {
    borderColor: '#2F80ED',
    backgroundColor: '#E8F0FE',
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  selectorLabelActive: {
    color: '#2F80ED',
  },
  timerCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  timerSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerValue: {
    fontSize: 54,
    fontWeight: '900',
    marginVertical: 16,
    fontVariant: ['tabular-nums'],
  },
  timerControls: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  timerBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  timerBtnStart: {
    backgroundColor: '#2F80ED',
  },
  timerBtnPause: {
    backgroundColor: '#EF4444',
  },
  timerBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  timerBtnReset: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  timerBtnResetText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    color: '#6B7280',
  },
  stopList: {
    gap: 10,
  },
  stopCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stopName: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
    marginRight: 12,
  },
  stopDist: {
    fontSize: 11,
    color: '#2F80ED',
    fontWeight: '800',
  },
  stopFacil: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});

// src/app/analytics.tsx
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
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Analytics() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  const themeStyles = isDarkMode ? darkTheme : lightTheme;

  // Mock Performance Data
  const dailyStats = [
    { label: 'Total Earnings', value: 'LKR 8,450.00', change: '+12%', changeColor: '#10B981' },
    { label: 'Fuel Consumed', value: '28.4 Liters', change: '-4%', changeColor: '#10B981' },
    { label: 'Avg Efficiency', value: '5.2 km/L', change: 'Optimal', changeColor: '#2F80ED' },
    { label: 'Trip Schedule Delay', value: '4 mins', change: 'On Time', changeColor: '#10B981' },
  ];

  const weeklyStats = [
    { label: 'Total Earnings', value: 'LKR 58,120.00', change: '+8%', changeColor: '#10B981' },
    { label: 'Fuel Consumed', value: '194.2 Liters', change: '+2%', changeColor: '#EF4444' },
    { label: 'Avg Efficiency', value: '5.0 km/L', change: 'Stable', changeColor: '#2F80ED' },
    { label: 'Trip Schedule Delay', value: '18 mins', change: '96% Match', changeColor: '#10B981' },
  ];

  const monthlyStats = [
    { label: 'Total Earnings', value: 'LKR 245,600.00', change: '+15%', changeColor: '#10B981' },
    { label: 'Fuel Consumed', value: '820.5 Liters', change: '-6%', changeColor: '#10B981' },
    { label: 'Avg Efficiency', value: '5.4 km/L', change: 'Excellent', changeColor: '#10B981' },
    { label: 'Trip Schedule Delay', value: '72 mins', change: '98% Match', changeColor: '#10B981' },
  ];

  const activeStats = timeframe === 'Daily' ? dailyStats : timeframe === 'Weekly' ? weeklyStats : monthlyStats;

  // Mock Chart Bars
  const efficiencyChartData = [
    { day: 'Mon', value: 4.8 },
    { day: 'Tue', value: 5.2 },
    { day: 'Wed', value: 5.5 },
    { day: 'Thu', value: 4.9 },
    { day: 'Fri', value: 5.3 },
    { day: 'Sat', value: 5.6 },
    { day: 'Sun', value: 5.8 },
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
            <Text style={[styles.title, themeStyles.text]}>Performance Analytics</Text>
            <Text style={styles.subtitle}>ITS Dispatch & Telemetry Logs</Text>
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
        
        {/* Timeframe Selector */}
        <View style={[styles.selectorCard, themeStyles.cardBg, themeStyles.border]}>
          {(['Daily', 'Weekly', 'Monthly'] as const).map((t) => {
            const isSelected = timeframe === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.selectorBtn, isSelected && styles.selectorBtnActive]}
                onPress={() => setTimeframe(t)}
              >
                <Text style={[styles.selectorText, isSelected && styles.selectorTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {activeStats.map((stat) => (
            <View key={stat.label} style={[styles.statCard, themeStyles.cardBg, themeStyles.border]}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, themeStyles.text]}>{stat.value}</Text>
              <View style={styles.changeBadge}>
                <Text style={[styles.changeText, { color: stat.changeColor }]}>{stat.change}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Custom Visual Chart Component for Fuel Efficiency */}
        <Text style={[styles.sectionHeading, themeStyles.text]}>Fuel Efficiency Trend (km/L)</Text>
        <View style={[styles.chartCard, themeStyles.cardBg, themeStyles.border]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartSub, themeStyles.textSec]}>Weekly average: 5.3 km/L</Text>
            <View style={styles.targetIndicator}>
              <View style={styles.targetDot} />
              <Text style={styles.targetLabel}>Target (5.0 km/L)</Text>
            </View>
          </View>

          {/* Bar Chart Graphics */}
          <View style={styles.chartContainer}>
            {efficiencyChartData.map((data) => {
              const maxVal = 6.0;
              const barHeight = (data.value / maxVal) * 120;
              const isPassingTarget = data.value >= 5.0;

              return (
                <View key={data.day} style={styles.chartBarWrapper}>
                  <View style={styles.barValueWrapper}>
                    <Text style={styles.barValueText}>{data.value.toFixed(1)}</Text>
                  </View>
                  <View 
                    style={[
                      styles.chartBar, 
                      { height: barHeight, backgroundColor: isPassingTarget ? '#10B981' : '#F59E0B' }
                    ]} 
                  />
                  <Text style={styles.barLabel}>{data.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Trip Schedule Matching Log */}
        <Text style={[styles.sectionHeading, themeStyles.text]}>Recent Scheduling Logs</Text>
        <View style={[styles.logCard, themeStyles.cardBg, themeStyles.border]}>
          {[
            { id: '1', route: 'Route 138', time: '09:15 AM', status: 'On Time', diff: '0m delay', diffColor: '#10B981' },
            { id: '2', route: 'Route 138', time: '07:45 AM', status: 'Delayed', diff: '+12m delay', diffColor: '#EF4444' },
            { id: '3', route: 'Route 138', time: '05:30 AM', status: 'On Time', diff: '0m delay', diffColor: '#10B981' },
          ].map((log) => (
            <View key={log.id} style={styles.logRow}>
              <View>
                <Text style={[styles.logTitle, themeStyles.text]}>{log.route} - Trip {log.id}</Text>
                <Text style={styles.logSub}>{log.time}</Text>
              </View>
              <View style={styles.logStatus}>
                <Text style={[styles.logDiff, { color: log.diffColor }]}>{log.diff}</Text>
                <Text style={styles.logStatusText}>{log.status}</Text>
              </View>
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
  selectorCard: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  selectorBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectorBtnActive: {
    backgroundColor: '#2F80ED',
  },
  selectorText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '800',
  },
  selectorTextActive: {
    color: '#FFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 44) / 2,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    marginVertical: 6,
  },
  changeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    color: '#6B7280',
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartSub: {
    fontSize: 12,
    fontWeight: '700',
  },
  targetIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  targetLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingBottom: 8,
  },
  chartBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barValueWrapper: {
    marginBottom: 4,
  },
  barValueText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  chartBar: {
    width: 14,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '700',
    marginTop: 8,
  },
  logCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  logSub: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '600',
  },
  logStatus: {
    alignItems: 'flex-end',
  },
  logDiff: {
    fontSize: 13,
    fontWeight: '800',
  },
  logStatusText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '700',
    marginTop: 2,
  },
});

// src/app/tickets.tsx
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

export default function Tickets() {
  const router = useRouter();
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Scanner feedback state
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    passenger?: string;
  }>({ status: 'idle', message: 'Position passenger QR code inside the frame to scan.' });

  // Manual entry state
  const [ticketInput, setTicketInput] = useState<string>('');

  // Bus occupancy state
  const [passengerCount, setPassengerCount] = useState<number>(24);
  const maxCapacity = 45;

  const handleTestScan = (type: 'valid' | 'invalid') => {
    if (type === 'valid') {
      if (passengerCount >= maxCapacity) {
        setScanResult({
          status: 'error',
          message: 'Boarding Blocked: Vehicle at maximum capacity!',
        });
        return;
      }
      const names = ['Kasun Perera', 'Sanduni Silva', 'Nuwan Jayasinghe', 'Chamari Fernando', 'Dilshan Rathnayake'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      setPassengerCount((prev) => prev + 1);
      setScanResult({
        status: 'success',
        message: 'Boarding Approved • Ticket Valid',
        passenger: randomName,
      });
    } else {
      setScanResult({
        status: 'error',
        message: 'Access Denied • Expired or Invalid Pass',
      });
    }
  };

  const handleManualSubmit = () => {
    if (!ticketInput.trim()) return;
    if (ticketInput.length < 5) {
      setScanResult({
        status: 'error',
        message: 'Invalid Code Length • Must be at least 5 digits',
      });
      return;
    }
    
    // Simulate lookup
    if (ticketInput.startsWith('12')) {
      handleTestScan('valid');
    } else {
      handleTestScan('invalid');
    }
    setTicketInput('');
  };

  // Reset feedback to idle after 4 seconds
  useEffect(() => {
    if (scanResult.status !== 'idle') {
      const timer = setTimeout(() => {
        setScanResult({ status: 'idle', message: 'Ready for next scan.' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [scanResult.status]);

  const themeStyles = isDarkMode ? darkTheme : lightTheme;
  const occupancyPercentage = Math.round((passengerCount / maxCapacity) * 100);

  // Determine occupancy bar color
  let occupancyColor = '#10B981'; // Green
  if (occupancyPercentage > 85) {
    occupancyColor = '#EF4444'; // Red
  } else if (occupancyPercentage > 60) {
    occupancyColor = '#F59E0B'; // Orange/Yellow
  }

  return (
    <SafeAreaView style={[styles.safeContainer, themeStyles.bg]}>
      <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.topHeader}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={[styles.backIcon, themeStyles.text]}>⬅️</Text>
            </TouchableOpacity>
            <View style={styles.titleWrapper}>
              <Text style={[styles.screenHeading, themeStyles.text]}>Boarding Control</Text>
              <Text style={styles.screenSubtitle}>Passenger Ticket Validator</Text>
            </View>
            <TouchableOpacity 
              style={[styles.themeToggle, themeStyles.toggleBg]} 
              onPress={() => setIsDarkMode(!isDarkMode)}
            >
              <Text style={{ fontSize: 16 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Occupancy Hub */}
        <View style={[styles.occupancyCard, themeStyles.cardBg, themeStyles.border]}>
          <View style={styles.occupancyHeader}>
            <Text style={[styles.occupancyTitle, themeStyles.text]}>🚌 Passenger Occupancy</Text>
            <Text style={[styles.occupancyCountText, { color: occupancyColor }]}>
              {passengerCount} / {maxCapacity} ({occupancyPercentage}%)
            </Text>
          </View>
          
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${occupancyPercentage}%`, backgroundColor: occupancyColor }]} />
          </View>
          
          <Text style={[styles.occupancyGuidance, themeStyles.textSec]}>
            {occupancyPercentage >= 100 
              ? '🚨 Maximum load capacity reached! Do not board more riders.' 
              : occupancyPercentage > 80 
                ? '⚠️ Approaching full occupancy limits.' 
                : '✅ Safe occupancy levels. Boarding permitted.'}
          </Text>
        </View>

        {/* Ticket Scanner Mock View */}
        <View style={[styles.scannerContainer, themeStyles.cardBg, themeStyles.border]}>
          <Text style={[styles.scannerHeading, themeStyles.text]}>📷 Scan Boarding QR Pass</Text>
          
          <View style={styles.scannerFrameOuter}>
            <View style={styles.scannerFrameTarget}>
              {/* Animated laser line in css if web */}
              {Platform.OS === 'web' && (
                <div className="laser-line" />
              )}
              <View style={[styles.cornerBorder, styles.topLeft]} />
              <View style={[styles.cornerBorder, styles.topRight]} />
              <View style={[styles.cornerBorder, styles.bottomLeft]} />
              <View style={[styles.cornerBorder, styles.bottomRight]} />
              <Text style={styles.qrIconMock}>📱</Text>
            </View>
          </View>

          {/* Scanner Feedback Box */}
          <View style={[
            styles.feedbackBox,
            scanResult.status === 'success' && styles.feedbackSuccess,
            scanResult.status === 'error' && styles.feedbackError,
            scanResult.status === 'idle' && themeStyles.feedbackIdleBg,
          ]}>
            <Text style={[
              styles.feedbackText,
              scanResult.status === 'success' && { color: '#047857' },
              scanResult.status === 'error' && { color: '#B91C1C' },
              scanResult.status === 'idle' && themeStyles.text,
            ]}>
              {scanResult.status === 'success' ? '✅ Approved' : scanResult.status === 'error' ? '❌ Denied' : '🔍 Scanning'}
            </Text>
            <Text style={[
              styles.feedbackMessage,
              scanResult.status === 'success' && { color: '#065F46' },
              scanResult.status === 'error' && { color: '#991B1B' },
              scanResult.status === 'idle' && themeStyles.textSec,
            ]}>
              {scanResult.message}
            </Text>
            {scanResult.passenger && (
              <Text style={styles.passengerDetail}>Passenger: {scanResult.passenger}</Text>
            )}
          </View>

          {/* Scan Testing Actions */}
          <Text style={[styles.testLabel, themeStyles.textSec]}>TEST SCAN VALIDATION FEEDBACK:</Text>
          <View style={styles.testButtonsRow}>
            <TouchableOpacity 
              style={[styles.testBtn, styles.validBtn]} 
              onPress={() => handleTestScan('valid')}
              activeOpacity={0.8}
            >
              <Text style={styles.testBtnText}>✓ Scan Valid QR</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.testBtn, styles.invalidBtn]} 
              onPress={() => handleTestScan('invalid')}
              activeOpacity={0.8}
            >
              <Text style={styles.testBtnText}>✗ Scan Expired QR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Manual Pass Code Validator */}
        <View style={[styles.manualCard, themeStyles.cardBg, themeStyles.border]}>
          <Text style={[styles.manualHeading, themeStyles.text]}>⌨️ Manual Code Entry</Text>
          <Text style={[styles.manualSub, themeStyles.textSec]}>Enter the 6-digit ticket ID if the QR scanner is unresponsive.</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.codeInput, themeStyles.inputBg, themeStyles.text, themeStyles.inputBorder]}
              placeholder="e.g. 120892"
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
              value={ticketInput}
              onChangeText={setTicketInput}
              keyboardType="number-pad"
              maxLength={8}
            />
            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleManualSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Global Tab Navigation */}
      <View style={[styles.navigationBarContainer, themeStyles.cardBg, themeStyles.border]}>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/home')}>
          <Text style={{ fontSize: 20 }}>🏠</Text>
          <Text style={[styles.navigationTabText, themeStyles.textSec]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/tracker')}>
          <Text style={{ fontSize: 20 }}>🛰️</Text>
          <Text style={[styles.navigationTabText, themeStyles.textSec]}>Tracker</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/tickets')}>
          <Text style={{ fontSize: 20 }}>🎟️</Text>
          <Text style={[styles.navigationTabText, { color: '#2F80ED' }]}>Tickets</Text>
        </TouchableOpacity>
      </View>

      {/* Web custom styling for scanner animation */}
      {Platform.OS === 'web' && (
        <div style={{ display: 'none' }}>
          <style>{`
            .laser-line {
              position: absolute;
              left: 5%;
              width: 90%;
              height: 3px;
              background-color: #EF4444;
              box-shadow: 0 0 10px #EF4444;
              z-index: 5;
              animation: scanMotion 2.4s linear infinite;
            }
            @keyframes scanMotion {
              0% { top: 10%; }
              50% { top: 90%; }
              100% { top: 10%; }
            }
          `}</style>
        </div>
      )}
    </SafeAreaView>
  );
}

// Themes
const lightTheme = {
  bg: { backgroundColor: '#F9FAFB' },
  cardBg: { backgroundColor: '#FFFFFF' },
  toggleBg: { backgroundColor: '#E5E7EB' },
  feedbackIdleBg: { backgroundColor: '#F3F4F6' },
  inputBg: { backgroundColor: '#F3F4F6' },
  inputBorder: { borderColor: '#E5E7EB', borderWidth: 1 },
  text: { color: '#1F2937' },
  textSec: { color: '#6B7280' },
  border: { borderColor: '#E5E7EB', borderStyle: 'solid' as const },
};

const darkTheme = {
  bg: { backgroundColor: '#111827' },
  cardBg: { backgroundColor: '#1F2937' },
  toggleBg: { backgroundColor: '#374151' },
  feedbackIdleBg: { backgroundColor: '#374151' },
  inputBg: { backgroundColor: '#111827' },
  inputBorder: { borderColor: '#374151', borderWidth: 1 },
  text: { color: '#F9FAFB' },
  textSec: { color: '#9CA3AF' },
  border: { borderColor: '#374151', borderStyle: 'solid' as const },
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
  topHeader: {
    paddingBottom: 16,
    zIndex: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 4,
  },
  backIcon: {
    fontSize: 18,
  },
  titleWrapper: {
    flex: 1,
    marginLeft: 16,
  },
  screenHeading: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  occupancyCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  occupancyTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  occupancyCountText: {
    fontSize: 13,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  occupancyGuidance: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 10,
  },
  scannerContainer: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  scannerHeading: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 16,
  },
  scannerFrameOuter: {
    width: 170,
    height: 170,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scannerFrameTarget: {
    width: 140,
    height: 140,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrIconMock: {
    fontSize: 44,
    opacity: 0.25,
  },
  cornerBorder: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: '#2F80ED',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  feedbackBox: {
    width: '100%',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  feedbackSuccess: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  feedbackError: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '900',
  },
  feedbackMessage: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  passengerDetail: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    marginTop: 6,
  },
  testLabel: {
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.5,
    alignSelf: 'flex-start',
  },
  testButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  testBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validBtn: {
    backgroundColor: '#10B981',
  },
  invalidBtn: {
    backgroundColor: '#EF4444',
  },
  testBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  manualCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  manualHeading: {
    fontSize: 13,
    fontWeight: '800',
  },
  manualSub: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    height: 44,
    gap: 8,
  },
  codeInput: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '700',
    borderWidth: 1,
  },
  submitBtn: {
    backgroundColor: '#2F80ED',
    width: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
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
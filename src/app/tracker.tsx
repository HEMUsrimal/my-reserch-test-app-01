// src/app/tracker.tsx
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import GoogleMap, { BusMarker, LatLng } from '@/components/GoogleMap';

// Colombo Route Coordinates
// Route 138: Kottawa ➔ Pettah
const COLOMBO_138_COORDS: LatLng[] = [
  { latitude: 6.8402, longitude: 79.9654 }, // Kottawa
  { latitude: 6.8450, longitude: 79.9480 }, // Pannipitiya
  { latitude: 6.8511, longitude: 79.9212 }, // Maharagama
  { latitude: 6.8732, longitude: 79.8974 }, // Nugegoda
  { latitude: 6.8790, longitude: 79.8730 }, // Kirulapone
  { latitude: 6.8920, longitude: 79.8660 }, // Havelock Road
  { latitude: 6.9012, longitude: 79.8615 }, // Thummulla
  { latitude: 6.9080, longitude: 79.8625 }, // Colombo University
  { latitude: 6.9125, longitude: 79.8658 }, // Town Hall
  { latitude: 6.9240, longitude: 79.8550 }, // Colombo Fort
  { latitude: 6.9344, longitude: 79.8453 }, // Pettah
];

// Route 177: Kaduwela ➔ Kollupitiya
const COLOMBO_177_COORDS: LatLng[] = [
  { latitude: 6.9272, longitude: 79.9835 }, // Kaduwela
  { latitude: 6.9140, longitude: 79.9720 }, // Pittugala
  { latitude: 6.9043, longitude: 79.9614 }, // Malabe
  { latitude: 6.9080, longitude: 79.9320 }, // Koswatta
  { latitude: 6.8988, longitude: 79.9224 }, // Battaramulla
  { latitude: 6.9090, longitude: 79.8950 }, // Rajagiriya
  { latitude: 6.9140, longitude: 79.8780 }, // Borella
  { latitude: 6.9125, longitude: 79.8658 }, // Town Hall
  { latitude: 6.9120, longitude: 79.8507 }, // Kollupitiya
];

// Helper to calculate distance in km using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Tracker() {
  const router = useRouter();

  // Route & Settings states
  const [selectedRouteId, setSelectedRouteId] = useState<'route-12' | 'route-4'>('route-12'); // route-12 maps to 138, route-4 maps to 177 in SL context
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simIndex, setSimIndex] = useState<number>(0);
  const [driverStatus, setDriverStatus] = useState<'Active' | 'Break' | 'Emergency'>('Active');
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);
  
  // GPS hardware coordinates states
  const [deviceCoords, setDeviceCoords] = useState<LatLng | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);

  // Custom alerts array placed on the map
  const [incidents, setIncidents] = useState<BusMarker[]>([]);

  // Simulation interval ref
  const simInterval = useRef<any>(null);

  const currentRouteCoords = selectedRouteId === 'route-12' ? COLOMBO_138_COORDS : COLOMBO_177_COORDS;
  
  // Resolve driver's active position: Use real hardware GPS if not simulating, else simulate
  const currentPosition = isSimulating 
    ? (currentRouteCoords[simIndex] || currentRouteCoords[0])
    : (deviceCoords || currentRouteCoords[0]);

  // Request location permission on mount
  useEffect(() => {
    async function requestLocationPermission() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setHasLocationPermission(true);
          const initialLoc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setDeviceCoords({
            latitude: initialLoc.coords.latitude,
            longitude: initialLoc.coords.longitude,
          });
        } else {
          setHasLocationPermission(false);
        }
      } catch (err) {
        console.warn("Failed to request GPS permissions", err);
      }
    }
    requestLocationPermission();
  }, []);

  // Track live GPS hardware changes when simulation is OFF
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    async function startWatching() {
      if (hasLocationPermission && !isSimulating) {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 4000,
            distanceInterval: 8,
          },
          (location) => {
            setDeviceCoords({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        );
      }
    }

    startWatching();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [hasLocationPermission, isSimulating]);

  // 5-Second Real-Time Location Sync to Supabase
  useEffect(() => {
    let syncTimer: any = null;

    const syncLocationToSupabase = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return; // Must be logged in

      const driverBusPlate = selectedRouteId === 'route-12' ? 'WP ND-8842' : 'WP ND-1120';
      const routeNumber = selectedRouteId === 'route-12' ? '138' : '177';
      
      try {
        const { error } = await supabase
          .from('live_transit_locations')
          .upsert({
            bus_plate: driverBusPlate,
            driver_id: session.user.id,
            route_number: routeNumber,
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude,
            status: driverStatus,
            is_simulating: isSimulating,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.warn("Supabase location sync error:", error.message);
        }
      } catch (err) {
        console.warn("Supabase location sync failed:", err);
      }
    };

    // Run exactly every 5 seconds
    syncTimer = setInterval(syncLocationToSupabase, 5000);

    return () => {
      if (syncTimer) clearInterval(syncTimer);
    };
  }, [currentPosition, selectedRouteId, driverStatus, isSimulating]);

  // Spawn same-route buses dynamically based on selected route in Sri Lankan context
  const getSameRouteBuses = (): BusMarker[] => {
    if (selectedRouteId === 'route-12') {
      return [
        {
          id: 'bus-138b',
          coordinate: { latitude: 6.9125, longitude: 79.8658 }, // Ahead at Town Hall
          title: 'Bus 138B (Ahead)',
          plate: 'WP NA-4832',
          type: 'same-route',
          status: 'Active Duty',
          crowd: 'Medium',
        },
        {
          id: 'bus-138c',
          coordinate: { latitude: 6.8450, longitude: 79.9480 }, // Behind at Pannipitiya
          title: 'Bus 138C (Behind)',
          plate: 'WP NB-8821',
          type: 'same-route',
          status: 'Active Duty',
          crowd: 'Low',
        },
      ];
    } else {
      return [
        {
          id: 'bus-177b',
          coordinate: { latitude: 6.9090, longitude: 79.8950 }, // Ahead at Rajagiriya
          title: 'Bus 177B (Ahead)',
          plate: 'WP ND-9912',
          type: 'same-route',
          status: 'Active Duty',
          crowd: 'High',
        },
        {
          id: 'bus-177c',
          coordinate: { latitude: 6.9272, longitude: 79.9835 }, // Behind at Kaduwela
          title: 'Bus 177C (Behind)',
          plate: 'WP NC-2089',
          type: 'same-route',
          status: 'Active Duty',
          crowd: 'Low',
        },
      ];
    }
  };

  // Predefined bus halts with passengers waiting/tracking this bus
  const getPassengerHalts = (): BusMarker[] => {
    if (selectedRouteId === 'route-12') {
      return [
        {
          id: 'halt-maharagama',
          coordinate: { latitude: 6.8511, longitude: 79.9212 },
          title: 'Maharagama Junction Halt',
          plate: 'Route 138 Stop',
          type: 'passenger-halt',
          crowd: '7',
          status: 'Pettah (5), Town Hall (2)',
        },
        {
          id: 'halt-nugegoda',
          coordinate: { latitude: 6.8732, longitude: 79.8974 },
          title: 'Nugegoda Supercenter Halt',
          plate: 'Route 138 Stop',
          type: 'passenger-halt',
          crowd: '4',
          status: 'Pettah (4)',
        },
        {
          id: 'halt-kirulapone',
          coordinate: { latitude: 6.8790, longitude: 79.8730 },
          title: 'Kirulapone Market Halt',
          plate: 'Route 138 Stop',
          type: 'passenger-halt',
          crowd: '3',
          status: 'Colombo Fort (2), Pettah (1)',
        },
      ];
    } else {
      return [
        {
          id: 'halt-malabe',
          coordinate: { latitude: 6.9043, longitude: 79.9614 },
          title: 'Malabe Junction Halt',
          plate: 'Route 177 Stop',
          type: 'passenger-halt',
          crowd: '8',
          status: 'Kollupitiya (6), Town Hall (2)',
        },
        {
          id: 'halt-battaramulla',
          coordinate: { latitude: 6.8988, longitude: 79.9224 },
          title: 'Battaramulla Depot Halt',
          plate: 'Route 177 Stop',
          type: 'passenger-halt',
          crowd: '5',
          status: 'Kollupitiya (5)',
        },
        {
          id: 'halt-rajagiriya',
          coordinate: { latitude: 6.9090, longitude: 79.8950 },
          title: 'Rajagiriya Flyover Halt',
          plate: 'Route 177 Stop',
          type: 'passenger-halt',
          crowd: '3',
          status: 'Kollupitiya (3)',
        },
      ];
    }
  };

  // Compile all markers for the GoogleMap component
  const sameRouteBuses = getSameRouteBuses();
  const passengerHalts = getPassengerHalts();
  const allMarkers: BusMarker[] = [
    {
      id: 'driver-self',
      coordinate: currentPosition,
      title: 'My Bus (You)',
      plate: selectedRouteId === 'route-12' ? 'WP ND-8842' : 'WP ND-1120',
      type: 'self',
      status: driverStatus === 'Active' ? 'Active Duty' : driverStatus === 'Break' ? 'On Break' : 'Emergency Stop',
      crowd: 'Medium',
    },
    ...sameRouteBuses,
    ...passengerHalts,
    ...incidents,
  ];

  // Compute spacing details to the nearest bus (Ahead and Behind)
  const getSpacingInfo = () => {
    let aheadText = 'No buses ahead';
    let behindText = 'No buses behind';
    let warning = false;

    sameRouteBuses.forEach((bus) => {
      const dist = calculateDistance(
        currentPosition.latitude,
        currentPosition.longitude,
        bus.coordinate.latitude,
        bus.coordinate.longitude
      );

      // Determine spacing warnings (e.g. if buses are closer than 0.7 km)
      if (dist < 0.7) {
        warning = true;
      }

      const minutes = Math.round(dist * 3.5); // Travel time gap estimation (approx 3.5 mins per km in Colombo traffic)
      const label = `${dist.toFixed(1)} km (${minutes}m gap)`;

      if (bus.title.includes('Ahead')) {
        aheadText = label;
      } else if (bus.title.includes('Behind')) {
        behindText = label;
      }
    });

    return { aheadText, behindText, warning };
  };

  const spacing = getSpacingInfo();

  // Handle GPS simulation ticks
  useEffect(() => {
    if (isSimulating) {
      simInterval.current = setInterval(() => {
        setSimIndex((prev) => {
          if (prev >= currentRouteCoords.length - 1) {
            return 0; // Loop back
          }
          return prev + 1;
        });
      }, 3500); // Shift every 3.5 seconds
    } else {
      if (simInterval.current) {
        clearInterval(simInterval.current);
      }
    }

    return () => {
      if (simInterval.current) {
        clearInterval(simInterval.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSimulating, selectedRouteId]);

  // Handle Alert Broadcast
  const handleBroadcast = (type: string) => {
    const newIncident: BusMarker = {
      id: `incident-${incidents.length + 1}`,
      coordinate: {
        latitude: currentPosition.latitude + 0.0003, // Offset slightly
        longitude: currentPosition.longitude + 0.0003,
      },
      title: `${type} Alert`,
      plate: 'Broadcasted',
      type: 'incident',
      alertType: type,
    };

    setIncidents((prev) => [...prev, newIncident]);
    setBroadcastMessage(`🚨 Broadcasted: ${type}`);
    setTimeout(() => setBroadcastMessage(null), 4000);
  };

  const themeStyles = isDarkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.safeContainer, themeStyles.bg]}>
      {/* Dynamic Header */}
      <View style={[styles.topHeader, themeStyles.headerBorder, themeStyles.cardBg]}>
        <View style={styles.headerTitleRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backIcon, themeStyles.text]}>⬅️</Text>
          </TouchableOpacity>
          <View style={styles.titleWrapper}>
            <Text style={[styles.screenHeading, themeStyles.text]}>Fleet Hub</Text>
            <Text style={styles.screenSubtitle}>
              {selectedRouteId === 'route-12' ? 'Route 138: Kottawa - Pettah' : 'Route 177: Kaduwela - Kollupitiya'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.themeToggle, themeStyles.themeToggleBg]} 
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Text style={{ fontSize: 16 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Broadcast Toast Alert Banner */}
      {broadcastMessage && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastBannerText}>{broadcastMessage}</Text>
          <Text style={styles.toastBannerSub}>Alert pinned to route map & sent to fleet</Text>
        </View>
      )}

      {/* GPS Location Tracker Banner */}
      {!isSimulating && (
        <View style={[styles.gpsBanner, hasLocationPermission ? styles.gpsSuccess : styles.gpsWarning]}>
          <Text style={[styles.gpsBannerText, hasLocationPermission ? { color: '#047857' } : { color: '#B91C1C' }]}>
            {hasLocationPermission 
              ? `🛰️ Live GPS Active: Lat ${currentPosition.latitude.toFixed(4)}, Lng ${currentPosition.longitude.toFixed(4)}`
              : '⚠️ GPS Permissions Denied: Using Colombo Route Default Center'}
          </Text>
        </View>
      )}

      {/* Full-bleed Google Map container */}
      <View style={styles.mapContainer}>
        <GoogleMap
          center={currentPosition}
          zoom={14}
          markers={allMarkers}
          routeCoordinates={currentRouteCoords}
          showTraffic={showTraffic}
          isDarkMode={isDarkMode}
        />

        {/* Map Float HUD Panels */}
        <View style={styles.floatHudContainer}>
          <TouchableOpacity
            style={[styles.hudButton, themeStyles.cardBg, showTraffic && styles.hudButtonActive]}
            onPress={() => setShowTraffic(!showTraffic)}
            activeOpacity={0.8}
          >
            <Text style={styles.hudButtonText}>🚥</Text>
            <Text style={[styles.hudButtonLabel, themeStyles.text]}>Traffic</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.hudButton, themeStyles.cardBg, isSimulating && styles.hudButtonActive]}
            onPress={() => {
              setIsSimulating(!isSimulating);
              setSimIndex(0);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.hudButtonText}>{isSimulating ? '🛰️' : '🚗'}</Text>
            <Text style={[styles.hudButtonLabel, themeStyles.text]}>
              {isSimulating ? 'Live GPS' : 'Start Sim'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet Dashboard */}
      <View style={[styles.bottomDashboard, themeStyles.cardBg, themeStyles.headerBorder]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.bottomScroll}>
          
          {/* Duty Status + Route Selector */}
          <View style={styles.dashboardSectionRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.sectionLabel, themeStyles.textSec]}>MY DUTY STATUS</Text>
              <View style={styles.statusPillRow}>
                {(['Active', 'Break', 'Emergency'] as const).map((status) => {
                  const isActive = driverStatus === status;
                  let color = '#E6F4EA';
                  let textColor = '#137333';
                  if (status === 'Break') {
                    color = '#FEF7E0';
                    textColor = '#B06000';
                  } else if (status === 'Emergency') {
                    color = '#FCE8E6';
                    textColor = '#C5221F';
                  }

                  return (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setDriverStatus(status)}
                      style={[
                        styles.statusPill,
                        { backgroundColor: isActive ? textColor : color, borderColor: textColor },
                      ]}
                    >
                      <Text style={[styles.statusPillText, { color: isActive ? '#FFF' : textColor }]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={{ width: 155 }}>
              <Text style={[styles.sectionLabel, themeStyles.textSec]}>COLOMBO COMMUTER ROUTE</Text>
              <View style={styles.routePillRow}>
                <TouchableOpacity
                  style={[
                    styles.routePill,
                    selectedRouteId === 'route-12' && styles.routePillActive,
                  ]}
                  onPress={() => {
                    setSelectedRouteId('route-12');
                    setSimIndex(0);
                    setIncidents([]);
                  }}
                >
                  <Text style={[styles.routePillText, selectedRouteId === 'route-12' && styles.routePillTextActive]}>
                    Route 138
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.routePill,
                    selectedRouteId === 'route-4' && styles.routePillActive,
                  ]}
                  onPress={() => {
                    setSelectedRouteId('route-4');
                    setSimIndex(0);
                    setIncidents([]);
                  }}
                >
                  <Text style={[styles.routePillText, selectedRouteId === 'route-4' && styles.routePillTextActive]}>
                    Route 177
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Spacing and Fleet Spacing Warning Overlay */}
          <View style={[styles.spacingHub, themeStyles.sectionBg]}>
            <View style={styles.spacingHeader}>
              <Text style={[styles.spacingTitle, themeStyles.text]}>🔄 Colombo Spacing HUD</Text>
              {spacing.warning && (
                <View style={styles.bunchingWarning}>
                  <Text style={styles.bunchingWarningText}>⚠️ Bunching Risk</Text>
                </View>
              )}
            </View>
            
            <View style={styles.spacingMetricsRow}>
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>BUS AHEAD</Text>
                <Text style={[styles.metricValue, spacing.warning ? { color: '#EF4444' } : { color: '#2F80ED' }]}>
                  {spacing.aheadText}
                </Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>BUS BEHIND</Text>
                <Text style={[styles.metricValue, { color: '#10B981' }]}>
                  {spacing.behindText}
                </Text>
              </View>
            </View>
            {spacing.warning && (
              <Text style={styles.spacingGuidanceText}>
                💡 Colombo Hub Instruction: Adjust speed to maintain optimal passenger spacing interval.
              </Text>
            )}
          </View>

          {/* Upcoming Passenger Halts HUD */}
          <Text style={[styles.sectionLabel, themeStyles.textSec, { marginTop: 16 }]}>
            Upcoming Passenger Halts (Tracking This Bus)
          </Text>
          <View style={styles.haltsList}>
            {passengerHalts.map((halt) => (
              <View key={halt.id} style={[styles.haltItemCard, themeStyles.sectionBg]}>
                <View style={styles.haltHeaderRow}>
                  <Text style={[styles.haltItemName, themeStyles.text]}>🏣 {halt.title}</Text>
                  <View style={styles.haltTrackingBadge}>
                    <Text style={styles.haltTrackingText}>👥 {halt.crowd} tracking</Text>
                  </View>
                </View>
                <Text style={styles.haltDestinationsText}>
                  👉 Heading to: {halt.status}
                </Text>
              </View>
            ))}
          </View>

          {/* Quick Broadcast Alert actions */}
          <Text style={[styles.sectionLabel, themeStyles.textSec, { marginTop: 16 }]}>
            BROADCAST TRAFFIC ALERT
          </Text>
          <View style={styles.broadcastGrid}>
            {[
              { type: 'Traffic Jam', emoji: '🚗🚗' },
              { type: 'Breakdown', emoji: '🚨' },
              { type: 'High Crowd', emoji: '👥' },
              { type: 'Road Closed', emoji: '🚧' },
            ].map((alert) => (
              <TouchableOpacity
                key={alert.type}
                style={[styles.broadcastCard, themeStyles.sectionBg]}
                onPress={() => handleBroadcast(alert.type)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>{alert.emoji}</Text>
                <Text style={[styles.broadcastCardText, themeStyles.text]}>{alert.type}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </View>

      {/* Global Tab Navigation */}
      <View style={[styles.navigationBarContainer, themeStyles.cardBg, themeStyles.headerBorder]}>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/home')}>
          <Text style={{ fontSize: 20 }}>🏠</Text>
          <Text style={[styles.navigationTabText, themeStyles.textSec]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/tracker')}>
          <Text style={{ fontSize: 20 }}>🛰️</Text>
          <Text style={[styles.navigationTabText, { color: '#2F80ED' }]}>Tracker</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navigationTabItem} onPress={() => router.replace('/tickets')}>
          <Text style={{ fontSize: 20 }}>🎟️</Text>
          <Text style={[styles.navigationTabText, themeStyles.textSec]}>Tickets</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Light Theme Palettes
const lightTheme = {
  bg: { backgroundColor: '#F9FAFB' },
  cardBg: { backgroundColor: '#FFFFFF' },
  sectionBg: { backgroundColor: '#F3F4F6' },
  text: { color: '#1F2937' },
  textSec: { color: '#6B7280' },
  headerBorder: { borderBottomColor: '#E5E7EB', borderTopColor: '#E5E7EB' },
  themeToggleBg: { backgroundColor: '#F3F4F6' },
};

// Dark Theme Palettes
const darkTheme = {
  bg: { backgroundColor: '#111827' },
  cardBg: { backgroundColor: '#1F2937' },
  sectionBg: { backgroundColor: '#374151' },
  text: { color: '#F9FAFB' },
  textSec: { color: '#9CA3AF' },
  headerBorder: { borderBottomColor: '#374151', borderTopColor: '#374151' },
  themeToggleBg: { backgroundColor: '#374151' },
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 12,
    borderBottomWidth: 1,
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
  toastBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 88 : 108,
    left: 16,
    right: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  toastBannerText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  toastBannerSub: {
    color: '#FEE2E2',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  gpsBanner: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  gpsSuccess: {
    backgroundColor: '#D1FAE5',
  },
  gpsWarning: {
    backgroundColor: '#FEE2E2',
  },
  gpsBannerText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  floatHudContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    gap: 8,
  },
  hudButton: {
    width: 64,
    paddingVertical: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  hudButtonActive: {
    backgroundColor: '#E8F0FE',
    borderColor: '#2F80ED',
  },
  hudButtonText: {
    fontSize: 18,
  },
  hudButtonLabel: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 4,
    textAlign: 'center',
  },
  bottomDashboard: {
    height: 310,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 78, // Space for nav tab bar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  bottomScroll: {
    paddingBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dashboardSectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  routePillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  routePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  routePillActive: {
    backgroundColor: '#E8F0FE',
    borderColor: '#2F80ED',
  },
  routePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
  },
  routePillTextActive: {
    color: '#2F80ED',
  },
  spacingHub: {
    borderRadius: 14,
    padding: 12,
  },
  spacingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  spacingTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  bunchingWarning: {
    backgroundColor: '#FCE8E6',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bunchingWarningText: {
    color: '#C5221F',
    fontSize: 9,
    fontWeight: '800',
  },
  spacingMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricBlock: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '800',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  spacingGuidanceText: {
    fontSize: 10,
    color: '#B06000',
    marginTop: 8,
    lineHeight: 14,
    fontWeight: '600',
  },
  broadcastGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  broadcastCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  broadcastCardText: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
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
  haltsList: {
    gap: 8,
  },
  haltItemCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  haltHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  haltItemName: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  haltTrackingBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  haltTrackingText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
  },
  haltDestinationsText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
  },
});
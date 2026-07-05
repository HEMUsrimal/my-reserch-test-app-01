// src/components/GoogleMap.tsx
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Callout } from 'react-native-maps';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface BusMarker {
  id: string;
  coordinate: LatLng;
  title: string;
  plate: string;
  type: 'self' | 'same-route' | 'incident' | 'passenger-halt';
  status?: string;
  crowd?: string;
  alertType?: string;
}

export interface GoogleMapProps {
  center: LatLng;
  zoom: number;
  markers: BusMarker[];
  routeCoordinates?: LatLng[];
  showTraffic?: boolean;
  isDarkMode?: boolean;
  style?: any;
}

export default function GoogleMap({
  center,
  zoom,
  markers,
  routeCoordinates = [],
  showTraffic = false,
  isDarkMode = false,
  style,
}: GoogleMapProps) {
  const mapRef = useRef<MapView>(null);

  // Keep center updated
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }, 1000);
    }
  }, [center]);

  const mapStyle = isDarkMode ? darkMapStyle : lightMapStyle;

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsTraffic={showTraffic}
        customMapStyle={mapStyle}
        showsUserLocation={true}
        showsMyLocationButton={true}
        initialRegion={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      >
        {/* Render Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#2F80ED"
            strokeWidth={4}
            geodesic={true}
          />
        )}

        {/* Render Custom Markers */}
        {markers.map((marker) => {
          let pinColor = '#2F80ED'; // Default Blue (Self)
          if (marker.type === 'same-route') pinColor = '#10B981'; // Green
          if (marker.type === 'incident') pinColor = '#EF4444'; // Red
          if (marker.type === 'passenger-halt') pinColor = '#F59E0B'; // Amber

          return (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.coordinate.latitude,
                longitude: marker.coordinate.longitude,
              }}
              pinColor={pinColor}
              title={marker.title}
              description={`Plate: ${marker.plate}`}
            >
              <Callout tooltip>
                <View style={styles.calloutBubble}>
                  {marker.type === 'passenger-halt' ? (
                    <>
                      <Text style={styles.calloutTitle}>🏣 {marker.title}</Text>
                      <Text style={styles.calloutCrowd}>👥 {marker.crowd || '0'} tracking bus</Text>
                      {marker.status && (
                        <Text style={styles.calloutStatus}>👉 Heading to: {marker.status}</Text>
                      )}
                    </>
                  ) : (
                    <>
                      <Text style={styles.calloutTitle}>{marker.title}</Text>
                      <Text style={styles.calloutSub}>Plate: {marker.plate}</Text>
                      {marker.crowd && (
                        <Text style={styles.calloutCrowd}>👥 {marker.crowd} Capacity</Text>
                      )}
                      {marker.status && (
                        <Text style={styles.calloutStatus}>● {marker.status}</Text>
                      )}
                      {marker.alertType && (
                        <Text style={styles.calloutAlert}>⚠️ Alert: {marker.alertType}</Text>
                      )}
                    </>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  calloutBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: '800',
    fontSize: 13,
    color: '#1F2937',
  },
  calloutSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  calloutCrowd: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2F80ED',
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  calloutStatus: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 4,
  },
  calloutAlert: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
    marginTop: 6,
  },
});

const lightMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
];

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#181818' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
];

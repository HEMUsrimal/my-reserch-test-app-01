// src/components/GoogleMap.web.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface BusMarker {
  id: string;
  coordinate: LatLng;
  title: string;
  plate: string;
  type: 'self' | 'same-route' | 'incident';
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

declare global {
  interface Window {
    google: any;
    L: any;
  }
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'google' | 'leaflet' | null>(null);

  // References to actual map objects
  const googleMapRef = useRef<any>(null);
  const googleMarkersRef = useRef<{ [key: string]: any }>({});
  const googlePolylineRef = useRef<any>(null);
  const googleTrafficLayerRef = useRef<any>(null);

  const leafletMapRef = useRef<any>(null);
  const leafletMarkersRef = useRef<{ [key: string]: any }>({});
  const leafletPolylineRef = useRef<any>(null);
  const leafletTileLayerRef = useRef<any>(null);

  // API Key Check
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    let active = true;

    async function loadMapLibrary() {
      try {
        if (apiKey && apiKey !== 'YOUR_API_KEY') {
          // --- Load Google Maps API ---
          if (window.google && window.google.maps) {
            if (active) {
              setMapType('google');
              setMapLoaded(true);
            }
            return;
          }

          // Check if script is already added
          const scriptId = 'google-maps-script';
          let script = document.getElementById(scriptId) as HTMLScriptElement;
          
          if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
          }

          const checkGoogle = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(checkGoogle);
              if (active) {
                setMapType('google');
                setMapLoaded(true);
              }
            }
          }, 100);

          // Timeout after 8 seconds
          setTimeout(() => {
            clearInterval(checkGoogle);
            if (active && !window.google) {
              console.warn("Google Maps load timeout. Falling back to Leaflet.");
              loadLeafletFallback();
            }
          }, 8000);
        } else {
          // --- Load Leaflet as Fallback ---
          loadLeafletFallback();
        }
      } catch (err) {
        console.error("Map loading error: ", err);
        if (active) {
          setLoadingError("Failed to initialize map framework.");
        }
      }
    }

    function loadLeafletFallback() {
      // Inject CSS
      const cssId = 'leaflet-css';
      if (!document.getElementById(cssId)) {
        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Inject JS
      const jsId = 'leaflet-js';
      if (window.L) {
        if (active) {
          setMapType('leaflet');
          setMapLoaded(true);
        }
        return;
      }

      let script = document.getElementById(jsId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = jsId;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        document.head.appendChild(script);
      }

      const checkLeaflet = setInterval(() => {
        if (window.L) {
          clearInterval(checkLeaflet);
          if (active) {
            setMapType('leaflet');
            setMapLoaded(true);
          }
        }
      }, 100);
    }

    loadMapLibrary();

    return () => {
      active = false;
    };
  }, [apiKey]);

  // ================= GOOGLE MAP LOGIC =================
  function initializeGoogleMap() {
    if (!containerRef.current || googleMapRef.current) return;

    const mapOptions = {
      center: { lat: center.latitude, lng: center.longitude },
      zoom: zoom,
      disableDefaultUI: true,
      zoomControl: true,
      styles: getGoogleMapStyle(isDarkMode),
    };

    googleMapRef.current = new window.google.maps.Map(containerRef.current, mapOptions);
    updateGoogleMarkers();
    updateGooglePolyline();

    if (showTraffic) {
      googleTrafficLayerRef.current = new window.google.maps.TrafficLayer();
      googleTrafficLayerRef.current.setMap(googleMapRef.current);
    }
  };

  function updateGoogleMarkers() {
    const map = googleMapRef.current;
    if (!map) return;

    // Remove obsolete markers
    Object.keys(googleMarkersRef.current).forEach(id => {
      if (!markers.find(m => m.id === id)) {
        googleMarkersRef.current[id].setMap(null);
        delete googleMarkersRef.current[id];
      }
    });

    // Add or Update markers
    markers.forEach(marker => {
      const position = { lat: marker.coordinate.latitude, lng: marker.coordinate.longitude };
      
      if (googleMarkersRef.current[marker.id]) {
        // Move existing marker
        googleMarkersRef.current[marker.id].setPosition(position);
      } else {
        // Create new Marker with custom Label or Pin
        const pinSymbol = getGooglePinSymbol(marker);
        const mapMarker = new window.google.maps.Marker({
          position,
          map,
          title: marker.title,
          icon: pinSymbol,
        });

        // Add info window on click
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="font-family: system-ui, sans-serif; padding: 6px; min-width: 140px; color: #1F2937">
              <b style="font-size: 13px;">${marker.title}</b>
              <div style="font-size: 11px; color: #6B7280; margin-top: 2px;">Plate: ${marker.plate}</div>
              ${marker.crowd ? `<div style="font-size: 11px; margin-top: 4px;"><span style="background-color: #E8F0FE; padding: 2px 6px; border-radius: 4px; color: #2F80ED; font-weight: bold;">👥 ${marker.crowd}</span></div>` : ''}
              ${marker.status ? `<div style="font-size: 10px; color: #10B981; margin-top: 4px; font-weight: 600;">● ${marker.status}</div>` : ''}
              ${marker.alertType ? `<div style="font-size: 11px; color: #EF4444; font-weight: bold; margin-top: 6px;">⚠️ Broadcast: ${marker.alertType}</div>` : ''}
            </div>
          `
        });

        mapMarker.addListener('click', () => {
          infoWindow.open(map, mapMarker);
        });

        googleMarkersRef.current[marker.id] = mapMarker;
      }
    });
  };

  function updateGooglePolyline() {
    const map = googleMapRef.current;
    if (!map) return;

    if (googlePolylineRef.current) {
      googlePolylineRef.current.setMap(null);
    }

    if (routeCoordinates && routeCoordinates.length > 0) {
      const path = routeCoordinates.map(c => ({ lat: c.latitude, lng: c.longitude }));
      googlePolylineRef.current = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#2F80ED',
        strokeOpacity: 0.8,
        strokeWeight: 4,
      });
      googlePolylineRef.current.setMap(map);
    }
  };

  function getGooglePinSymbol(marker: BusMarker) {
    // Return custom marker options
    let color = '#2F80ED'; // Default Blue (Self)
    let scale = 1.0;

    if (marker.type === 'self') {
      color = '#2F80ED';
    } else if (marker.type === 'same-route') {
      color = '#10B981'; // Green
    } else if (marker.type === 'incident') {
      color = '#EF4444'; // Red
      scale = 1.2;
    }

    return {
      path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
      scale: 6 * scale,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      labelOrigin: new window.google.maps.Point(0, -2.5),
    };
  };

  function getGoogleMapStyle(dark: boolean) {
    if (!dark) {
      // Custom silver light map theme
      return [
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
    } else {
      // Dark Mode theme
      return [
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
    }
  };

  // ================= LEAFLET MAP LOGIC =================
  function initializeLeafletMap() {
    if (!containerRef.current || leafletMapRef.current) return;
    const L = window.L;

    leafletMapRef.current = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([center.latitude, center.longitude], zoom);

    // Zoom controls at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(leafletMapRef.current);

    updateLeafletTiles();
    updateLeafletMarkers();
    updateLeafletPolyline();
  };

  function updateLeafletTiles() {
    const L = window.L;
    const map = leafletMapRef.current;
    if (!map) return;

    if (leafletTileLayerRef.current) {
      map.removeLayer(leafletTileLayerRef.current);
    }

    const tileUrl = isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' // Sleek Dark Mode
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'; // Silver/Voyager Light

    leafletTileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(map);
  };

  function updateLeafletMarkers() {
    const L = window.L;
    const map = leafletMapRef.current;
    if (!map) return;

    // Remove obsolete markers
    Object.keys(leafletMarkersRef.current).forEach(id => {
      if (!markers.find(m => m.id === id)) {
        map.removeLayer(leafletMarkersRef.current[id]);
        delete leafletMarkersRef.current[id];
      }
    });

    // Add or Update markers
    markers.forEach(marker => {
      const latlng: [number, number] = [marker.coordinate.latitude, marker.coordinate.longitude];
      
      if (leafletMarkersRef.current[marker.id]) {
        // Move existing
        leafletMarkersRef.current[marker.id].setLatLng(latlng);
      } else {
        // Create custom Leaflet DivIcon for premium visual styling
        let iconHtml = '';
        let className = 'custom-leaflet-marker';
        
        if (marker.type === 'self') {
          iconHtml = `
            <div class="marker-pulse-ring"></div>
            <div class="marker-pin pin-self">
              <span class="emoji">🚌</span>
            </div>
          `;
        } else if (marker.type === 'same-route') {
          iconHtml = `
            <div class="marker-pin pin-same-route">
              <span class="emoji">🚌</span>
            </div>
          `;
        } else if (marker.type === 'incident') {
          iconHtml = `
            <div class="marker-pulse-ring-red"></div>
            <div class="marker-pin pin-incident">
              <span class="emoji">⚠️</span>
            </div>
          `;
        }

        const customIcon = L.divIcon({
          html: iconHtml,
          className: className,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -35]
        });

        const leafletMarker = L.marker(latlng, { icon: customIcon }).addTo(map);

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; padding: 2px; min-width: 140px; color: #1F2937">
            <b style="font-size: 13px; color: #111827; display: block; margin-bottom: 2px;">${marker.title}</b>
            <span style="font-size: 11px; color: #6B7280; display: block;">Plate: ${marker.plate}</span>
            ${marker.crowd ? `<div style="font-size: 10px; margin-top: 6px;"><span style="background-color: #E8F0FE; padding: 2px 6px; border-radius: 4px; color: #2F80ED; font-weight: bold;">👥 ${marker.crowd}</span></div>` : ''}
            ${marker.status ? `<div style="font-size: 10px; color: #10B981; margin-top: 4px; font-weight: 600;">● ${marker.status}</div>` : ''}
            ${marker.alertType ? `<div style="font-size: 11px; color: #EF4444; font-weight: bold; margin-top: 6px;">⚠️ Broadcast: ${marker.alertType}</div>` : ''}
          </div>
        `;

        leafletMarker.bindPopup(popupContent);
        leafletMarkersRef.current[marker.id] = leafletMarker;
      }
    });
  };

  function updateLeafletPolyline() {
    const L = window.L;
    const map = leafletMapRef.current;
    if (!map) return;

    if (leafletPolylineRef.current) {
      map.removeLayer(leafletPolylineRef.current);
    }

    if (routeCoordinates && routeCoordinates.length > 0) {
      const latlngs = routeCoordinates.map(c => [c.latitude, c.longitude] as [number, number]);
      leafletPolylineRef.current = L.polyline(latlngs, {
        color: '#2F80ED',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round'
      }).addTo(map);
    }
  };

  // Handle Map Initialization & Marker Updates
  useEffect(() => {
    if (!mapLoaded || !containerRef.current) return;

    if (mapType === 'google') {
      initializeGoogleMap();
    } else if (mapType === 'leaflet') {
      initializeLeafletMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, mapType]);

  // Handle Updates (Center, Markers, Route, Traffic, DarkMode)
  useEffect(() => {
    if (!mapLoaded) return;

    if (mapType === 'google' && googleMapRef.current) {
      // Update Center
      googleMapRef.current.setCenter({ lat: center.latitude, lng: center.longitude });
      
      // Update Markers
      updateGoogleMarkers();
      
      // Update Polyline
      updateGooglePolyline();

      // Update Traffic
      if (showTraffic) {
        if (!googleTrafficLayerRef.current) {
          googleTrafficLayerRef.current = new window.google.maps.TrafficLayer();
        }
        googleTrafficLayerRef.current.setMap(googleMapRef.current);
      } else if (googleTrafficLayerRef.current) {
        googleTrafficLayerRef.current.setMap(null);
      }
    } else if (mapType === 'leaflet' && leafletMapRef.current) {
      // Update Center
      leafletMapRef.current.setView([center.latitude, center.longitude]);
      
      // Update Tiles (Light vs Dark)
      updateLeafletTiles();

      // Update Markers
      updateLeafletMarkers();

      // Update Polyline
      updateLeafletPolyline();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, markers, routeCoordinates, showTraffic, isDarkMode, mapLoaded]);

  if (loadingError) {
    return (
      <View style={[styles.errorContainer, style]}>
        <Text style={styles.errorText}>⚠️ {loadingError}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.mapWrapper, style]}>
      {!mapLoaded && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F80ED" />
          <Text style={styles.loadingText}>Initializing Transit Map Engine...</Text>
        </View>
      )}
      
      {/* HTML Injection for Custom Marker Animations in Leaflet Fallback */}
      {mapType === 'leaflet' && (
        <div style={{ display: 'none' }}>
          <style>{`
            .custom-leaflet-marker {
              position: relative;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .marker-pin {
              width: 32px;
              height: 32px;
              border-radius: 50% 50% 50% 0;
              background: #2F80ED;
              position: absolute;
              transform: rotate(-45deg);
              left: 50%;
              top: 50%;
              margin: -16px 0 0 -16px;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
              border: 2px solid #FFFFFF;
              display: flex;
              justify-content: center;
              align-items: center;
              transition: all 0.2s ease;
            }
            .marker-pin:hover {
              transform: rotate(-45deg) scale(1.1);
              box-shadow: 0 10px 15px -3px rgba(47,128,237,0.3);
            }
            .pin-self {
              background: #2F80ED;
            }
            .pin-same-route {
              background: #10B981;
            }
            .pin-incident {
              background: #EF4444;
            }
            .marker-pin .emoji {
              transform: rotate(45deg);
              font-size: 16px;
              display: block;
            }
            .marker-pulse-ring {
              border: 3px solid #2F80ED;
              border-radius: 30px;
              height: 48px;
              width: 48px;
              position: absolute;
              left: -4px;
              top: -12px;
              animation: pulsate 1.8s ease-out infinite;
              opacity: 0.0;
              pointer-events: none;
            }
            .marker-pulse-ring-red {
              border: 3px solid #EF4444;
              border-radius: 30px;
              height: 48px;
              width: 48px;
              position: absolute;
              left: -4px;
              top: -12px;
              animation: pulsate 1.5s ease-out infinite;
              opacity: 0.0;
              pointer-events: none;
            }
            @keyframes pulsate {
              0% { transform: scale(0.1, 0.1); opacity: 0.0; }
              50% { opacity: 0.6; }
              100% { transform: scale(1.2, 1.2); opacity: 0.0; }
            }
            .leaflet-popup-content-wrapper {
              border-radius: 12px;
              padding: 4px;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
            .leaflet-popup-tip {
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
          `}</style>
        </div>
      )}

      {/* Map container */}
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '700',
  },
});

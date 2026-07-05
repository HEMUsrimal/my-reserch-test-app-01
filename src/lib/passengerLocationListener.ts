// src/lib/passengerLocationListener.ts
// This is a template utility for the Passenger App to listen to live bus locations.
// Copy this into your Passenger App project when you build it.

import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase'; // Ensure your passenger app also has Firebase initialized

export interface TransitLocation {
  id: string; // Bus Plate Number
  latitude: number;
  longitude: number;
  routeId: string;
  driverId: string;
  lastUpdated: any; // Firestore Timestamp
  status: string;
  isSimulating: boolean;
}

/**
 * Listens for real-time location updates of buses on a specific route.
 *
 * @param routeId - The route to listen to (e.g., 'Route 138').
 * @param callback - Function called whenever the data updates. Receives an array of active bus locations.
 * @returns An unsubscribe function to clean up the listener when the component unmounts.
 */
export function listenToRouteLocations(routeId: string, callback: (locations: TransitLocation[]) => void) {
  // Query all active buses currently operating on the specified route
  const q = query(
    collection(db, 'live_transit_locations'),
    where('routeId', '==', routeId)
  );

  // Subscribe to real-time updates
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const locations: TransitLocation[] = [];
    querySnapshot.forEach((doc) => {
      // Map Firestore document data to our interface
      const data = doc.data();
      locations.push({
        id: doc.id,
        latitude: data.latitude,
        longitude: data.longitude,
        routeId: data.routeId,
        driverId: data.driverId,
        lastUpdated: data.lastUpdated,
        status: data.status,
        isSimulating: data.isSimulating,
      });
    });

    // Fire callback to update the Passenger UI map
    callback(locations);
  }, (error) => {
    console.error("Passenger App Error: Failed to listen to live transit locations:", error);
  });

  return unsubscribe;
}

/* 
 * =========================================================
 * REACT HOOK EXAMPLE FOR THE PASSENGER APP:
 * =========================================================
 * 
 * import { useEffect, useState } from 'react';
 * import { listenToRouteLocations, TransitLocation } from '@/lib/passengerLocationListener';
 * 
 * export function useLiveBuses(routeId: string) {
 *   const [buses, setBuses] = useState<TransitLocation[]>([]);
 * 
 *   useEffect(() => {
 *     // Start listening when the component mounts
 *     const unsubscribe = listenToRouteLocations(routeId, (updatedBuses) => {
 *       setBuses(updatedBuses);
 *     });
 * 
 *     // Stop listening when the component unmounts
 *     return () => unsubscribe();
 *   }, [routeId]);
 * 
 *   return buses;
 * }
 */

// src/lib/passengerLocationListener.ts
// Reusable template utility for the Passenger App to listen to live bus locations.
// Copy this file into your Passenger App project when you build it.

import { supabase } from './supabase'; // Ensure your passenger app also has Supabase initialized

export interface TransitLocation {
  bus_plate: string;
  driver_id: string;
  route_number: string;
  latitude: number;
  longitude: number;
  status: 'Active' | 'Break' | 'Emergency';
  is_simulating: boolean;
  updated_at: string;
}

/**
 * Listens to real-time location updates of buses on a specific route using Supabase Realtime.
 *
 * @param routeNumber - The Sri Lankan route number to track (e.g., '138').
 * @param callback - Callback triggered when a location is created or updated.
 * @returns An unsubscribe function to clean up the channel listener.
 */
export function listenToLiveRouteLocations(
  routeNumber: string,
  callback: (location: TransitLocation) => void
) {
  // Subscribe to public.live_transit_locations updates matching the route number filter
  const channel = supabase
    .channel(`live-transit-locations-${routeNumber}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'live_transit_locations',
        filter: `route_number=eq.${routeNumber}`,
      },
      (payload) => {
        // payload.new contains the updated row
        if (payload.new && Object.keys(payload.new).length > 0) {
          callback(payload.new as TransitLocation);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to real-time updates for Route ${routeNumber}`);
      }
    });

  // Return function to unsubscribe
  return () => {
    supabase.removeChannel(channel);
  };
}

/*
 * =========================================================
 * REACT HOOK EXAMPLE FOR THE PASSENGER APP:
 * =========================================================
 *
 * import { useEffect, useState } from 'react';
 * import { listenToLiveRouteLocations, TransitLocation } from '@/lib/passengerLocationListener';
 *
 * export function useLiveRouteBuses(routeNumber: string) {
 *   const [buses, setBuses] = useState<{ [plate: string]: TransitLocation }>({});
 *
 *   useEffect(() => {
 *     const unsubscribe = listenToLiveRouteLocations(routeNumber, (updatedBus) => {
 *       setBuses((prev) => ({
 *         ...prev,
 *         [updatedBus.bus_plate]: updatedBus,
 *       }));
 *     });
 *
 *     return () => unsubscribe();
 *   }, [routeNumber]);
 *
 *   // Returns an array of active bus locations
 *   return Object.values(buses).filter(
 *     (bus) =>
 *       // Only display buses active in the last 1 minute
 *       new Date().getTime() - new Date(bus.updated_at).getTime() < 60000
 *   );
 * }
 */

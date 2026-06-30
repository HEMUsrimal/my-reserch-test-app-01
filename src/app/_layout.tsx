

// src/app/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
  
    <Stack
      screenOptions={{
        headerShown: false, // Hides default top headers for custom UI
        animation: 'slide_from_right', // Smooth transition animations
      
      }}
    />
  );
}

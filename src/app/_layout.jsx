import React from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { BricolageGrotesque_600SemiBold } from '@expo-google-fonts/bricolage-grotesque';
import { AppProvider } from '../state/AppContext';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, BricolageGrotesque_600SemiBold });
  if (!fontsLoaded) return null;
  return <SafeAreaProvider><AppProvider><Stack screenOptions={{ headerShown: false, animation: 'none' }} /></AppProvider></SafeAreaProvider>;
}

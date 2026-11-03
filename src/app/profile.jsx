import React from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import ProfileScreen from '../components/ProfileScreen';
import { useApp } from '../state/AppContext';

export default function ProfileRoute() {
  const { ready, demoSignedIn } = useApp();
  if (!ready) return <View />;
  if (!demoSignedIn) return <Redirect href="/login" />;
  return <ProfileScreen />;
}

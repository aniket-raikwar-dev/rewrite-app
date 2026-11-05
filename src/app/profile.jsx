import React from 'react';
import { Redirect } from 'expo-router';
import Splash from '../components/Splash';
import ProfileScreen from '../components/ProfileScreen';
import { useApp } from '../state/AppContext';

export default function ProfileRoute() {
  const { ready, isSignedIn } = useApp();
  if (!ready) return <Splash />;
  if (!isSignedIn) return <Redirect href="/login" />;
  return <ProfileScreen />;
}

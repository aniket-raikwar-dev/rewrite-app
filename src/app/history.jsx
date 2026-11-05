import React from 'react';
import { Redirect } from 'expo-router';
import Splash from '../components/Splash';
import HistoryScreen from '../components/HistoryScreen';
import { useApp } from '../state/AppContext';

export default function HistoryRoute() {
  const { ready, isSignedIn } = useApp();
  if (!ready) return <Splash />;
  if (!isSignedIn) return <Redirect href="/login" />;
  return <HistoryScreen />;
}

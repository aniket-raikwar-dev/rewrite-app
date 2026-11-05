import React from 'react';
import { Redirect } from 'expo-router';
import Splash from '../components/Splash';
import { useApp } from '../state/AppContext';

export default function Index() {
  const { ready, isSignedIn } = useApp();
  if (!ready) return <Splash />;
  return <Redirect href={isSignedIn ? '/workspace' : '/login'} />;
}

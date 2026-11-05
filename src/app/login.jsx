import React from 'react';
import { Redirect } from 'expo-router';
import Splash from '../components/Splash';
import LoginScreen from '../components/LoginScreen';
import { useApp } from '../state/AppContext';

export default function LoginRoute() {
  const { ready, isSignedIn } = useApp();
  if (!ready) return <Splash />;
  if (isSignedIn) return <Redirect href="/workspace" />;
  return <LoginScreen />;
}

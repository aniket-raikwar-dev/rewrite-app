import React from 'react';
import { View } from 'react-native';
import LoginScreen from '../components/LoginScreen';
import { useApp } from '../state/AppContext';

export default function LoginRoute() {
  const { ready } = useApp();
  if (!ready) return <View />;
  return <LoginScreen />;
}

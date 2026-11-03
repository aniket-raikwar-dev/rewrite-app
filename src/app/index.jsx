import React from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useApp } from '../state/AppContext';

export default function Index() {
  const { ready, demoSignedIn } = useApp();
  if (!ready) return <View />;
  return <Redirect href={demoSignedIn ? '/workspace' : '/login'} />;
}

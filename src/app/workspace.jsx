import React from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import WorkspaceScreen from '../components/WorkspaceScreen';
import { useApp } from '../state/AppContext';

export default function WorkspaceRoute() {
  const { ready, demoSignedIn } = useApp();
  if (!ready) return <View />;
  if (!demoSignedIn) return <Redirect href="/login" />;
  return <WorkspaceScreen />;
}

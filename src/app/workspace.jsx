import React from 'react';
import { Redirect } from 'expo-router';
import Splash from '../components/Splash';
import WorkspaceScreen from '../components/WorkspaceScreen';
import { useApp } from '../state/AppContext';

export default function WorkspaceRoute() {
  const { ready, isSignedIn } = useApp();
  if (!ready) return <Splash />;
  if (!isSignedIn) return <Redirect href="/login" />;
  return <WorkspaceScreen />;
}

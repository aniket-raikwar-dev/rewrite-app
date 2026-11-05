import React, { useEffect } from 'react';
import { Redirect, router } from 'expo-router';
import { useApp } from '../../state/AppContext';
import Splash from '../../components/Splash';

// OAuth deep-link target (rewrite-ai://auth/callback). Without this route Expo Router
// shows "Page not found" while sign-in finishes, so show a neutral loader instead.
export default function AuthCallback() {
  const { isSignedIn } = useApp();
  useEffect(() => {
    if (isSignedIn) return undefined;
    const timer = setTimeout(() => router.replace('/login'), 6000);
    return () => clearTimeout(timer);
  }, [isSignedIn]);
  if (isSignedIn) return <Redirect href="/workspace" />;
  return <Splash />;
}

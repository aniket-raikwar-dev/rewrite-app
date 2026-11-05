import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { shapeOptions } from '../lib/rewrite';
import { createSessionFromUrl, signInWithGoogle as startGoogleSignIn } from '../lib/auth';
import { supabase } from '../lib/supabase';

const AppContext = createContext(null);
const keys = {
  history: 'rewrite-history', theme: 'rewrite-theme', shape: 'rewrite-profile-shape',
};

function parseHistory(raw) {
  try {
    const items = JSON.parse(raw || '[]');
    return Array.isArray(items) ? items.filter(item => typeof item.input === 'string' && typeof item.output === 'string').slice(0, 20) : [];
  } catch { return []; }
}

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [profileShape, setProfileShape] = useState('fork');
  const [session, setSession] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      AsyncStorage.multiGet(Object.values(keys)),
      supabase.auth.getSession(),
      Linking.getInitialURL(),
    ]).then(async ([entries, authResult, initialUrl]) => {
      if (!active) return;
      const saved = Object.fromEntries(entries);
      setHistory(parseHistory(saved[keys.history]));
      setDarkMode(saved[keys.theme] === 'dark');
      setProfileShape(shapeOptions.some(([kind]) => kind === saved[keys.shape]) ? saved[keys.shape] : 'fork');

      let nextSession = authResult.data.session;
      if (initialUrl?.startsWith('rewrite-ai://auth/callback')) {
        nextSession = await createSessionFromUrl(initialUrl);
      }
      if (active) setSession(nextSession);
    }).catch(error => {
      console.warn('Could not restore the app session.', error);
    }).finally(() => { if (active) setReady(true); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession);
    });
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      if (url.startsWith('rewrite-ai://auth/callback')) {
        createSessionFromUrl(url).catch(error => console.warn('Could not finish Google sign-in.', error));
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    AsyncStorage.setItem(keys.theme, next ? 'dark' : 'light').catch(() => {});
  };
  const chooseShape = kind => {
    setProfileShape(kind);
    AsyncStorage.setItem(keys.shape, kind).catch(() => {});
  };
  const signInWithGoogle = () => startGoogleSignIn();
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };
  const saveRewrite = (input, output, outputs) => {
    const next = [{ id: Date.now(), input: input.trim(), output, outputs, date: new Date().toISOString() }, ...history.filter(item => item.input !== input.trim())].slice(0, 20);
    setHistory(next);
    AsyncStorage.setItem(keys.history, JSON.stringify(next)).catch(() => {});
  };

  return <AppContext.Provider value={{ ready, history, darkMode, profileShape, session, user: session?.user ?? null, isSignedIn: Boolean(session), toggleTheme, chooseShape, signInWithGoogle, signOut, saveRewrite }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('AppProvider is required');
  return value;
}

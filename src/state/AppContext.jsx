import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shapeOptions } from '../lib/rewrite';

const AppContext = createContext(null);
const keys = {
  history: 'rewrite-history', theme: 'rewrite-theme', shape: 'rewrite-profile-shape', session: 'rewrite-demo-session',
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
  const [demoSignedIn, setDemoSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.multiGet(Object.values(keys)).then(entries => {
      if (!active) return;
      const saved = Object.fromEntries(entries);
      setHistory(parseHistory(saved[keys.history]));
      setDarkMode(saved[keys.theme] === 'dark');
      setProfileShape(shapeOptions.some(([kind]) => kind === saved[keys.shape]) ? saved[keys.shape] : 'fork');
      setDemoSignedIn(saved[keys.session] === 'true');
    }).catch(() => {}).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
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
  const signInDemo = async () => {
    setDemoSignedIn(true);
    await AsyncStorage.setItem(keys.session, 'true').catch(() => {});
  };
  const signOutDemo = async () => {
    setDemoSignedIn(false);
    await AsyncStorage.removeItem(keys.session).catch(() => {});
  };
  const saveRewrite = (input, output) => {
    const next = [{ id: Date.now(), input: input.trim(), output, date: new Date().toISOString() }, ...history.filter(item => item.input !== input.trim())].slice(0, 20);
    setHistory(next);
    AsyncStorage.setItem(keys.history, JSON.stringify(next)).catch(() => {});
  };

  return <AppContext.Provider value={{ ready, history, darkMode, profileShape, demoSignedIn, toggleTheme, chooseShape, signInDemo, signOutDemo, saveRewrite }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('AppProvider is required');
  return value;
}

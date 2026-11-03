import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, interpolateColor, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Avatar, Icon, RewriteMark } from './Artwork';
import { useApp } from '../state/AppContext';
import { selectionFeedback, tapFeedback } from '../lib/feedback';

export const font = {
  regular: 'Inter_400Regular', medium: 'Inter_500Medium', semibold: 'Inter_600SemiBold', bold: 'Inter_700Bold',
};

export function useColors() {
  const { darkMode } = useApp();
  return darkMode ? {
    canvas: '#101110', stage: '#1b1d1c', card: '#282b29', inset: '#222523', line: '#383b39',
    ink: '#f2f2f1', sub: '#aaaead', muted: '#898e8b', button: '#f2f2f1', buttonInk: '#242424', markInk: '#242424',
  } : {
    canvas: '#ffffff', stage: '#f4f4f4', card: '#ffffff', inset: '#f9f9f9', line: '#ebebeb',
    ink: '#242424', sub: '#888888', muted: '#a4a4a4', button: '#242424', buttonInk: '#ffffff', markInk: '#ffffff',
  };
}

export function Kicker({ children, style }) {
  const c = useColors();
  return <Text style={[{ color: c.sub, fontFamily: font.semibold, fontSize: 10, letterSpacing: 1.2, marginBottom: 7 }, style]}>{children}</Text>;
}

export function Header({ showProfile = false, profileActive = false }) {
  const { darkMode, toggleTheme, profileShape, signOutDemo } = useApp();
  const c = useColors();
  const [menuOpen, setMenuOpen] = useState(false);
  const iconRotation = useSharedValue(0);
  const iconMotion = useAnimatedStyle(() => ({ transform: [{ rotate: `${iconRotation.value}deg` }] }));
  const signOut = async () => { tapFeedback(); setMenuOpen(false); await signOutDemo(); router.replace('/login'); };
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 50 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
      <RewriteMark size={32} ink={c.ink} markInk={c.markInk} />
      <Text style={{ color: c.ink, fontFamily: font.bold, fontSize: 18, letterSpacing: -1 }}>rewrite<Text style={{ color: '#9a69c9' }}>.</Text></Text>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Pressable onPress={() => { selectionFeedback(); setMenuOpen(false); iconRotation.value = withTiming(iconRotation.value + 360, { duration: 300 }); toggleTheme(); }} accessibilityRole="button" accessibilityLabel={`Switch to ${darkMode ? 'light' : 'dark'} mode`} style={{ width: 36, height: 36, borderWidth: 1, borderColor: c.line, borderRadius: 18, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={iconMotion}><Icon name={darkMode ? 'sun' : 'moon'} size={18} color={c.ink} /></Animated.View>
      </Pressable>
      {showProfile && <View style={{ position: 'relative', zIndex: 60 }}>
        <Pressable onPress={() => { tapFeedback(); setMenuOpen(open => !open); }} accessibilityRole="button" accessibilityLabel="Account menu" accessibilityState={{ expanded: menuOpen }} style={{ width: 36, height: 36, padding: 3, borderWidth: menuOpen || profileActive ? 2 : 1, borderColor: menuOpen || profileActive ? '#c9b1e1' : c.line, borderRadius: 18, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' }}><Avatar variant={profileShape} size={28} /></Pressable>
        {menuOpen && <Animated.View entering={FadeIn.duration(180).reduceMotion(ReduceMotion.System)} style={{ position: 'absolute', top: 44, right: 0, width: 166, padding: 5, borderWidth: 1, borderColor: c.line, borderRadius: 12, backgroundColor: c.card, elevation: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, zIndex: 70 }}>
          <Pressable onPress={() => { selectionFeedback(); setMenuOpen(false); if (!profileActive) router.push('/profile'); }} accessibilityRole="menuitem" style={{ minHeight: 40, paddingHorizontal: 11, borderRadius: 8, backgroundColor: profileActive ? c.inset : c.card, flexDirection: 'row', alignItems: 'center', gap: 10 }}><Icon name="user" size={16} color={c.ink} /><Text style={{ color: c.ink, fontFamily: profileActive ? font.semibold : font.medium, fontSize: 12 }}>Profile</Text></Pressable>
          <View style={{ height: 1, backgroundColor: c.line, marginVertical: 4, marginHorizontal: 5 }} />
          <Pressable onPress={signOut} accessibilityRole="menuitem" style={{ minHeight: 40, paddingHorizontal: 11, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}><Icon name="signout" size={16} color={c.ink} /><Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 12 }}>Sign out</Text></Pressable>
        </Animated.View>}
      </View>}
    </View>
  </View>;
}

export function Screen({ children, showProfile = false, profileActive = false, showHeader = true, scrollRef }) {
  const c = useColors();
  const { darkMode } = useApp();
  const { width, height } = useWindowDimensions();
  const wide = width >= 700;
  const themeProgress = useSharedValue(darkMode ? 1 : 0);
  useEffect(() => { themeProgress.value = withTiming(darkMode ? 1 : 0, { duration: 300 }); }, [darkMode, themeProgress]);
  const stageMotion = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(themeProgress.value, [0, 1], ['#f4f4f4', '#1b1d1c']) }));
  return <SafeAreaView style={{ flex: 1, backgroundColor: wide ? c.canvas : c.stage }}>
    <StatusBar style={darkMode ? 'light' : 'dark'} backgroundColor={c.stage} />
    <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, alignItems: 'center', padding: wide ? 30 : 0 }}>
      <Animated.View style={[{ width: '100%', maxWidth: 1180, minHeight: wide ? Math.max(620, height - 60) : height, paddingTop: wide ? 36 : 28, paddingHorizontal: wide ? 50 : 18, paddingBottom: wide ? 62 : 36, borderRadius: wide ? 38 : 0 }, stageMotion]}>
        {showHeader && <Header showProfile={showProfile} profileActive={profileActive} />}
        <Animated.View entering={FadeIn.duration(220).reduceMotion(ReduceMotion.System)} style={{ flex: 1 }}>{children}</Animated.View>
      </Animated.View>
    </ScrollView>
  </SafeAreaView>;
}

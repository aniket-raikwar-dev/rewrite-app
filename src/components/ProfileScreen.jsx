import React from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Avatar } from './Artwork';
import { font, Kicker, Screen, useColors } from './Screen';
import { useApp } from '../state/AppContext';
import { shapeOptions } from '../lib/rewrite';
import { selectionFeedback } from '../lib/feedback';

export default function ProfileScreen() {
  const c = useColors();
  const { width } = useWindowDimensions();
  const { history, profileShape, chooseShape, user } = useApp();
  const mobile = width < 700;
  const optionSize = width <= 380 ? 38 : 42;
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Rewrite AI user';
  return <Screen showProfile profileActive fixedHeader contentBottomPadding={30}>
    <View style={{ width: '100%', maxWidth: 510, alignSelf: 'center', paddingTop: mobile ? 16 : 42 }}>
      <Pressable onPress={() => { selectionFeedback(); router.replace('/workspace'); }} accessibilityRole="button" accessibilityLabel="Back to workspace" style={{ alignSelf: 'flex-start', minHeight: 38, paddingHorizontal: 12, borderWidth: 1, borderColor: c.line, borderRadius: 19, backgroundColor: c.card, flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 24 }}>
        <Ionicons name="arrow-back" size={16} color={c.ink} />
        <Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 14 }}>Workspace</Text>
      </Pressable>
      <View style={{ marginHorizontal: 3, marginBottom: 22 }}>
        <Kicker style={{ marginBottom: 1 }}>YOUR SPACE</Kicker>
        <Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 22, letterSpacing: -0.7 }}>Your profile</Text>
        <Text style={{ marginTop: 6, color: c.sub, fontFamily: font.regular, fontSize: 14, lineHeight: 20 }}>A simple home for your writing.</Text>
      </View>
      <View style={{ borderWidth: 1, borderColor: c.line, borderRadius: 18, backgroundColor: c.card, overflow: 'hidden' }}>
        <View style={{ padding: 25, alignItems: 'flex-start' }}>
          <View style={{ marginBottom: 22 }}><Avatar variant={profileShape} size={64} /></View>
          <Text style={{ paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, overflow: 'hidden', backgroundColor: c.inset, color: c.sub, fontFamily: font.bold, fontSize: 11, letterSpacing: 0.9 }}>GOOGLE ACCOUNT</Text>
          <Text style={{ marginTop: 14, color: c.ink, fontFamily: font.semibold, fontSize: 26, letterSpacing: -0.8 }}>{displayName}</Text>
          <Text style={{ marginTop: 8, color: c.sub, fontFamily: font.regular, fontSize: 15 }}>{user?.email || 'Signed in with Google'}</Text>
        </View>
        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: c.line, backgroundColor: c.inset }}>
          <View style={{ flex: 1, paddingHorizontal: 25, paddingVertical: 18, gap: 10 }}><Text style={{ color: c.sub, fontFamily: font.regular, fontSize: 13 }}>Rewrites saved</Text><Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 16 }}>{history.length}</Text></View>
          <View style={{ flex: 1, paddingHorizontal: 25, paddingVertical: 18, gap: 10, borderLeftWidth: 1, borderColor: c.line }}><Text style={{ color: c.sub, fontFamily: font.regular, fontSize: 13 }}>Saved on</Text><Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 16 }}>This device</Text></View>
        </View>
        <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderColor: c.line, backgroundColor: c.card }}>
          <Pressable onPress={() => { selectionFeedback(); router.push('/history'); }} accessibilityRole="button" accessibilityLabel="Open rewrite history" style={{ minHeight: 58, paddingHorizontal: 14, borderWidth: 1, borderColor: c.line, borderRadius: 14, backgroundColor: c.inset, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="time-outline" size={17} color={c.ink} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 15 }}>Rewrite history</Text>
              <Text style={{ marginTop: 3, color: c.sub, fontFamily: font.regular, fontSize: 13 }}>View your saved rewrites</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={c.ink} />
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 25, paddingTop: 20, paddingBottom: 24, borderTopWidth: 1, borderColor: c.line }}>
          <Text style={{ marginBottom: 15, color: c.ink, fontFamily: font.medium, fontSize: 14 }}>Choose your icon</Text>
          <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: width <= 380 ? 10 : 12 }}>
            {shapeOptions.map(([kind, label]) => <Pressable key={kind} onPress={() => { selectionFeedback(); chooseShape(kind); }} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ checked: profileShape === kind }} style={{ width: optionSize + 4, height: optionSize + 4, borderRadius: 24, borderWidth: profileShape === kind ? 2 : 0, borderColor: '#a477d0', alignItems: 'center', justifyContent: 'center' }}><Avatar variant={kind} size={optionSize} /></Pressable>)}
          </View>
        </View>
      </View>
    </View>
  </Screen>;
}

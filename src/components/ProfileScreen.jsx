import React from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Avatar, Icon } from './Artwork';
import { font, Kicker, Screen, useColors } from './Screen';
import { useApp } from '../state/AppContext';
import { shapeOptions } from '../lib/rewrite';
import { selectionFeedback, tapFeedback } from '../lib/feedback';

export default function ProfileScreen() {
  const c = useColors();
  const { width } = useWindowDimensions();
  const { history, profileShape, chooseShape } = useApp();
  const optionSize = width <= 380 ? 38 : 42;
  return <Screen showProfile profileActive>
    <View style={{ width: '100%', maxWidth: 510, alignSelf: 'center', paddingTop: 76 }}>
      <View style={{ marginHorizontal: 3, marginBottom: 22 }}>
        <Kicker>YOUR SPACE</Kicker>
        <Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 27, letterSpacing: -1.2 }}>Your profile</Text>
        <Text style={{ marginTop: 12, color: c.sub, fontFamily: font.regular, fontSize: 13, lineHeight: 21 }}>A simple home for your writing.</Text>
      </View>
      <View style={{ borderWidth: 1, borderColor: c.line, borderRadius: 18, backgroundColor: c.card, overflow: 'hidden' }}>
        <View style={{ padding: 25, alignItems: 'flex-start' }}>
          <View style={{ marginBottom: 22 }}><Avatar variant={profileShape} size={64} /></View>
          <Text style={{ paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, overflow: 'hidden', backgroundColor: c.inset, color: c.sub, fontFamily: font.bold, fontSize: 9, letterSpacing: 0.9 }}>DEMO ACCOUNT</Text>
          <Text style={{ marginTop: 14, color: c.ink, fontFamily: font.semibold, fontSize: 25, letterSpacing: -0.8 }}>Demo writer</Text>
          <Text style={{ marginTop: 8, color: c.sub, fontFamily: font.regular, fontSize: 12 }}>Google sign-in preview</Text>
        </View>
        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: c.line, backgroundColor: c.inset }}>
          <View style={{ flex: 1, paddingHorizontal: 25, paddingVertical: 18, gap: 10 }}><Text style={{ color: c.sub, fontFamily: font.regular, fontSize: 10 }}>Rewrites saved</Text><Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 13 }}>{history.length}</Text></View>
          <View style={{ flex: 1, paddingHorizontal: 25, paddingVertical: 18, gap: 10, borderLeftWidth: 1, borderColor: c.line }}><Text style={{ color: c.sub, fontFamily: font.regular, fontSize: 10 }}>Saved on</Text><Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 13 }}>This device</Text></View>
        </View>
        <View style={{ paddingHorizontal: 25, paddingTop: 20, paddingBottom: 24, borderTopWidth: 1, borderColor: c.line }}>
          <Text style={{ marginBottom: 15, color: c.ink, fontFamily: font.semibold, fontSize: 11 }}>Choose your icon</Text>
          <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: width <= 380 ? 10 : 12 }}>
            {shapeOptions.map(([kind, label]) => <Pressable key={kind} onPress={() => { selectionFeedback(); chooseShape(kind); }} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ checked: profileShape === kind }} style={{ width: optionSize + 4, height: optionSize + 4, borderRadius: 24, borderWidth: profileShape === kind ? 2 : 0, borderColor: '#a477d0', alignItems: 'center', justifyContent: 'center' }}><Avatar variant={kind} size={optionSize} /></Pressable>)}
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 19 }}>
        <Pressable onPress={() => { tapFeedback(); router.replace('/workspace'); }} accessibilityRole="button" style={{ minHeight: 42, paddingHorizontal: 15, borderRadius: 9, backgroundColor: c.button, flexDirection: 'row', alignItems: 'center', gap: 28 }}><Text style={{ color: c.buttonInk, fontFamily: font.semibold, fontSize: 11 }}>Start writing</Text><Icon name="arrow" size={17} color={c.buttonInk} /></Pressable>
      </View>
    </View>
  </Screen>;
}

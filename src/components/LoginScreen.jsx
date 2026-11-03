import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Avatar, GoogleMark, RewriteMark } from './Artwork';
import { font, Kicker, Screen, useColors } from './Screen';
import { useApp } from '../state/AppContext';
import { successFeedback, tapFeedback } from '../lib/feedback';

function LoginIllustration() {
  const c = useColors();
  const { width } = useWindowDimensions();
  const scale = Math.min(1, (width - 36) / 310);
  const bubble = { position: 'absolute', width: 205, minHeight: 88, paddingVertical: 17, paddingHorizontal: 20, borderWidth: 1, borderColor: c.line, borderRadius: 17, backgroundColor: c.card, shadowColor: '#000', shadowOpacity: 0.045, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 2 };
  const orb = { position: 'absolute', zIndex: 2 };
  return <View style={{ width: 310 * scale, height: 236 * scale, marginTop: 12, marginBottom: 37, alignSelf: 'center' }}>
    <View style={{ width: 310, height: 236, position: 'absolute', left: (310 * scale - 310) / 2, top: (236 * scale - 236) / 2, transform: [{ scale }] }}>
      <View style={[orb, { left: 12, top: 132 }]}><Avatar variant="clover" size={44} /></View>
      <View style={[orb, { left: 237, top: 6 }]}><Avatar variant="fork" size={50} /></View>
      <View style={[orb, { left: 256, top: 180 }]}><Avatar variant="petals" size={42} /></View>
      <View style={[bubble, { top: 26, left: 26, transform: [{ rotate: '-3deg' }] }]}>
        <Text style={{ color: c.muted, fontFamily: font.bold, fontSize: 9, letterSpacing: 0.9 }}>YOUR DRAFT</Text>
        <Text style={{ color: c.sub, fontFamily: font.medium, fontSize: 12, lineHeight: 17, marginTop: 10 }}>wen can u send the file?</Text>
      </View>
      <View style={{ position: 'absolute', zIndex: 3, top: 96, left: 133, width: 43, height: 43, padding: 4, borderWidth: 4, borderColor: c.stage, borderRadius: 22, backgroundColor: c.stage, alignItems: 'center', justifyContent: 'center' }}><RewriteMark size={35} ink={c.ink} markInk={c.markInk} /></View>
      <View style={[bubble, { top: 120, right: 18, transform: [{ rotate: '2deg' }] }]}>
        <Text style={{ color: c.muted, fontFamily: font.bold, fontSize: 9, letterSpacing: 0.9 }}>BETTER VERSION</Text>
        <Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 12, lineHeight: 17, marginTop: 10 }}>When can you send the file?</Text>
      </View>
    </View>
  </View>;
}

export default function LoginScreen() {
  const c = useColors();
  const { signInDemo } = useApp();
  const { width } = useWindowDimensions();
  const compact = width < 700;
  const [signingIn, setSigningIn] = useState(false);
  const buttonMotion = useAnimatedStyle(() => ({ transform: [{ scale: withTiming(signingIn ? 0.985 : 1, { duration: 180 }) }] }));
  const onSignIn = async () => {
    if (signingIn) return;
    tapFeedback();
    setSigningIn(true);
    await new Promise(resolve => setTimeout(resolve, 420));
    await signInDemo();
    successFeedback();
    router.replace('/workspace');
  };
  return <Screen showHeader={false}>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 28, paddingBottom: compact ? 40 : 56 }}>
      <View style={{ width: '100%', maxWidth: 430, alignItems: 'center' }}>
        <Kicker style={{ textAlign: 'center', marginBottom: 14 }}>YOUR WORDS, A LITTLE BETTER</Kicker>
        <Text style={{ color: c.ink, fontFamily: 'BricolageGrotesque_600SemiBold', fontSize: compact ? Math.min(46, width * 0.105) : 54, lineHeight: compact ? 46 : 57, letterSpacing: -2.5, textAlign: 'center' }}>Your message,{'\n'}just better.</Text>
        <Text style={{ color: c.sub, fontFamily: font.regular, fontSize: compact ? 13 : 14, lineHeight: 21, maxWidth: 335, textAlign: 'center', marginTop: 15 }}>Paste a rough message. Get clearer English in one click, ready to copy and send.</Text>
        <LoginIllustration />
        <View style={{ width: '100%', maxWidth: 390, marginTop: 74, alignItems: 'center' }}>
          <Animated.View style={[{ width: '100%' }, buttonMotion]}>
            <Pressable onPress={onSignIn} disabled={signingIn} accessibilityRole="button" accessibilityLabel={signingIn ? 'Opening workspace' : 'Continue with Google demo sign-in'} accessibilityState={{ busy: signingIn, disabled: signingIn }} style={({ pressed }) => ({ width: '100%', minHeight: 50, borderRadius: 14, backgroundColor: c.button, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.13, shadowRadius: 14, elevation: 3, opacity: pressed ? 0.84 : 1 })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                {signingIn ? <ActivityIndicator size="small" color={c.buttonInk} /> : <View style={{ width: 27, height: 27, borderRadius: 14, borderWidth: 1, borderColor: '#e8e8e8', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}><GoogleMark size={17} /></View>}
                <Text style={{ color: c.buttonInk, fontFamily: font.semibold, fontSize: 13 }}>{signingIn ? 'Opening workspace...' : 'Continue with Google'}</Text>
              </View>
            </Pressable>
          </Animated.View>
          <Text style={{ marginTop: 13, color: c.sub, fontFamily: font.regular, fontSize: 10, lineHeight: 15, textAlign: 'center' }}>Demo sign-in · No Google data is accessed. Rewrites stay on this device.</Text>
          <Text style={{ marginTop: 24, color: c.sub, fontFamily: font.medium, fontSize: 11, textAlign: 'center' }}>Made for the moment before you hit send.</Text>
        </View>
      </View>
    </View>
  </Screen>;
}

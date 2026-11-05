import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Avatar, GoogleMark, RewriteRLogo } from './Artwork';
import { font, Kicker, Screen, useColors } from './Screen';
import { useApp } from '../state/AppContext';
import { successFeedback, tapFeedback } from '../lib/feedback';

function LoginIllustration({ shortScreen = false }) {
  const c = useColors();
  const { width } = useWindowDimensions();
  const scale = Math.min(shortScreen ? 0.82 : 1, (width - 36) / 310);
  const bubble = { position: 'absolute', width: 205, minHeight: 88, paddingVertical: 17, paddingHorizontal: 20, borderWidth: 1, borderColor: c.line, borderRadius: 17, backgroundColor: c.card, shadowColor: '#000', shadowOpacity: 0.045, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 2 };
  const orb = { position: 'absolute', zIndex: 2 };
  return <View style={{ width: 310 * scale, height: 236 * scale, marginTop: shortScreen ? 6 : 12, marginBottom: shortScreen ? 12 : 28, alignSelf: 'center' }}>
    <View style={{ width: 310, height: 236, position: 'absolute', left: (310 * scale - 310) / 2, top: (236 * scale - 236) / 2, transform: [{ scale }] }}>
      <View style={[orb, { left: 12, top: 132 }]}><Avatar variant="clover" size={44} /></View>
      <View style={[orb, { left: 237, top: 6 }]}><Avatar variant="fork" size={50} /></View>
      <View style={[orb, { left: 256, top: 180 }]}><Avatar variant="petals" size={42} /></View>
      <View style={[bubble, { top: 26, left: 26, transform: [{ rotate: '-3deg' }] }]}>
        <Text style={{ color: c.muted, fontFamily: font.bold, fontSize: 9, letterSpacing: 0.9 }}>YOUR DRAFT</Text>
        <Text style={{ color: c.sub, fontFamily: font.medium, fontSize: 12, lineHeight: 17, marginTop: 10 }}>wen can u send the file?</Text>
      </View>
      <View style={{ position: 'absolute', zIndex: 3, top: 96, left: 133, width: 43, height: 43, padding: 5, borderWidth: 4, borderColor: c.stage, borderRadius: 22, backgroundColor: c.stage, alignItems: 'center', justifyContent: 'center' }}><RewriteRLogo size={29} /></View>
      <View style={[bubble, { top: 120, right: 18, transform: [{ rotate: '2deg' }] }]}>
        <Text style={{ color: c.muted, fontFamily: font.bold, fontSize: 9, letterSpacing: 0.9 }}>BETTER VERSION</Text>
        <Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 12, lineHeight: 17, marginTop: 10 }}>When can you send the file?</Text>
      </View>
    </View>
  </View>;
}

export default function LoginScreen() {
  const c = useColors();
  const { signInWithGoogle } = useApp();
  const { width, height } = useWindowDimensions();
  const compact = width < 700;
  const shortScreen = height < 800;
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState('');
  const buttonMotion = useAnimatedStyle(() => ({ transform: [{ scale: withTiming(signingIn ? 0.985 : 1, { duration: 180 }) }] }));
  const onSignIn = async () => {
    if (signingIn) return;
    tapFeedback();
    setSignInError('');
    setSigningIn(true);
    try {
      const session = await signInWithGoogle();
      if (session) {
        successFeedback();
        router.replace('/workspace');
      }
    } catch (error) {
      setSignInError(error?.message || 'Google sign-in could not be completed.');
    } finally {
      setSigningIn(false);
    }
  };
  return <Screen showHeader={false} scrollable={false}>
    <View style={{ flex: 1, alignItems: 'center', paddingTop: shortScreen ? 56 : 84, paddingBottom: shortScreen ? 10 : compact ? 18 : 28 }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 430, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Kicker style={{ textAlign: 'center', marginBottom: shortScreen ? 8 : 14 }}>YOUR WORDS, A LITTLE BETTER</Kicker>
          <Text style={{ color: c.ink, fontFamily: 'BricolageGrotesque_600SemiBold', fontSize: shortScreen ? Math.min(42, width * 0.105) : compact ? Math.min(50, width * 0.12) : 58, lineHeight: shortScreen ? 45 : compact ? 54 : 62, letterSpacing: shortScreen ? -2 : -2.5, textAlign: 'center' }}>Your message,{'\n'}just better.</Text>
          <Text style={{ color: c.sub, fontFamily: font.regular, fontSize: shortScreen ? 14 : 16, lineHeight: shortScreen ? 21 : 24, maxWidth: 350, textAlign: 'center', marginTop: shortScreen ? 9 : 15 }}>Paste a rough message. Get clearer English in one click, ready to copy and send.</Text>
          <LoginIllustration shortScreen={shortScreen} />
        </View>
        <View style={{ width: '100%', maxWidth: 390, marginTop: shortScreen ? 38 : 72, marginBottom: shortScreen ? 4 : 10, alignItems: 'center' }}>
          <Animated.View style={[{ width: '100%' }, buttonMotion]}>
            <Pressable onPress={onSignIn} disabled={signingIn} accessibilityRole="button" accessibilityLabel={signingIn ? 'Opening Google sign-in' : 'Continue with Google'} accessibilityState={{ busy: signingIn, disabled: signingIn }} style={({ pressed }) => ({ width: '100%', minHeight: 50, borderRadius: 14, backgroundColor: c.button, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.13, shadowRadius: 14, elevation: 3, opacity: pressed ? 0.84 : 1 })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                {signingIn ? <ActivityIndicator size="small" color={c.buttonInk} /> : <GoogleMark size={20} />}
                <Text style={{ color: c.buttonInk, fontFamily: font.semibold, fontSize: 13 }}>{signingIn ? 'Opening Google...' : 'Continue with Google'}</Text>
              </View>
            </Pressable>
          </Animated.View>
          {signInError ? <Text accessibilityRole="alert" style={{ marginTop: 13, color: '#b64d4d', fontFamily: font.medium, fontSize: 10, lineHeight: 15, textAlign: 'center' }}>{signInError}</Text> : null}
          <Text style={{ marginTop: 13, color: c.sub, fontFamily: font.regular, fontSize: 10, lineHeight: 15, textAlign: 'center' }}>Secure sign-in with Google. Your password is never shared with Rewrite AI.</Text>
          <Text style={{ marginTop: shortScreen ? 14 : 24, color: c.sub, fontFamily: font.medium, fontSize: 11, textAlign: 'center' }}>Made for the moment before you hit send.</Text>
        </View>
      </View>
    </View>
  </Screen>;
}

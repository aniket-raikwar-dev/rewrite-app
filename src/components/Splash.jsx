import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { RewriteRLogo } from './Artwork';
import { useColors } from './Screen';

// Branded loading state shown instead of a blank screen while the app or sign-in is settling.
export default function Splash() {
  const c = useColors();
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1.08, { duration: 700 }), withTiming(1, { duration: 700 })), -1);
    return () => cancelAnimation(pulse);
  }, [pulse]);
  const motion = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.stage }}>
    <Animated.View style={motion}><RewriteRLogo size={56} /></Animated.View>
  </View>;
}

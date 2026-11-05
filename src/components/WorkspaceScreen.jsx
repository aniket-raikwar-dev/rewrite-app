import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated as NativeAnimated, Easing as NativeEasing, Modal, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { cancelAnimation, Easing, FadeIn, FadeInDown, FadeInRight, interpolate, ReduceMotion, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Avatar, Icon, RewriteRLogo } from './Artwork';
import { font, Kicker, Screen, useColors } from './Screen';
import { useApp } from '../state/AppContext';
import { example } from '../lib/rewrite';
import { rewriteMessage } from '../lib/rewriteApi';
import { selectionFeedback, successFeedback, tapFeedback, typingFeedback } from '../lib/feedback';

// Blue bloom (index 2) is deliberately last so it is shown with the lowest priority.
const avatarOrder = [...Array(11).keys()].filter(i => i !== 2).concat(2);
const dateLabel = date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const rewriteStyles = [
  { value: 'better', label: 'Better', description: 'Clear, natural, and grammatically correct' },
  { value: 'professional', label: 'Professional', description: 'Polished and appropriate for work' },
  { value: 'casual', label: 'Casual', description: 'Friendly, relaxed, and conversational' },
  { value: 'polite', label: 'Polite', description: 'Considerate, respectful, and warm' },
];
const rewriteStyleLabels = Object.fromEntries(rewriteStyles.map(style => [style.value, style.label]));
const processingMessages = [
  'Analyzing your draft…',
  'Understanding your tone…',
  'Writing your versions…',
  'Polishing the language…',
];

function CopyButton({ text, id, copied, onCopy, colors, title }) {
  const label = title === 'Better version' ? 'better version' : `${title.toLowerCase()} version`;
  return <Pressable onPress={() => onCopy(text, id)} accessibilityRole="button" accessibilityLabel={copied === id ? `${title} copied` : `Copy ${label}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 38, paddingHorizontal: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 19, backgroundColor: colors.inset }}>
    <Icon name={copied === id ? 'check' : 'copy'} size={18} color={colors.ink} />
    <Text style={{ color: colors.ink, fontFamily: font.medium, fontSize: 14 }}>{copied === id ? 'Copied' : 'Copy'}</Text>
  </Pressable>;
}

function ToggleSwitch({ value, onValueChange, label }) {
  const c = useColors();
  const progress = useSharedValue(value ? 1 : 0);
  useEffect(() => { progress.value = withTiming(value ? 1 : 0, { duration: 180 }); }, [value, progress]);
  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: progress.value * 20 }] }));
  return <Pressable onPress={onValueChange} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value }} hitSlop={8} style={{ width: 52, height: 32, borderRadius: 16, padding: 3, backgroundColor: value ? '#9a69c9' : c.line, justifyContent: 'center' }}>
    <Animated.View style={[{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#ffffff', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 2 }, thumbStyle]} />
  </Pressable>;
}

const styleAccents = { better: '#9a69c9', professional: '#4f7cd6', casual: '#e0894a', polite: '#3fa77f' };

function StreamingText({ text, delay, style, onDone }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let timer;
    let lastHaptic = 0;
    const start = setTimeout(() => {
      timer = setInterval(() => setCount(current => {
        if (current >= text.length) { clearInterval(timer); return current; }
        const step = text[current] === ' ' ? 1 : 2;
        const next = Math.min(text.length, current + step);
        const now = Date.now();
        if (now - lastHaptic > 70 && text[next - 1] !== ' ') { lastHaptic = now; typingFeedback(); }
        return next;
      }), 24);
    }, delay);
    return () => { clearTimeout(start); clearInterval(timer); };
  }, [text, delay]);
  const done = count >= text.length;
  useEffect(() => { if (done && text.length) { successFeedback(); onDone?.(); } }, [done]); // eslint-disable-line react-hooks/exhaustive-deps
  // The untyped remainder stays in the layout but invisible, so lines never re-wrap while typing.
  return <Text accessibilityLabel={text} style={style}>{text.slice(0, count)}<Text style={{ opacity: 0 }}>{text.slice(count)}</Text></Text>;
}

function UserBubble({ text }) {
  const c = useColors();
  return <Animated.View entering={FadeInRight.duration(420).reduceMotion(ReduceMotion.System)} style={{ alignSelf: 'flex-end', maxWidth: '86%', marginTop: 20, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderBottomRightRadius: 6, borderWidth: 1, borderColor: c.line, backgroundColor: c.card }}>
    <Text selectable style={{ color: c.ink, fontFamily: font.regular, fontSize: 16, lineHeight: 24 }}>{text}</Text>
  </Animated.View>;
}

export function HistoryDetailModal({ item, onClose }) {
  const c = useColors();
  const { height: screenHeight } = useWindowDimensions();
  const [copied, setCopied] = useState(null);
  const [shown, setShown] = useState(null);
  const [progress] = useState(() => new NativeAnimated.Value(0));
  const closing = useRef(false);
  // Keep the content mounted while the close animation plays.
  if (item && item !== shown) setShown(item);
  useEffect(() => {
    if (!item) return;
    closing.current = false;
    progress.setValue(0);
    NativeAnimated.timing(progress, { toValue: 1, duration: 360, easing: NativeEasing.out(NativeEasing.cubic), useNativeDriver: true }).start();
  }, [item, progress]);
  const requestClose = () => {
    if (closing.current) return;
    closing.current = true;
    NativeAnimated.timing(progress, { toValue: 0, duration: 240, easing: NativeEasing.inOut(NativeEasing.cubic), useNativeDriver: true }).start(() => { setShown(null); onClose(); });
  };
  const versions = shown ? (shown.outputs?.length ? shown.outputs : [{ style: 'better', text: shown.output }]) : [];
  const copy = async (text, key) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopied(key);
      selectionFeedback();
      setTimeout(() => setCopied(current => current === key ? null : current), 1800);
    } catch { setCopied(null); }
  };
  return <Modal visible={Boolean(shown)} transparent animationType="none" statusBarTranslucent onRequestClose={requestClose}>
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <NativeAnimated.View pointerEvents="none" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.42)', opacity: progress }} />
      <Pressable onPress={requestClose} accessibilityRole="button" accessibilityLabel="Close rewrite details" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
      <NativeAnimated.View style={{ width: '100%', maxWidth: 560, maxHeight: '88%', alignSelf: 'center', paddingTop: 9, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: c.stage, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [Math.round(screenHeight * 0.6), 0] }) }] }}>
        <View style={{ alignSelf: 'center', width: 38, height: 4, marginBottom: 14, borderRadius: 2, backgroundColor: c.line }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, marginBottom: 6 }}>
          <View>
            <Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 18, letterSpacing: -0.4 }}>Rewrite details</Text>
            {shown && <Text style={{ marginTop: 2, color: c.sub, fontFamily: font.regular, fontSize: 13 }}>{dateLabel(shown.date)}</Text>}
          </View>
          <Pressable onPress={requestClose} accessibilityRole="button" style={{ minHeight: 38, paddingHorizontal: 16, borderRadius: 19, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 15 }}>Done</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 34 }} showsVerticalScrollIndicator={false}>
          {shown && <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: c.sub, fontFamily: font.medium, fontSize: 12 }}>Your message</Text>
              <CopyButton text={shown.input} id="draft" copied={copied} onCopy={copy} colors={c} title="Your message" />
            </View>
            <View style={{ padding: 16, borderWidth: 1, borderColor: c.line, borderRadius: 18, backgroundColor: c.card }}>
              <Text selectable style={{ color: c.ink, fontFamily: font.regular, fontSize: 14, lineHeight: 21 }}>{shown.input}</Text>
            </View>
            <Text style={{ marginTop: 26, marginBottom: 14, color: c.sub, fontFamily: font.medium, fontSize: 12 }}>{versions.length === 1 ? 'Rewritten version' : `${versions.length} rewritten versions`}</Text>
            {versions.map((version, index) => {
              const accent = styleAccents[version.style] || '#9a69c9';
              const key = `v-${version.style}`;
              return <View key={version.style} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ width: 22, alignItems: 'center' }}>
                  <View style={{ width: 22, height: 22, marginTop: 8, borderRadius: 11, borderWidth: 1, borderColor: accent + '55', backgroundColor: accent + '1f', alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accent }} /></View>
                  {index < versions.length - 1 && <View style={{ flex: 1, width: 1.5, marginTop: 6, backgroundColor: c.line }} />}
                </View>
                <View style={{ flex: 1, minWidth: 0, paddingBottom: index < versions.length - 1 ? 32 : 0 }}>
                  <View style={{ minHeight: 38, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <Text style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, overflow: 'hidden', backgroundColor: accent + '22', color: accent, fontFamily: font.medium, fontSize: 12 }}>{rewriteStyleLabels[version.style] || version.style}</Text>
                    <CopyButton text={version.text} id={key} copied={copied} onCopy={copy} colors={c} title={rewriteStyleLabels[version.style] || version.style} />
                  </View>
                  <Text selectable style={{ marginTop: 6, color: c.ink, fontFamily: font.regular, fontSize: 15, lineHeight: 23 }}>{version.text}</Text>
                </View>
              </View>;
            })}
          </>}
        </ScrollView>
      </NativeAnimated.View>
    </View>
  </Modal>;
}

function ResultTimeline({ results, copied, onCopy, intro, mobile }) {
  const c = useColors();
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(1), 850);
    return () => clearTimeout(timer);
  }, []);
  return <View style={{ width: '100%', gap: 0, paddingTop: mobile ? 18 : 24, paddingBottom: 12 }}>
    <Animated.Text entering={FadeInDown.duration(600).reduceMotion(ReduceMotion.System)} style={{ marginBottom: 18, color: c.ink, fontFamily: font.regular, fontSize: 17, lineHeight: 25 }}>{intro}</Animated.Text>
    {results.slice(0, revealed).map((result, index) => <ResultCard key={result.style} title={rewriteStyleLabels[result.style]} styleKey={result.style} content={result.text} copyId={`style-${result.style}`} copied={copied} onCopy={onCopy} isLast={index === results.length - 1} nextVisible={revealed > index + 1} onDone={() => setRevealed(current => Math.max(current, index + 2))} />)}
  </View>;
}

function ResultCard({ title, styleKey, content, copyId, copied, onCopy, children, isLast = false, nextVisible = false, onDone }) {
  const c = useColors();
  const accent = styleAccents[styleKey] || '#9a69c9';
  return <Animated.View entering={FadeInDown.duration(580).reduceMotion(ReduceMotion.System)} style={{ flexDirection: 'row', gap: 12 }}>
    <View style={{ width: 22, alignItems: 'center' }}>
      <View style={{ width: 22, height: 22, marginTop: 8, borderRadius: 11, borderWidth: 1, borderColor: accent + '55', backgroundColor: accent + '1f', alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accent }} /></View>
      {!isLast && nextVisible && <Animated.View entering={FadeIn.duration(600)} style={{ flex: 1, width: 1.5, marginTop: 6, backgroundColor: c.line }} />}
    </View>
    <View style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : 44 }}>
      <View style={{ minHeight: 38, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <Text style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, overflow: 'hidden', backgroundColor: accent + '22', color: accent, fontFamily: font.medium, fontSize: 13 }}>{title}</Text>
        {copyId && <CopyButton text={content} id={copyId} copied={copied} onCopy={onCopy} colors={c} title={title} />}
      </View>
      <StreamingText text={content} delay={350} onDone={onDone} style={{ marginTop: 6, color: c.ink, fontFamily: font.regular, fontSize: 17, lineHeight: 26 }} />
      {children}
    </View>
  </Animated.View>;
}

function ProcessingState({ message, versionCount, compact }) {
  const c = useColors();
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1.07, { duration: 620 }), withTiming(1, { duration: 620 })), -1);
    return () => cancelAnimation(pulse);
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const fadeStyle = useAnimatedStyle(() => ({ opacity: 1 - (pulse.value - 1) * 5 }));
  return <Animated.View entering={FadeInDown.duration(240).reduceMotion(ReduceMotion.System)} accessibilityRole="progressbar" accessibilityLabel={message} style={{ width: '100%', paddingTop: compact ? 20 : 28, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
    <Animated.View style={pulseStyle}><RewriteRLogo size={26} /></Animated.View>
    <Animated.Text key={message} entering={FadeIn.duration(350)} style={[{ color: c.sub, fontFamily: font.regular, fontSize: 16 }, fadeStyle]}>{message.replace(/…$/, '')}…</Animated.Text>
  </Animated.View>;
}

function AvatarStack({ colors, borderColor = colors.inset }) {
  return <View style={{ flexDirection: 'row', paddingLeft: 8 }}>
    {[0, 1, 2].map(index => <View key={index} style={{ width: 28, height: 28, marginLeft: -9, borderWidth: 2, borderColor, borderRadius: 14, overflow: 'hidden' }}><Avatar variant={avatarOrder[index]} size={24} /></View>)}
  </View>;
}

function RewriteStyleSheet({ visible, selectedStyles, onToggle, onClose }) {
  const c = useColors();
  const closing = useRef(false);
  const [progress] = useState(() => new NativeAnimated.Value(0));

  useEffect(() => {
    if (visible) {
      closing.current = false;
      progress.setValue(0);
      NativeAnimated.timing(progress, {
        toValue: 1,
        duration: 240,
        easing: NativeEasing.out(NativeEasing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [progress, visible]);

  const finishClose = () => {
    onClose();
  };
  const requestClose = () => {
    if (closing.current) return;
    closing.current = true;
    NativeAnimated.timing(progress, {
      toValue: 0,
      duration: 180,
      easing: NativeEasing.inOut(NativeEasing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => { if (finished) finishClose(); });
  };
  const sheetLift = progress.interpolate({ inputRange: [0, 1], outputRange: [32, 0] });

  return <Modal visible={visible} transparent animationType="none" statusBarTranslucent presentationStyle="overFullScreen" onRequestClose={requestClose}>
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <NativeAnimated.View pointerEvents="none" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.42)', opacity: progress }} />
      <Pressable onPress={requestClose} accessibilityRole="button" accessibilityLabel="Close rewrite style options" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
      <NativeAnimated.View style={{ width: '100%', maxWidth: 560, alignSelf: 'center', paddingTop: 9, paddingHorizontal: 17, paddingBottom: 24, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: c.stage, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 25, shadowOffset: { width: 0, height: -8 }, opacity: progress, transform: [{ translateY: sheetLift }] }}>
        <View style={{ alignSelf: 'center', width: 38, height: 4, marginBottom: 17, borderRadius: 2, backgroundColor: c.line }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <View style={{ flex: 1, paddingRight: 18 }}>
            <Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 20, letterSpacing: -0.4 }}>Choose your versions</Text>
            <Text style={{ marginTop: 4, color: c.sub, fontFamily: font.regular, fontSize: 14, lineHeight: 20 }}>Select one or more styles for your rewritten message.</Text>
          </View>
          <Pressable onPress={requestClose} disabled={!selectedStyles.length} accessibilityRole="button" accessibilityState={{ disabled: !selectedStyles.length }} style={{ minHeight: 38, paddingHorizontal: 12, borderRadius: 19, backgroundColor: c.card, opacity: selectedStyles.length ? 1 : 0.4, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 15 }}>Done</Text></Pressable>
        </View>
        <View style={{ marginTop: 5, borderWidth: 1, borderColor: c.line, borderRadius: 17, overflow: 'hidden', backgroundColor: c.card }}>
          {rewriteStyles.map((style, index) => {
            const selected = selectedStyles.includes(style.value);
            return <View key={style.value} style={{ minHeight: 78, paddingVertical: 10, paddingHorizontal: 16, borderTopWidth: index ? 1 : 0, borderTopColor: c.line, backgroundColor: selected ? c.inset : c.card, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
              <View style={{ flex: 1 }}><Text style={{ color: c.ink, fontFamily: selected ? font.medium : font.medium, fontSize: 16 }}>{style.label}</Text><Text style={{ marginTop: 3, color: c.sub, fontFamily: font.regular, fontSize: 14, lineHeight: 20 }}>{style.description}</Text></View>
              <ToggleSwitch value={selected} onValueChange={() => onToggle(style.value)} label={`${style.label} version`} />
            </View>;
          })}
        </View>
      </NativeAnimated.View>
    </View>
  </Modal>;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const glowColors = ['#9a69c9', '#e46cdb', '#f77db6', '#7a85ee', '#9a69c9'];

// Gemini-style border: the whole outline lights up with a gradient that flows around it once, then fades.
function GlowBorder({ radius, active }) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const progress = useSharedValue(0);
  useEffect(() => {
    cancelAnimation(progress);
    progress.value = 0;
    if (!active) return undefined;
    progress.value = withDelay(2500, withRepeat(withSequence(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
      withDelay(5000, withTiming(0, { duration: 0 })),
    ), -1));
    return () => cancelAnimation(progress);
  }, [active, progress]);
  const w = Math.max(0, box.width - 3);
  const h = Math.max(0, box.height - 3);
  const cx = box.width / 2;
  const cy = box.height / 2;
  const reach = Math.hypot(box.width, box.height) / 2;
  const gradientProps = useAnimatedProps(() => {
    const angle = progress.value * Math.PI * 2;
    return { x1: cx - Math.cos(angle) * reach, y1: cy - Math.sin(angle) * reach, x2: cx + Math.cos(angle) * reach, y2: cy + Math.sin(angle) * reach };
  });
  const frameStyle = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, 0.12, 0.82, 1], [0, 1, 1, 0]) }));
  return <View pointerEvents="none" onLayout={event => setBox(event.nativeEvent.layout)} style={{ position: 'absolute', top: -1, right: -1, bottom: -1, left: -1 }}>
    {box.width > 0 && <Animated.View style={[{ flex: 1 }, frameStyle]}>
      <Svg width={box.width} height={box.height}>
        <Defs>
          <AnimatedLinearGradient id="glowGradient" gradientUnits="userSpaceOnUse" animatedProps={gradientProps}>
            {glowColors.map((color, index) => <Stop key={index} offset={index / (glowColors.length - 1)} stopColor={color} />)}
          </AnimatedLinearGradient>
        </Defs>
        <Rect x={1.5} y={1.5} width={w} height={h} rx={radius} ry={radius} fill="none" stroke="url(#glowGradient)" strokeWidth={2.6} />
      </Svg>
    </Animated.View>}
  </View>;
}

function MessageComposer({ draft, onChangeText, onPaste, onClear, language, languageOpen, onToggleLanguage, onSelectLanguage, selectedStyles, onOpenStyleSheet, onExample, onRewrite, isWorking, idleGlow, compact = false }) {
  const c = useColors();
  return <View style={{ minHeight: compact ? 137 : 220, paddingTop: compact ? 13 : 18, paddingHorizontal: compact ? 14 : 20, paddingBottom: compact ? 12 : 16, borderWidth: 1, borderRadius: compact ? 22 : 17, backgroundColor: c.card, borderColor: c.line }}>
    <GlowBorder radius={compact ? 22 : 17} active={idleGlow} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 14 }}>Your message</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
        <Pressable onPress={onPaste} disabled={isWorking} accessibilityRole="button" accessibilityLabel="Paste from clipboard" accessibilityState={{ disabled: isWorking }} style={{ minWidth: 68, height: 38, paddingHorizontal: 14, borderWidth: 1, borderColor: c.line, borderRadius: 19, backgroundColor: c.inset, opacity: isWorking ? 0.42 : 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 14 }}>Paste</Text>
        </Pressable>
        <Pressable onPress={onClear} disabled={!draft.length || isWorking} accessibilityRole="button" accessibilityLabel="Clear message" accessibilityState={{ disabled: !draft.length || isWorking }} style={{ minWidth: 68, height: 38, paddingHorizontal: 14, borderWidth: 1, borderColor: c.line, borderRadius: 19, backgroundColor: c.inset, opacity: !draft.length || isWorking ? 0.42 : 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 14 }}>Clear</Text>
        </Pressable>
      </View>
    </View>
    <TextInput value={draft} onChangeText={onChangeText} onSubmitEditing={onRewrite} multiline submitBehavior="submit" returnKeyType="send" textAlignVertical="top" autoCorrect autoCapitalize="sentences" placeholder="Type your message here..." placeholderTextColor={c.muted} style={{ flex: compact ? undefined : 1, minHeight: compact ? 58 : 118, maxHeight: compact ? 96 : 170, paddingTop: 12, paddingBottom: 8, color: c.ink, fontFamily: font.regular, fontSize: compact ? 15 : 14, lineHeight: 22 }} accessibilityLabel="Your message" />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, zIndex: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable onPress={onOpenStyleSheet} accessibilityRole="button" accessibilityLabel={`Choose rewrite styles, ${selectedStyles.length ? selectedStyles.map(style => rewriteStyleLabels[style]).join(', ') : 'none'} selected`} style={{ width: 38, height: 38, borderWidth: 1, borderColor: c.line, borderRadius: 19, backgroundColor: c.inset, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="add" size={22} color={c.ink} /></Pressable>
        <View style={{ position: 'relative', zIndex: 30 }}>
          <Pressable onPress={onToggleLanguage} accessibilityRole="button" accessibilityLabel="Output language" accessibilityState={{ expanded: languageOpen }} style={{ minWidth: 118, height: 40, paddingHorizontal: 15, borderWidth: 1, borderColor: c.line, borderRadius: 20, backgroundColor: c.inset, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}><Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 15 }}>{language === 'en' ? 'English' : 'Hindi'}</Text><Icon name="chevron" size={13} color={c.ink} /></Pressable>
          {languageOpen && <Animated.View entering={FadeInDown.duration(160).reduceMotion(ReduceMotion.System)} style={{ position: 'absolute', bottom: 48, left: 0, width: 190, padding: 6, borderWidth: 1, borderColor: c.line, borderRadius: 16, backgroundColor: c.card, elevation: 10, shadowColor: '#000', shadowOpacity: 0.13, shadowRadius: 20, zIndex: 40 }}>{[['en', 'English'], ['hi', 'Hindi']].map(([value, label]) => <Pressable key={value} onPress={() => onSelectLanguage(value)} accessibilityRole="radio" accessibilityState={{ checked: language === value }} style={{ minHeight: 52, paddingHorizontal: 14, borderRadius: 11, backgroundColor: language === value ? c.inset : c.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: c.ink, fontFamily: language === value ? font.medium : font.regular, fontSize: 17 }}>{label}</Text>{language === value && <Icon name="check" size={18} color="#9a69c9" />}</Pressable>)}</Animated.View>}
        </View>
        {!compact && <Pressable onPress={onExample} accessibilityRole="button" style={{ minHeight: 36, justifyContent: 'center' }}><Text style={{ color: c.sub, fontFamily: font.medium, fontSize: 13 }}>Try example</Text></Pressable>}
      </View>
      <Pressable onPress={onRewrite} disabled={!draft.trim() || !selectedStyles.length || isWorking} accessibilityRole="button" accessibilityLabel="Rewrite message" accessibilityState={{ disabled: !draft.trim() || !selectedStyles.length || isWorking, busy: isWorking }} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: c.button, opacity: !draft.trim() || !selectedStyles.length || isWorking ? 0.34 : 1, alignItems: 'center', justifyContent: 'center' }}>{isWorking ? <ActivityIndicator size="small" color={c.buttonInk} /> : <Icon name="arrow" size={18} color={c.buttonInk} />}</Pressable>
    </View>
  </View>;
}

export function HistoryExpandedView({ history, onOpen, width }) {
  const c = useColors();
  const desktop = width >= 1024;
  const featured = history[0];
  const secondaryItems = history.length > 1 ? history.slice(1) : [];
  while (secondaryItems.length < 2) secondaryItems.push(null);
  const featuredInner = <>
    <Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 21, letterSpacing: -0.5 }}>{featured ? 'Latest message' : 'Your first rewrite'}</Text>
    <Text style={{ marginTop: 8, color: c.ink, fontFamily: font.medium, fontSize: 13 }}>{featured ? dateLabel(featured.date) : 'Ready when you are'}</Text>
    <Text numberOfLines={3} style={{ marginTop: 13, maxWidth: 300, color: c.sub, fontFamily: font.regular, fontSize: 15, lineHeight: 22 }}>{featured ? featured.output : 'Paste a message below. Your recent rewrites will live here.'}</Text>
    <View style={{ minHeight: 67, marginTop: 'auto', marginHorizontal: -20, marginBottom: 5, paddingHorizontal: 23, paddingTop: 18, paddingBottom: 24, borderRadius: 14, backgroundColor: c.inset, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><Icon name="history" size={16} color={c.ink} /><Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 14 }}>{featured ? 'Saved rewrite' : 'Recent activity'}</Text></View>
      <AvatarStack colors={c} />
    </View>
  </>;
  return <View style={{ flex: desktop ? 1 : undefined, minWidth: 0 }}>
    <View style={{ minHeight: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 3, marginBottom: 14 }}>
      <View>
        <Kicker style={{ marginBottom: 1 }}>YOUR SPACE</Kicker>
        <Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: desktop ? 24 : 22, letterSpacing: -0.7 }}>Recent rewrites</Text>
      </View>
      <Text style={{ color: c.sub, fontFamily: font.regular, fontSize: 14 }}>{history.length} saved</Text>
    </View>
    <Animated.View entering={FadeInDown.duration(190).reduceMotion(ReduceMotion.System)}>
      <View style={{ minHeight: desktop ? 226 : 210, borderWidth: 1, borderColor: c.line, borderRadius: 17, backgroundColor: c.card, overflow: 'hidden' }}>
        {featured && onOpen ? <Pressable onPress={() => onOpen(featured)} accessibilityRole="button" accessibilityLabel="Open latest rewrite" style={{ flex: 1, paddingTop: 26, paddingHorizontal: 25 }}>{featuredInner}</Pressable> : <View style={{ flex: 1, paddingTop: 26, paddingHorizontal: 25 }}>{featuredInner}</View>}
      </View>
      <View style={{ marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 14 }}>
        {secondaryItems.map((item, index) => {
          const position = index + 1;
          const inner = <><Avatar variant={avatarOrder[position % avatarOrder.length]} size={42} /><Text style={{ marginTop: 'auto', paddingTop: 10, color: c.ink, fontFamily: font.medium, fontSize: 15 }}>{item ? `Rewrite ${position + 1}` : 'More room to write'}</Text><Text numberOfLines={2} style={{ marginTop: 6, color: c.sub, fontFamily: font.regular, fontSize: 14, lineHeight: 20 }}>{item ? item.output : 'Your next message will appear here.'}</Text><Text style={{ marginTop: 14, color: c.muted, fontFamily: font.regular, fontSize: 12 }}>{item ? dateLabel(item.date) : 'Recent rewrite'}</Text></>;
          const cardStyle = { width: '47.5%', minWidth: 0, minHeight: desktop ? 185 : 170, paddingTop: 17, paddingHorizontal: 15, paddingBottom: 15, borderWidth: 1, borderColor: c.line, borderRadius: 17, backgroundColor: c.card };
          return item && onOpen ? <Pressable key={item.id} onPress={() => onOpen(item)} accessibilityRole="button" accessibilityLabel={`Open rewrite ${position + 1}`} style={cardStyle}>{inner}</Pressable> : <View key={item?.id ?? `empty-${position}`} style={cardStyle}>{inner}</View>;
        })}
      </View>
      <View style={{ marginTop: 17, paddingHorizontal: 3, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
        <Ionicons name="time-outline" size={16} color={c.muted} />
        <Text style={{ flex: 1, color: c.muted, fontFamily: font.regular, fontSize: 13, lineHeight: 18 }}>Rewrites are automatically deleted after 14 days.</Text>
      </View>
    </Animated.View>
  </View>;
}

function RecentRewritesLink({ history }) {
  const c = useColors();
  return <Pressable onPress={() => { selectionFeedback(); router.push('/history'); }} accessibilityRole="button" accessibilityLabel={`Open ${history.length} recent rewrites`} style={{ width: '100%', minHeight: 74, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: c.line, borderRadius: 17, backgroundColor: c.card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
    <View><Kicker style={{ marginBottom: 1 }}>YOUR SPACE</Kicker><Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 20, letterSpacing: -0.4 }}>Recent rewrites</Text></View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><AvatarStack colors={c} borderColor={c.card} /><Ionicons name="chevron-forward" size={18} color={c.ink} /></View>
  </Pressable>;
}

export default function WorkspaceScreen() {
  const c = useColors();
  const { width } = useWindowDimensions();
  const { history, saveRewrite } = useApp();
  const mobile = width < 700;
  const scrollRef = useRef(null);
  const [draft, setDraft] = useState('');
  const [rewriteResults, setRewriteResults] = useState([]);
  const [submitted, setSubmitted] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [copied, setCopied] = useState(null);
  const [language, setLanguage] = useState('en');
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState(['better']);
  const [styleSheetOpen, setStyleSheetOpen] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  useEffect(() => {
    if (!isWorking) return undefined;
    const timer = setInterval(() => setProcessingStep(current => (current + 1) % processingMessages.length), 1250);
    return () => clearInterval(timer);
  }, [isWorking]);

  const clearResult = () => { setRewriteResults([]); setSubmitted(''); setCopied(null); };
  const improve = async () => {
    if (!draft.trim() || !selectedStyles.length || isWorking) return;
    const submittedDraft = draft.trim();
    tapFeedback();
    setProcessingStep(0); setRewriteResults([]); setSubmitted(submittedDraft); setIsWorking(true); setCopied(null); setDraft('');
    try {
      const result = await rewriteMessage({
        text: submittedDraft,
        language,
        styles: selectedStyles,
      });
      const selectedOutputs = selectedStyles.map(style => result.outputs.find(output => output.style === style)).filter(Boolean);
      if (!selectedOutputs.length) throw new Error('None of the selected versions were returned.');
      setRewriteResults(selectedOutputs);
      saveRewrite(submittedDraft, selectedOutputs[0].text, selectedOutputs.map(({ style, text }) => ({ style, text })));
      successFeedback();
    } catch (error) {
      setSubmitted('');
      setDraft(current => current || submittedDraft);
      Alert.alert(
        'Rewrite failed',
        error instanceof Error ? error.message : 'Please try again in a moment.',
      );
    } finally {
      setIsWorking(false); setProcessingStep(0);
    }
  };
  const copyResult = async (text, key) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopied(key);
      selectionFeedback();
      setTimeout(() => setCopied(current => current === key ? null : current), 1800);
    } catch { setCopied(null); }
  };

  const composer = <MessageComposer
    draft={draft}
    onChangeText={text => { setDraft(text); clearResult(); }}
    onPaste={async () => {
      try {
        const clipboardText = await Clipboard.getStringAsync();
        if (!clipboardText) return;
        selectionFeedback();
        setDraft(clipboardText);
        clearResult();
      } catch {
        Alert.alert('Paste unavailable', 'Allow clipboard access, then try again.');
      }
    }}
    onClear={() => {
      selectionFeedback();
      setDraft('');
      setLanguageOpen(false);
      clearResult();
    }}
    language={language}
    languageOpen={languageOpen}
    onToggleLanguage={() => { tapFeedback(); setLanguageOpen(open => !open); }}
    onSelectLanguage={value => { selectionFeedback(); setLanguage(value); clearResult(); setLanguageOpen(false); }}
    selectedStyles={selectedStyles}
    onOpenStyleSheet={() => { tapFeedback(); setLanguageOpen(false); setStyleSheetOpen(true); }}
    onExample={() => { selectionFeedback(); setDraft(example); clearResult(); }}
    onRewrite={improve}
    isWorking={isWorking}
    idleGlow={!isWorking && !draft}
    compact
  />;

  const toggleStyle = value => {
    selectionFeedback();
    setSelectedStyles(current => {
      if (current.includes(value)) return current.filter(style => style !== value);
      return rewriteStyles.map(style => style.value).filter(style => current.includes(style) || style === value);
    });
    clearResult();
  };

  return <Screen showProfile scrollRef={scrollRef} fixedHeader bottomContent={composer} contentBottomPadding={mobile ? 16 : 28}>
    <RewriteStyleSheet visible={styleSheetOpen} selectedStyles={selectedStyles} onToggle={toggleStyle} onClose={() => { tapFeedback(); if (!selectedStyles.length) setSelectedStyles(['better']); setStyleSheetOpen(false); }} />
    <View style={{ flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', paddingTop: mobile ? 8 : 24 }}>
      <RecentRewritesLink history={history} />
      {submitted ? <View style={{ width: '100%' }}><UserBubble text={submitted} />{isWorking ? <ProcessingState message={processingMessages[processingStep]} versionCount={selectedStyles.length} compact={mobile} /> : <ResultTimeline key={rewriteResults.map(r => r.text).join('|')} results={rewriteResults} copied={copied} onCopy={copyResult} mobile={mobile} intro={rewriteResults.length === 1 ? 'Here’s your rewritten message' : `Here ${rewriteResults.length === 2 ? 'are both' : `are all ${rewriteResults.length}`} rewritten versions of your message`} />}</View> : <Animated.View entering={FadeInDown.duration(260).reduceMotion(ReduceMotion.System)} style={{ flex: 1, minHeight: mobile ? 260 : 340, alignItems: 'center', justifyContent: 'center', paddingBottom: mobile ? 20 : 54 }}>
        <RewriteRLogo size={mobile ? 64 : 72} />
        <Text style={{ marginTop: 18, color: c.ink, fontFamily: 'BricolageGrotesque_600SemiBold', fontSize: mobile ? 22 : 25, letterSpacing: -0.8 }}>Start with a message</Text>
        <Text style={{ marginTop: 7, color: c.sub, fontFamily: font.regular, fontSize: 12 }}>Write or paste your draft below.</Text>
      </Animated.View>}
    </View>
  </Screen>;
}

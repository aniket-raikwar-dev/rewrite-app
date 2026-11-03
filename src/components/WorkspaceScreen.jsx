import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Animated, { cancelAnimation, FadeInDown, interpolateColor, ReduceMotion, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Avatar, Icon } from './Artwork';
import { font, Kicker, Screen, useColors } from './Screen';
import { useApp } from '../state/AppContext';
import { alternativeRewrites, example, localRewrite } from '../lib/rewrite';
import { selectionFeedback, successFeedback, tapFeedback } from '../lib/feedback';

const dateLabel = date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function CopyButton({ text, id, copied, onCopy, colors, title }) {
  const label = title === 'Better version' ? 'better version' : `${title.toLowerCase()} version`;
  return <Pressable onPress={() => onCopy(text, id)} accessibilityRole="button" accessibilityLabel={copied === id ? `${title} copied` : `Copy ${label}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5, paddingHorizontal: 7, borderWidth: 1, borderColor: colors.line, borderRadius: 7, backgroundColor: colors.inset }}>
    <Icon name={copied === id ? 'check' : 'copy'} size={15} color={colors.ink} />
    <Text style={{ color: colors.ink, fontFamily: font.medium, fontSize: 10 }}>{copied === id ? 'Copied' : 'Copy'}</Text>
  </Pressable>;
}

function ResultCard({ title, content, copyId, copied, onCopy, children, isMain = false, working = false }) {
  const c = useColors();
  return <Animated.View entering={FadeInDown.duration(220).reduceMotion(ReduceMotion.System)} style={{ minHeight: isMain ? 125 : 0, paddingHorizontal: 23, paddingVertical: 20, borderWidth: 1, borderColor: c.line, borderRadius: 17, backgroundColor: c.card }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 12 }}>{title}</Text>
      {copyId && <CopyButton text={content} id={copyId} copied={copied} onCopy={onCopy} colors={c} title={title} />}
    </View>
    <Animated.View key={copyId ? 'ready' : working ? 'working' : 'empty'} entering={FadeInDown.duration(240).reduceMotion(ReduceMotion.System)} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingTop: 19 }}>
      {working && <ActivityIndicator size="small" color="#9a69c9" />}
      <Text style={{ flex: 1, color: copyId ? c.ink : c.sub, fontFamily: font.regular, fontSize: copyId ? 14 : 12, lineHeight: copyId ? 23 : 20 }}>{content}</Text>
    </Animated.View>
    {children}
  </Animated.View>;
}

function AvatarStack({ colors }) {
  return <View style={{ flexDirection: 'row', paddingLeft: 8 }}>
    {[0, 1, 2].map(index => <View key={index} style={{ width: 28, height: 28, marginLeft: -9, borderWidth: 2, borderColor: colors.inset, borderRadius: 14, overflow: 'hidden' }}><Avatar variant={index} size={24} /></View>)}
  </View>;
}

function HistorySection({ history, showAll, setShowAll, onOpen, width }) {
  const c = useColors();
  const desktop = width >= 1024;
  const tablet = width >= 701 && width < 1024;
  const featured = history[0];
  const featuredInner = <>
    <Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 17, letterSpacing: -0.5 }}>{featured ? 'Latest message' : 'Your first rewrite'}</Text>
    <Text style={{ marginTop: 8, color: c.ink, fontFamily: font.semibold, fontSize: 10 }}>{featured ? dateLabel(featured.date) : 'Ready when you are'}</Text>
    <Text numberOfLines={3} style={{ marginTop: 13, maxWidth: 300, color: c.sub, fontFamily: font.regular, fontSize: 12, lineHeight: 19 }}>{featured ? featured.output : 'Paste a message below. Your recent rewrites will live here.'}</Text>
    <View style={{ minHeight: 67, marginTop: 'auto', marginHorizontal: -20, marginBottom: 5, paddingHorizontal: 23, paddingTop: 18, paddingBottom: 24, borderRadius: 14, backgroundColor: c.inset, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><Icon name="history" size={14} color={c.ink} /><Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 11 }}>{featured ? 'Saved rewrite' : 'Recent activity'}</Text></View>
      <AvatarStack colors={c} />
    </View>
  </>;
  return <View style={{ flex: desktop ? 1 : undefined, minWidth: 0 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginHorizontal: 3, marginBottom: 18 }}>
      <View><Kicker>YOUR SPACE</Kicker><Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 27, letterSpacing: -1.2 }}>Recent rewrites</Text></View>
      <Text style={{ marginBottom: 3, color: c.sub, fontFamily: font.regular, fontSize: 11 }}>{history.length} saved</Text>
    </View>
    <View style={{ flexDirection: tablet ? 'row' : 'column', gap: 18 }}>
      <View style={{ flex: tablet ? 1.05 : undefined, minHeight: desktop ? 226 : 210, borderWidth: 1, borderColor: c.line, borderRadius: 17, backgroundColor: c.card, overflow: 'hidden' }}>
        {featured ? <Pressable onPress={() => onOpen(featured)} accessibilityRole="button" accessibilityLabel="Open latest rewrite" style={{ flex: 1, paddingTop: 26, paddingHorizontal: 25 }}>{featuredInner}</Pressable> : <View style={{ flex: 1, paddingTop: 26, paddingHorizontal: 25 }}>{featuredInner}</View>}
      </View>
      <View style={{ flex: tablet ? 0.95 : undefined, flexDirection: 'row', gap: 14 }}>
        {[1, 2].map(position => {
          const item = history[position];
          const inner = <><Avatar variant={position} size={42} /><Text style={{ marginTop: 'auto', paddingTop: 10, color: c.ink, fontFamily: font.semibold, fontSize: 11 }}>{item ? `Rewrite ${position + 1}` : 'More room to write'}</Text><Text numberOfLines={2} style={{ marginTop: 6, color: c.sub, fontFamily: font.regular, fontSize: 10, lineHeight: 15 }}>{item ? item.output : 'Your next message will appear here.'}</Text><Text style={{ marginTop: 17, color: c.muted, fontFamily: font.regular, fontSize: 9 }}>{item ? dateLabel(item.date) : 'Recent rewrite'}</Text></>;
          const cardStyle = { flex: 1, minWidth: 0, minHeight: desktop ? 165 : 145, paddingTop: 17, paddingHorizontal: 15, paddingBottom: 15, borderWidth: 1, borderColor: c.line, borderRadius: 17, backgroundColor: c.card };
          return item ? <Pressable key={item.id} onPress={() => onOpen(item)} accessibilityRole="button" accessibilityLabel={`Open rewrite ${position + 1}`} style={cardStyle}>{inner}</Pressable> : <View key={position} style={cardStyle}>{inner}</View>;
        })}
      </View>
    </View>
    {history.length > 3 && <>
      <Pressable onPress={() => setShowAll(!showAll)} accessibilityRole="button" accessibilityState={{ expanded: showAll }} style={{ alignSelf: 'flex-start', marginTop: 15, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 7 }}><Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 11 }}>{showAll ? 'Show less' : `View all ${history.length} rewrites`}</Text><Icon name="arrow" size={14} color={c.ink} /></Pressable>
      {showAll && <View style={{ gap: 7, marginTop: 7 }}>{history.slice(3).map((item, index) => <Pressable key={item.id} onPress={() => onOpen(item)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 9, paddingHorizontal: 12, borderWidth: 1, borderColor: c.line, borderRadius: 11, backgroundColor: c.card }}><Avatar variant={index + 3} size={28} /><Text numberOfLines={1} style={{ flex: 1, color: c.ink, fontFamily: font.regular, fontSize: 11 }}>{item.output}</Text><Text style={{ color: c.muted, fontFamily: font.regular, fontSize: 10 }}>{dateLabel(item.date)}</Text></Pressable>)}</View>}
    </>}
  </View>;
}

export default function WorkspaceScreen() {
  const c = useColors();
  const { width } = useWindowDimensions();
  const { history, saveRewrite } = useApp();
  const desktop = width >= 1024;
  const scrollRef = useRef(null);
  const [draft, setDraft] = useState('');
  const [rewritten, setRewritten] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [copied, setCopied] = useState(null);
  const [showMoreVersions, setShowMoreVersions] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [language, setLanguage] = useState('en');
  const [languageOpen, setLanguageOpen] = useState(false);
  const extraVersions = rewritten && showMoreVersions ? alternativeRewrites(rewritten) : [];
  const inputGlow = useSharedValue(0);
  useEffect(() => {
    if (isWorking) {
      inputGlow.value = withRepeat(withSequence(withTiming(1, { duration: 440 }), withTiming(0.2, { duration: 440 })), -1);
    } else {
      cancelAnimation(inputGlow);
      inputGlow.value = withTiming(0, { duration: 320 });
    }
  }, [isWorking, inputGlow]);
  const inputMotion = useAnimatedStyle(() => ({
    borderColor: interpolateColor(inputGlow.value, [0, 1], [c.line, '#ac79db']),
    shadowColor: '#ad75dd',
    shadowOpacity: inputGlow.value * 0.27,
    shadowRadius: 15,
  }));

  const clearResult = () => { setRewritten(''); setShowMoreVersions(false); setCopied(null); };
  const improve = async () => {
    if (!draft.trim() || isWorking || language !== 'en') return;
    tapFeedback();
    setIsWorking(true); setCopied(null); setShowMoreVersions(false);
    await new Promise(resolve => setTimeout(resolve, 620));
    const output = localRewrite(draft);
    setRewritten(output);
    saveRewrite(draft, output);
    setIsWorking(false);
    successFeedback();
  };
  const openHistory = item => {
    selectionFeedback();
    setDraft(item.input); setRewritten(item.output); setCopied(null); setShowMoreVersions(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  };
  const copyResult = async (text, key) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopied(key);
      selectionFeedback();
      setTimeout(() => setCopied(current => current === key ? null : current), 1800);
    } catch { setCopied(null); }
  };

  return <Screen showProfile scrollRef={scrollRef}>
    <View style={{ flexDirection: desktop ? 'row' : 'column', gap: desktop ? 56 : 0, paddingTop: desktop ? 55 : 42 }}>
      <HistorySection history={history} showAll={showAllHistory} setShowAll={setShowAllHistory} onOpen={openHistory} width={width} />
      <View style={{ flex: desktop ? 1.08 : undefined, minWidth: 0, marginTop: desktop ? 0 : 43 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 14, marginHorizontal: 3, marginBottom: 18, zIndex: 5 }}>
          <View style={{ flex: 1 }}><Kicker>NEW MESSAGE</Kicker><Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 27, letterSpacing: -1.2 }}>Make it sound better</Text></View>
          <View style={{ position: 'relative', zIndex: 10 }}>
            <Pressable onPress={() => { tapFeedback(); setLanguageOpen(open => !open); }} accessibilityRole="button" accessibilityLabel="Output language" accessibilityState={{ expanded: languageOpen }} style={{ width: width <= 480 ? 96 : 108, height: 36, paddingHorizontal: 11, borderWidth: 1, borderColor: c.line, borderRadius: 10, backgroundColor: c.card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 11 }}>{language === 'en' ? 'English' : 'Hindi'}</Text><Icon name="chevron" size={14} color={c.ink} /></Pressable>
            {languageOpen && <Animated.View entering={FadeInDown.duration(160).reduceMotion(ReduceMotion.System)} style={{ position: 'absolute', top: 42, right: 0, width: 132, padding: 5, borderWidth: 1, borderColor: c.line, borderRadius: 11, backgroundColor: c.card, elevation: 8, shadowColor: '#000', shadowOpacity: 0.11, shadowRadius: 20, zIndex: 20 }}>{[['en', 'English'], ['hi', 'Hindi']].map(([value, label]) => <Pressable key={value} onPress={() => { selectionFeedback(); setLanguage(value); clearResult(); setLanguageOpen(false); }} accessibilityRole="radio" accessibilityState={{ checked: language === value }} style={{ minHeight: 34, paddingHorizontal: 9, borderRadius: 7, backgroundColor: language === value ? c.inset : c.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: c.ink, fontFamily: language === value ? font.semibold : font.regular, fontSize: 11 }}>{label}</Text>{language === value && <Icon name="check" size={14} color="#9a69c9" />}</Pressable>)}</Animated.View>}
          </View>
        </View>
        <Animated.View style={[{ minHeight: desktop ? 245 : 0, paddingTop: 21, paddingHorizontal: 23, paddingBottom: 18, borderWidth: 1, borderRadius: 17, backgroundColor: c.card }, inputMotion]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 12 }}>Your message</Text><Text style={{ color: c.muted, fontFamily: font.regular, fontSize: 10 }}>{draft.length ? `${draft.length} characters` : 'Paste or type'}</Text></View>
          <TextInput value={draft} onChangeText={text => { setDraft(text); clearResult(); }} multiline textAlignVertical="top" autoCorrect autoCapitalize="sentences" placeholder="Type your message here..." placeholderTextColor={c.muted} style={{ flex: desktop ? 1 : undefined, minHeight: desktop ? 150 : 112, paddingTop: 22, paddingBottom: 12, color: c.ink, fontFamily: font.regular, fontSize: 14, lineHeight: 22 }} accessibilityLabel="Your message" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <Pressable onPress={() => { selectionFeedback(); setDraft(example); clearResult(); }} accessibilityRole="button" style={{ paddingVertical: 7 }}><Text style={{ color: c.sub, fontFamily: font.regular, fontSize: 11 }}>Try an example</Text></Pressable>
            <Pressable onPress={improve} disabled={!draft.trim() || isWorking || language !== 'en'} accessibilityRole="button" accessibilityState={{ disabled: !draft.trim() || isWorking || language !== 'en', busy: isWorking }} style={{ minHeight: 39, paddingHorizontal: 15, borderRadius: 9, backgroundColor: c.button, opacity: !draft.trim() || isWorking || language !== 'en' ? 0.36 : 1, flexDirection: 'row', alignItems: 'center', gap: 14 }}><Text style={{ color: c.buttonInk, fontFamily: font.semibold, fontSize: 11 }}>{isWorking ? 'Improving...' : 'Rewrite message'}</Text>{isWorking ? <ActivityIndicator size="small" color={c.buttonInk} /> : <Icon name="arrow" size={17} color={c.buttonInk} />}</Pressable>
          </View>
        </Animated.View>
        <View style={{ marginTop: 13 }}><ResultCard title="Better version" content={language === 'hi' ? 'Hindi rewriting is coming when AI is connected.' : isWorking ? 'Improving your message...' : rewritten || 'Your improved message will appear here.'} copyId={rewritten && !isWorking ? 'primary' : null} copied={copied} onCopy={copyResult} isMain working={isWorking}>
          {!!rewritten && !showMoreVersions && !isWorking && <Pressable onPress={() => { tapFeedback(); setShowMoreVersions(true); }} accessibilityRole="button" style={{ alignSelf: 'flex-start', marginTop: 18, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text style={{ color: c.ink, fontFamily: font.semibold, fontSize: 11 }}>Need another version</Text><Icon name="arrow" size={15} color={c.ink} /></Pressable>}
        </ResultCard></View>
        {showMoreVersions && <View style={{ marginTop: 10, gap: 10 }}>{extraVersions.length ? extraVersions.map((version, index) => <ResultCard key={version.label} title={version.label} content={version.text} copyId={`extra-${index}`} copied={copied} onCopy={copyResult} />) : <Text style={{ padding: 12, color: c.sub, fontFamily: font.regular, fontSize: 11, lineHeight: 17 }}>This local preview cannot make a distinct version of this message yet.</Text>}</View>}
      </View>
    </View>
  </Screen>;
}

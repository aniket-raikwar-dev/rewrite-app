import React, { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { HistoryDetailModal, HistoryExpandedView } from './WorkspaceScreen';
import { font, Screen, useColors } from './Screen';
import { useApp } from '../state/AppContext';
import { selectionFeedback } from '../lib/feedback';

export default function HistoryScreen() {
  const c = useColors();
  const { width } = useWindowDimensions();
  const { history } = useApp();
  const mobile = width < 700;
  const [selected, setSelected] = useState(null);

  return <Screen showProfile fixedHeader contentBottomPadding={30}>
    <View style={{ paddingTop: mobile ? 16 : 42 }}>
      <Pressable onPress={() => { selectionFeedback(); router.back(); }} accessibilityRole="button" accessibilityLabel="Back to workspace" style={{ alignSelf: 'flex-start', minHeight: 38, paddingHorizontal: 12, borderWidth: 1, borderColor: c.line, borderRadius: 19, backgroundColor: c.card, flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 24 }}>
        <Ionicons name="arrow-back" size={16} color={c.ink} />
        <Text style={{ color: c.ink, fontFamily: font.medium, fontSize: 14 }}>Workspace</Text>
      </Pressable>
      <HistoryExpandedView history={history} width={width} onOpen={item => { selectionFeedback(); setSelected(item); }} />
      <HistoryDetailModal item={selected} onClose={() => setSelected(null)} />
    </View>
  </Screen>;
}

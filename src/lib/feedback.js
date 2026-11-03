import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const trigger = action => {
  if (Platform.OS === 'web') return;
  action().catch(() => {});
};

export const tapFeedback = () => trigger(() => Platform.OS === 'android'
  ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Context_Click)
  : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

export const selectionFeedback = () => trigger(() => Platform.OS === 'android'
  ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Segment_Tick)
  : Haptics.selectionAsync());

export const successFeedback = () => trigger(() => Platform.OS === 'android'
  ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm)
  : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));

// Owner: Shared (led by Mahbub Hasnain) | shell
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dumbbell, House, UserRound, Utensils } from 'lucide-react-native';
import { colors, TAB_BAR_HEIGHT } from '../theme/tokens';
import { AppText } from './AppText';
import { useSettings } from '../context/SettingsContext';
import { useWorkout } from '../context/WorkoutContext';
import { useSnackbar } from '../context/SnackbarContext';

interface Props {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void; emit: (e: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean } };
}
const TABS = [
  { name: 'home', icon: House, en: 'tab.home' },
  { name: 'workouts', icon: Dumbbell, en: 'tab.workouts' },
  { name: 'food', icon: Utensils, en: 'tab.food' },
  { name: 'profile', icon: UserRound, en: 'tab.profile' },
] as const;

/** Four tabs only (design: Navigation/*). Bilingual labels: English first, Bangla beneath. */
export function TabBar({ state, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useSettings();
  const { isRunning } = useWorkout();
  const snack = useSnackbar();
  const activeName = state.routes[state.index]?.name;
  return (
    <View style={[styles.bar, { height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const selected = activeName === tab.name;
        const Icon = tab.icon;
        const label = t(tab.en);
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            style={styles.item}
            onPress={() => {
              // A running session locks the other tabs so the timer cannot be lost silently.
              if (isRunning && tab.name !== 'workouts') {
                snack.show({ kind: 'info', text: t('snack.sessionLock') });
                return;
              }
              navigation.navigate(tab.name);
            }}
          >
            <View style={[styles.indicator, selected && { backgroundColor: colors.primary }]} />
            <Icon size={24} strokeWidth={1.9} color={selected ? colors.primary : colors.textSecondary} />
            <AppText variant="label" color={selected ? colors.text : colors.textSecondary} style={{ fontSize: 12, lineHeight: 16 }}>{label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: 48 },
  indicator: { position: 'absolute', top: 0, width: 28, height: 3, borderRadius: 2, backgroundColor: 'transparent' },
});

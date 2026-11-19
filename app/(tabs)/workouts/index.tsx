// Owner: Shuvrata Banik Shuvo | F3, F4
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Dumbbell, History } from 'lucide-react-native';
import { colors } from '../../../theme/tokens';
import { AppText } from '../../../components/AppText';
import { Card, Chip, ChipRow, ContentState, Screen, Skeleton, TopBar } from '../../../components/ui';
import { api } from '../../../services/api';
import { useSettings } from '../../../context/SettingsContext';
import { useWorkout } from '../../../context/WorkoutContext';
import type { Level, Workout } from '../../../lib/types';

const TAGS = ['Strength', 'Cardio', 'Full Body', 'Home', 'Core'];

/** F3: level-filtered library with loading, error + retry, and empty states. Filters persist while the screen stays mounted. */
export default function WorkoutLibrary() {
  const router = useRouter();
  const { t, language } = useSettings();
  const { active, isRunning } = useWorkout();
  const [level, setLevel] = useState<Level>('beginner');
  const [noEquipment, setNoEquipment] = useState(false);
  const [tag, setTag] = useState<string | undefined>();
  const [state, setState] = useState<{ status: 'loading' | 'error' | 'ready'; items: Workout[] }>({ status: 'loading', items: [] });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }));
    try {
      setState({ status: 'ready', items: await api.workouts.list({ level, noEquipment, tag }) });
    } catch {
      setState({ status: 'error', items: [] });
    }
  }, [level, noEquipment, tag]);
  useEffect(() => { void load(); }, [load]);

  const clear = () => { setNoEquipment(false); setTag(undefined); };
  return (
    <Screen tabs>
      <TopBar title={t('wk.title')} subtitle={t('wk.subtitle')} right={
        <Pressable onPress={() => router.push('/workouts/history')} accessibilityRole="button" accessibilityLabel={t('wk.history')} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <History size={24} color={colors.primary} />
        </Pressable>
      } />
      {isRunning && active && (
        <Pressable onPress={() => router.push(`/workouts/session/${active.clientId}`)} accessibilityRole="button">
          <Card style={{ borderWidth: 1, borderColor: colors.primary }}>
            <AppText variant="label" color={colors.primary}>{t('wk.resume')}</AppText>
            <AppText variant="body">{active.workout.nameEn}</AppText>
          </Card>
        </Pressable>
      )}
      <ChipRow>
        {(['beginner', 'intermediate', 'advanced'] as Level[]).map((l) => <Chip key={l} label={t(`level.${l}` as 'level.beginner')} selected={level === l} onPress={() => setLevel(l)} />)}
      </ChipRow>
      <ChipRow>
        <Chip label={t('wk.noEquipment')} selected={noEquipment} onPress={() => setNoEquipment(!noEquipment)} />
        {TAGS.map((x) => <Chip key={x} label={t(`tag.${x}` as 'tag.Core')} selected={tag === x} onPress={() => setTag(tag === x ? undefined : x)} />)}
      </ChipRow>

      {state.status === 'loading' && (<><AppText variant="label" color={colors.textSecondary}>{t('wk.loading')}</AppText><Skeleton height={120} /><Skeleton height={120} /></>)}
      {state.status === 'error' && <ContentState kind="error" title={t('wk.errorTitle')} body={t('wk.errorBody')} actionLabel={t('common.tryAgain')} onAction={() => void load()} />}
      {state.status === 'ready' && state.items.length === 0 && (
        <ContentState kind="empty" title={t('wk.emptyTitle')} body={t('wk.emptyBody')} actionLabel={t('wk.clear')} onAction={clear} />
      )}
      {state.status === 'ready' && state.items.map((w) => (
        <Pressable key={w.id} onPress={() => router.push(`/workouts/${w.id}`)} accessibilityRole="button" accessibilityLabel={`${w.nameEn}, ${w.durationMin} ${t('common.min')}`}>
          <Card style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Dumbbell size={18} color={colors.accent} />
              <AppText variant="eyebrow" color={colors.accent}>{w.tags[0]} / {t(`level.${w.level}` as 'level.beginner')}</AppText>
            </View>
            <AppText variant="section">{language === 'bn' ? w.nameBn : w.nameEn}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>{w.durationMin} {t('common.min')} · {w.equipmentNote}</AppText>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

// Owner: Shuvrata Banik Shuvo | F3, F4
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../theme/tokens';
import { AppText } from '../../../components/AppText';
import { Button, Card, ContentState, Screen, Skeleton, TopBar } from '../../../components/ui';
import { api } from '../../../services/api';
import { useSettings } from '../../../context/SettingsContext';
import { useWorkout } from '../../../context/WorkoutContext';
import type { Workout } from '../../../lib/types';
import { formatWeight } from '../../../lib/units';

export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, language, units } = useSettings();
  const { start, isRunning, active } = useWorkout();
  const [w, setW] = useState<Workout | null>(null);
  const [error, setError] = useState(false);
  const load = () => { setError(false); api.workouts.get(String(id)).then(setW).catch(() => setError(true)); };
  useEffect(load, [id]);

  const begin = () => {
    if (!w) return;
    if (isRunning && active) return router.push(`/workouts/session/${active.clientId}`);
    router.push(`/workouts/session/${start(w)}`);
  };
  return (
    <Screen footer={w ? <Button label={isRunning ? t('wk.resume') : t('wk.start')} onPress={begin} /> : undefined}>
      <TopBar title={t('wk.detailTitle')} subtitle={t('wk.detailSub')} onBack={() => router.back()} />
      {error && <ContentState kind="error" title={t('wk.errorTitle')} body={t('wk.errorBody')} actionLabel={t('common.tryAgain')} onAction={load} />}
      {!w && !error && <Skeleton height={200} />}
      {w && (
        <>
          <AppText variant="eyebrow" color={colors.accent}>{w.tags[0]} / {t(`level.${w.level}` as 'level.beginner')}</AppText>
          <AppText variant="screen">{language === 'bn' ? w.nameBn : w.nameEn}</AppText>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[{ v: `${w.durationMin} ${t('common.min')}`, l: t('wk.duration') }, { v: String(w.exercises.length), l: t('wk.exercises') }, { v: t(`level.${w.level}` as 'level.beginner'), l: t('wk.level') }].map((s) => (
              <View key={s.l} style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 12 }}>
                <AppText variant="label">{s.v}</AppText>
                <AppText variant="caption" color={colors.textSecondary}>{s.l}</AppText>
              </View>
            ))}
          </View>
          <AppText variant="label" color={colors.accent}>{w.equipmentNote}{w.exercises.some((e) => e.bodyweightOption) ? ` · ${t('wk.bodyweightOption')}` : ''}</AppText>
          <AppText variant="body" color={colors.textSecondary}>{w.description}</AppText>
          <AppText variant="section">{t('wk.plan')}</AppText>
          {w.exercises.map((e) => (
            <Card key={e.id} style={{ gap: 2 }}>
              <AppText variant="label" style={{ fontSize: 16, lineHeight: 24 }}>{e.position}. {e.name}</AppText>
              <AppText variant="body" color={colors.textSecondary}>{e.sets} {t('wk.sets')} × {e.reps}{e.targetKg ? ` · ${formatWeight(e.targetKg, units)}` : ''}</AppText>
              {!!e.bodyweightOption && <AppText variant="caption" color={colors.textSecondary}>{t('wk.bodyweightOpt', { x: e.bodyweightOption })}</AppText>}
              <AppText variant="caption" color={colors.textSecondary}>{t('wk.rest', { n: e.restSeconds })}</AppText>
            </Card>
          ))}
          <AppText variant="caption" color={colors.textSecondary}>{t('wk.safety')}</AppText>
        </>
      )}
    </Screen>
  );
}

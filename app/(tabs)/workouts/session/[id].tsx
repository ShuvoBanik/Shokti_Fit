// Owner: Shuvrata Banik Shuvo | F3, F4
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CircleCheck } from 'lucide-react-native';
import { colors } from '../../../../theme/tokens';
import { AppText } from '../../../../components/AppText';
import { BottomSheet, Button, Card, ContentState, Screen, TopBar } from '../../../../components/ui';
import { useSettings } from '../../../../context/SettingsContext';
import { useSnackbar } from '../../../../context/SnackbarContext';
import { useWorkout } from '../../../../context/WorkoutContext';
import { formatClock } from '../../../../lib/dates';
import { formatWeight } from '../../../../lib/units';

/** F4: active session — timer, set tracking, pause/resume, rest, stop confirmation (saves a partial session). */
export default function ActiveSession() {
  const { id } = useLocalSearchParams<{ id: string }>();
  void id;
  const router = useRouter();
  const { t, units } = useSettings();
  const snack = useSnackbar();
  const { active, tick, completeSet, pause, resume, skipRest, stop, dismiss } = useWorkout();
  const [confirmStop, setConfirmStop] = useState(false);

  useEffect(() => {
    if (!active || active.finished) return;
    const h = setInterval(tick, 1000);
    return () => clearInterval(h);
  }, [active?.clientId, active?.finished, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) {
    return (
      <Screen>
        <TopBar title={t('ses.title')} onBack={() => router.replace('/workouts')} />
        <ContentState kind="info" title={t('ses.none')} body={t('ses.noneBody')} actionLabel={t('ses.toLibrary')} onAction={() => router.replace('/workouts')} />
      </Screen>
    );
  }

  if (active.finished) {
    const done = active.finished.status === 'completed';
    const mins = active.finished.durationSeconds;
    return (
      <Screen footer={
        <>
          <Button label={t('ses.viewHistory')} onPress={() => { dismiss(); router.replace('/workouts/history'); }} />
          <Button label={t('ses.backLibrary')} variant="ghost" onPress={() => { dismiss(); router.replace('/workouts'); }} />
        </>
      }>
        <TopBar title={done ? t('ses.completeTitle') : t('ses.partialTitle')} subtitle={t('ses.saved')} />
        <ContentState kind="success" title={done ? t('ses.completeHead') : t('ses.partialHead')} body={done ? t('ses.completeBody') : t('ses.partialBody')} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[{ v: formatClock(mins), l: t('ses.duration') }, { v: String(active.sets.length), l: t('ses.setsDone') }, { v: String(new Set(active.sets.map((s) => s.exerciseId)).size), l: t('wk.exercises') }].map((s) => (
            <View key={s.l} style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 12 }}>
              <AppText variant="section">{s.v}</AppText>
              <AppText variant="caption" color={colors.textSecondary}>{s.l}</AppText>
            </View>
          ))}
        </View>
        <AppText variant="caption" color={colors.textSecondary}>{t('ses.noCalorie')}</AppText>
      </Screen>
    );
  }

  const ex = active.workout.exercises[active.exerciseIdx];
  const resting = active.restMs > 0;
  return (
    <Screen
      footer={
        <>
          {resting ? <Button label={t('ses.skipRest')} onPress={skipRest} /> : active.paused ? <Button label={t('ses.resume')} onPress={resume} /> : <Button label={t('ses.completeSet')} onPress={completeSet} />}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label={active.paused ? t('ses.paused') : t('ses.pause')} variant="secondary" disabled={active.paused} onPress={pause} style={{ flex: 1 }} />
            <Button label={t('ses.stop')} variant="ghost" onPress={() => setConfirmStop(true)} style={{ flex: 1 }} />
          </View>
        </>
      }
    >
      <TopBar title={t('ses.title')} subtitle={`${active.workout.nameEn} · ${t('ses.exerciseOf', { a: active.exerciseIdx + 1, b: active.workout.exercises.length })}`} />
      <Card style={{ alignItems: 'center', gap: 8 }}>
        <AppText variant="caption" color={colors.textSecondary}>{t('ses.illustrative')}</AppText>
        <AppText variant="screen" align="center">{resting ? t('ses.rest') : ex.name}</AppText>
        <AppText variant="display" color={colors.primary}>{formatClock(resting ? active.restMs / 1000 : active.elapsedMs / 1000)}</AppText>
        <AppText variant="eyebrow" color={colors.textSecondary} align="center">
          {active.paused ? t('ses.pausedNote') : resting ? t('ses.restRemaining', { t: formatClock(active.elapsedMs / 1000) }) : t('ses.elapsed')}
        </AppText>
      </Card>
      {resting && <AppText variant="body" color={colors.textSecondary} align="center">{t('ses.nextUp', { x: ex.name })}</AppText>}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {[{ v: `${active.setNo} / ${ex.sets}`, l: t('ses.currentSet') }, { v: ex.reps.startsWith(String(parseInt(ex.reps, 10))) && /sec/.test(ex.reps) ? ex.reps : `${ex.reps} ${t('ses.reps')}`, l: t('ses.target') }, { v: ex.targetKg ? formatWeight(ex.targetKg, units) : '—', l: t('ses.optional') }].map((s) => (
          <View key={s.l} style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 12 }}>
            <AppText variant="label" style={{ fontSize: 16, lineHeight: 24 }}>{s.v}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>{s.l}</AppText>
          </View>
        ))}
      </View>
      <AppText variant="body" color={colors.textSecondary}>{ex.cue ?? t('ses.cue')}</AppText>
      {!!ex.bodyweightOption && <AppText variant="caption" color={colors.textSecondary}>{t('wk.bodyweightOpt', { x: ex.bodyweightOption })}</AppText>}
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <CircleCheck size={16} color={colors.success} />
        <AppText variant="caption" color={colors.textSecondary}>{t('ses.setsLogged', { n: active.sets.length })}</AppText>
      </View>

      <BottomSheet visible={confirmStop} onClose={() => setConfirmStop(false)}>
        <AppText variant="section">{t('ses.stopTitle')}</AppText>
        <AppText variant="body" color={colors.textSecondary}>{t('ses.stopBody', { t: formatClock(active.elapsedMs / 1000) })}</AppText>
        <Button label={t('ses.stopSave')} onPress={() => { setConfirmStop(false); stop(); snack.show({ text: t('ses.partialSaved') }); }} />
        <Button label={t('ses.keepGoing')} variant="ghost" onPress={() => setConfirmStop(false)} />
      </BottomSheet>
    </Screen>
  );
}

// Owner: Shuvrata Banik Shuvo | F3, F4
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleCheck, Timer } from 'lucide-react-native';
import { colors } from '../../../theme/tokens';
import { AppText } from '../../../components/AppText';
import { Banner, Button, Card, ContentState, Screen, Skeleton, TopBar } from '../../../components/ui';
import { useSettings } from '../../../context/SettingsContext';
import { useWorkout } from '../../../context/WorkoutContext';
import { addDays, formatClock, formatDay, todayStr, weekStart } from '../../../lib/dates';
import type { Session } from '../../../lib/types';

export default function SessionHistory() {
  const router = useRouter();
  const { t, language } = useSettings();
  const { history, historyStatus, loadHistory } = useWorkout();
  const today = todayStr();
  const thisWeek = weekStart(today);
  const groups = new Map<string, Session[]>();
  history.forEach((s) => {
    const k = weekStart(s.startedAt.slice(0, 10));
    groups.set(k, [...(groups.get(k) ?? []), s]);
  });
  const keys = [...groups.keys()].sort().reverse();
  const cur = groups.get(thisWeek) ?? [];
  const completed = cur.filter((s) => s.status === 'completed').length;
  const minutes = Math.round(cur.reduce((n, s) => n + (s.durationSeconds ?? 0), 0) / 60);
  const label = (k: string) =>
    k === thisWeek ? t('hist.thisWeek') : k === addDays(thisWeek, -7) ? t('hist.lastWeek') : t('hist.weekOf');
  const range = (k: string) => `${formatDay(k, language)} – ${formatDay(addDays(k, 6), language)}`;
  const hasPartial = history.some((s) => s.status === 'partial');

  return (
    <Screen>
      <TopBar title={t('hist.title')} subtitle={t('hist.subtitle')} onBack={() => router.back()} />
      {historyStatus === 'error' && <Banner kind="warning" text={t('banner.stale')} actionLabel={t('common.retry')} onAction={() => void loadHistory()} />}
      {historyStatus === 'loading' && history.length === 0 && <Skeleton height={120} />}
      {historyStatus !== 'loading' && history.length === 0 && (
        <ContentState kind="empty" title={t('hist.emptyTitle')} body={t('hist.emptyBody')} actionLabel={t('hist.browse')} onAction={() => router.replace('/workouts')} />
      )}
      {history.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[{ v: String(completed), l: t('hist.completedWeek') }, { v: `${minutes} ${t('common.min')}`, l: t('hist.timeMoving') }].map((s) => (
            <View key={s.l} style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16 }}>
              <AppText variant="screen">{s.v}</AppText>
              <AppText variant="caption" color={colors.textSecondary}>{s.l}</AppText>
            </View>
          ))}
        </View>
      )}
      {keys.map((k) => (
        <View key={k} style={{ gap: 10 }}>
          <AppText variant="eyebrow" color={colors.accent}>{label(k)} / {range(k)}</AppText>
          {groups.get(k)!.map((s) => (
            <Card key={s.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              {s.status === 'completed' ? <CircleCheck size={22} color={colors.success} /> : <Timer size={22} color={colors.warning} />}
              <View style={{ flex: 1 }}>
                <AppText variant="label" style={{ fontSize: 16, lineHeight: 24 }}>{s.workoutName}</AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {formatDay(s.startedAt.slice(0, 10), language)} · {s.status === 'completed' ? `${Math.round((s.durationSeconds ?? 0) / 60)} ${t('common.min')}` : formatClock(s.durationSeconds ?? 0)} · {s.sets.length} {t('wk.setsShort')} · {t(s.status === 'completed' ? 'hist.completed' : 'hist.partial')}
                </AppText>
              </View>
            </Card>
          ))}
        </View>
      ))}
      {hasPartial && <AppText variant="caption" color={colors.textSecondary}>{t('hist.partialNote')}</AppText>}
      <Button label={t('hist.start')} variant="secondary" onPress={() => router.replace('/workouts')} />
    </Screen>
  );
}

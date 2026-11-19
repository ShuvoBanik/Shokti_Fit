// Owner: Rafsan Zaman Abir | F7
import React, { useMemo, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Plus } from 'lucide-react-native';
import { colors } from '../../../theme/tokens';
import { AppText } from '../../../components/AppText';
import { CalorieBars, WeightChart } from '../../../components/charts';
import { Banner, Button, Card, ContentState, Screen, Segmented, TopBar } from '../../../components/ui';
import { useMeals } from '../../../context/MealsContext';
import { useProfile } from '../../../context/ProfileContext';
import { useSettings } from '../../../context/SettingsContext';
import { useTracking } from '../../../context/TrackingContext';
import { addDays, formatDay, todayStr, weekStart, WEEKDAY_INITIALS } from '../../../lib/dates';
import { formatWater, formatWeight, weightUnit, weightValue } from '../../../lib/units';

type Range = '7' | '30' | '90';

/** F7: progress hub — range selector, weight trend, weekly calorie chart, links to weight and water. */
export default function Progress() {
  const router = useRouter();
  const { t, language, units, waterGoalMl } = useSettings();
  const { targets } = useProfile();
  const { weights, weightStatus, loadWeights, water } = useTracking();
  const meals = useMeals();
  const { width } = useWindowDimensions();
  const [range, setRange] = useState<Range>('30');
  const today = todayStr();
  const from = addDays(today, -Number(range) + 1);
  const shown = useMemo(() => weights.filter((w) => w.entryDate >= from), [weights, from]);
  const latest = weights[weights.length - 1];
  const previous = weights[weights.length - 2];
  const starting = shown[0];
  const ws = weekStart(today);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(ws, i);
    const kcal = meals.totalsFor(date).kcal;
    return { label: WEEKDAY_INITIALS[language][i], value: kcal > 0 ? kcal : null, highlight: date === today };
  });
  const chartW = width - 40 - 40;

  return (
    <Screen>
      <TopBar title={t('prog.title')} subtitle={t('prog.subtitle')} onBack={() => router.back()} />
      <Segmented<Range> options={[{ value: '7', label: t('prog.7d') }, { value: '30', label: t('prog.30d') }, { value: '90', label: t('prog.3m') }]} value={range} onChange={setRange} />
      {weightStatus === 'error' && <Banner kind="warning" text={t('banner.stale')} actionLabel={t('common.retry')} onAction={() => void loadWeights()} />}
      {weights.length === 0 ? (
        <ContentState kind="empty" title={t('prog.emptyTitle')} body={t('prog.emptyBody')} actionLabel={t('prog.addWeight')} onAction={() => router.push('/home/weight-entry')} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16 }}>
              <AppText variant="screen" color={colors.primary}>{formatWeight(latest.weightKg, units)}</AppText>
              <AppText variant="caption" color={colors.textSecondary}>{t('prog.current', { d: formatDay(latest.entryDate, language) })}</AppText>
            </View>
            {starting && (
              <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16 }}>
                <AppText variant="screen">{formatWeight(starting.weightKg, units)}</AppText>
                <AppText variant="caption" color={colors.textSecondary}>{t('prog.starting', { d: formatDay(starting.entryDate, language) })}</AppText>
              </View>
            )}
          </View>
          <AppText variant="body" color={colors.textSecondary}>{t('prog.fluctuate')}</AppText>
          <Card>
            <AppText variant="section">{t('prog.trend')}</AppText>
            {shown.length === 0 ? (
              <AppText variant="body" color={colors.textSecondary}>{t('prog.noneInRange')}</AppText>
            ) : (
              <WeightChart width={chartW} unit={weightUnit(units)} points={shown.map((w) => ({ label: formatDay(w.entryDate, language), value: weightValue(w.weightKg, units) }))} />
            )}
            <AppText variant="caption" color={colors.textSecondary}>
              {previous ? t('prog.latestPrev', { a: formatWeight(latest.weightKg, units), b: formatWeight(previous.weightKg, units) }) : t('prog.latestOnly', { a: formatWeight(latest.weightKg, units) })}
            </AppText>
          </Card>
        </>
      )}
      <Button label={t('prog.addWeight')} icon={<Plus size={20} color={colors.onPrimary} />} onPress={() => router.push('/home/weight-entry')} />

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="section">{t('prog.weeklyCal')}</AppText>
          <AppText variant="caption" color={colors.textSecondary}>{t('prog.thisWeek')}</AppText>
        </View>
        <CalorieBars width={chartW} days={days} target={targets?.kcal ?? 2000} unit="kcal" />
        <AppText variant="caption" color={colors.textSecondary}>{formatDay(ws, language)}–{formatDay(addDays(ws, 6), language)} · kcal · {t('prog.dashedTarget')}</AppText>
      </Card>

      {[
        { title: t('prog.history'), sub: t('prog.historySub'), to: '/home/weight-history' },
        { title: t('water.title'), sub: `${formatWater(water.amountMl, units)} / ${formatWater(waterGoalMl, units)} · ${t('prog.openWater')}`, to: '/home/water' },
      ].map((r) => (
        <Pressable key={r.to} onPress={() => router.push(r.to)} accessibilityRole="button">
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}><AppText variant="section">{r.title}</AppText><AppText variant="caption" color={colors.textSecondary}>{r.sub}</AppText></View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

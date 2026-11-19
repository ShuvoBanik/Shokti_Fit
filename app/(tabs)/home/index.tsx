// Owner: Shared (led by Mahbub Hasnain) | dashboard (shared)
import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowUpRight, Plus, Dumbbell } from 'lucide-react-native';
import { colors } from '../../../theme/tokens';
import { AppText } from '../../../components/AppText';
import { ProgressRing } from '../../../components/charts';
import { Banner, Button, Card, ContentState, PendingDot, ProgressBar, Screen, SectionHeader, Skeleton } from '../../../components/ui';
import { useProfile } from '../../../context/ProfileContext';
import { useSettings } from '../../../context/SettingsContext';
import { useMeals } from '../../../context/MealsContext';
import { useTracking } from '../../../context/TrackingContext';
import { useWorkout } from '../../../context/WorkoutContext';
import { useDashboard } from '../../../features/dashboard/useDashboard';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { formatWeekdayDate } from '../../../lib/dates';
import { fmtNum, formatWater, formatWaterShort, formatWeight } from '../../../lib/units';
import { WORKOUTS } from '../../../services/mock/seed';
import { outbox } from '../../../services/outbox';

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export default function Home() {
  const router = useRouter();
  const { t, language, units, waterGoalMl } = useSettings();
  const { profile, targets } = useProfile();
  const meals = useMeals();
  const tracking = useTracking();
  const workout = useWorkout();
  const d = useDashboard();
  const { online } = useNetworkStatus();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await outbox.flush(true);
    await Promise.all([meals.load(), tracking.loadWeights(), tracking.loadWater(), workout.loadHistory()]);
    setRefreshing(false);
  }, [meals, tracking, workout]);

  if (!profile || !targets) return null;
  const hour = new Date().getHours();
  const bnGreet = hour < 12 ? 'শুভ সকাল' : hour < 17 ? 'শুভ অপরাহ্ন' : 'শুভ সন্ধ্যা';
  const kcal = Math.round(d.totals.kcal);
  const left = targets.kcal - kcal;
  const suggested = WORKOUTS.filter((w) => w.level === 'beginner')[new Date().getDate() % 3];
  const loading = meals.status === 'loading' && d.todayMeals.length === 0;
  const waterMl = tracking.water.amountMl;
  const lastMeals = MEAL_ORDER.flatMap((m) => d.todayMeals.filter((x) => x.mealType === m));

  return (
    <Screen tabs onRefresh={refresh} refreshing={refreshing}>
      <View style={{ paddingTop: 12, gap: 2 }}>
        <AppText variant="screen">{language === 'en' ? `${hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'}, ${profile.displayName}` : `${bnGreet}, ${profile.displayName}`}</AppText>
        <AppText variant="body" color={colors.textSecondary}>{formatWeekdayDate(d.today, language)}</AppText>
      </View>

      {!online && <Banner kind="offline" text={t('banner.offline')} actionLabel={t('common.retry')} onAction={() => void refresh()} />}
      {meals.status === 'error' && online && <Banner kind="warning" text={t('banner.stale')} actionLabel={t('common.retry')} onAction={() => void refresh()} />}

      {loading ? (
        <>
          <Skeleton height={220} />
          <Skeleton height={100} />
        </>
      ) : d.todayMeals.length === 0 ? (
        <ContentState kind="empty" title={t('home.emptyTitle')} body={t('home.emptyBody')} actionLabel={t('home.logMeal')} onAction={() => router.push('/food')} />
      ) : (
        <Card style={{ alignItems: 'center', gap: 16 }}>
          <ProgressRing value={kcal} total={targets.kcal} main={fmtNum(kcal)} sub={left >= 0 ? t('home.left', { n: fmtNum(left), t: fmtNum(targets.kcal) }) : t('home.over', { n: fmtNum(-left), t: fmtNum(targets.kcal) })} />
          <View style={{ alignSelf: 'stretch', gap: 12 }}>
            <ProgressBar label={t('macro.protein')} value={d.totals.proteinG} max={targets.proteinG} />
            <ProgressBar label={t('macro.carbs')} value={d.totals.carbG} max={targets.carbG} />
            <ProgressBar label={t('macro.fat')} value={d.totals.fatG} max={targets.fatG} />
          </View>
          <AppText variant="caption" color={colors.textSecondary}>{t('home.estimated')}</AppText>
        </Card>
      )}
      <Button label={t('home.logMeal')} icon={<Plus size={20} color={colors.onPrimary} />} onPress={() => router.push('/food')} />

      <SectionHeader title={t('home.todayWorkout')} actionLabel={t('home.explore')} onAction={() => router.push('/workouts')} />
      <Pressable onPress={() => router.push(`/workouts/${suggested.id}`)} accessibilityRole="button" accessibilityLabel={suggested.nameEn}>
        <Card style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Dumbbell size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="eyebrow" color={colors.accent}>{suggested.tags[0]} / {t(`level.${suggested.level}` as 'level.beginner')}</AppText>
            <AppText variant="section">{language === 'bn' ? suggested.nameBn : suggested.nameEn}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>{suggested.durationMin} {t('common.min')} · {suggested.equipmentNote}</AppText>
          </View>
          <ArrowUpRight size={22} color={colors.primary} />
        </Card>
      </Pressable>

      {lastMeals.length > 0 && (
        <>
          <SectionHeader title={t('home.todayMeals')} actionLabel={t('home.viewLog')} onAction={() => router.push('/food/meal-log')} />
          <Card style={{ gap: 10 }}>
            {lastMeals.slice(0, 4).map((m) => (
              <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {m.pending && <PendingDot label={t('common.pending')} />}
                <View style={{ flex: 1 }}>
                  <AppText variant="label">{language === 'bn' && m.foodNameBn ? m.foodNameBn : m.foodNameEn}</AppText>
                  <AppText variant="caption" color={colors.textSecondary}>{t(`meal.${m.mealType}` as 'meal.lunch')} · {m.grams} g</AppText>
                </View>
                <AppText variant="label">{Math.round(m.kcal)} kcal</AppText>
              </View>
            ))}
          </Card>
        </>
      )}

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <AppText variant="section">{t('water.title')}</AppText>
          {tracking.waterPending && <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><PendingDot label={t('common.pending')} /><AppText variant="caption" color={colors.warning}>{t('common.pending')}</AppText></View>}
        </View>
        <ProgressBar label={formatWater(waterMl, units)} value={waterMl} max={waterGoalMl} unit="ml" caption={t('water.toGoal', { a: formatWaterShort(waterMl, units), b: formatWaterShort(waterGoalMl, units), n: formatWater(Math.max(0, waterGoalMl - waterMl), units) })} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button label={t('water.add250')} variant="secondary" onPress={() => tracking.addWater(250)} style={{ flex: 1 }} />
          <Button label={t('home.openWater')} variant="ghost" onPress={() => router.push('/home/water')} style={{ flex: 1 }} />
        </View>
      </Card>

      <Pressable onPress={() => router.push('/home/progress')} accessibilityRole="button">
        <Card style={{ gap: 4 }}>
          <AppText variant="section">{t('home.weekly')}</AppText>
          <AppText variant="body" color={colors.textSecondary}>
            {t('home.sessions', { n: d.sessionsThisWeek })}{d.latestWeight ? ` · ${t('home.latestWeight', { w: formatWeight(d.latestWeight.weightKg, units) })}` : ''}
          </AppText>
          <AppText variant="label" color={colors.primary}>{t('home.viewProgress')} →</AppText>
        </Card>
      </Pressable>

      {d.lowIntake && <Banner kind="info" text={t('home.lowIntake')} />}
    </Screen>
  );
}

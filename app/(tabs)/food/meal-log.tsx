// Owner: Swarna Sikder | F5, F6
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, MIN_TOUCH } from '../../../theme/tokens';
import { AppText } from '../../../components/AppText';
import { Banner, BottomSheet, Button, Card, ConfirmSheet, ContentState, PendingDot, Screen, Stepper, TopBar } from '../../../components/ui';
import { api } from '../../../services/api';
import { useMeals } from '../../../context/MealsContext';
import { useProfile } from '../../../context/ProfileContext';
import { useSettings } from '../../../context/SettingsContext';
import { addDays, formatWeekdayDate, todayStr } from '../../../lib/dates';
import { fmtNum } from '../../../lib/units';
import type { Food, Meal } from '../../../lib/types';

const TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

/** F6: day view grouped by meal type, totals at top, delete with confirm + undo, edit portion. */
export default function MealLog() {
  const router = useRouter();
  const { t, language } = useSettings();
  const { targets } = useProfile();
  const { mealsFor, totalsFor, removeMeal, replaceMeal, status, load } = useMeals();
  const [date, setDate] = useState(todayStr());
  const [toDelete, setToDelete] = useState<Meal | null>(null);
  const [toEdit, setToEdit] = useState<{ meal: Meal; food: Food; grams: number } | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const meals = mealsFor(date);
  const totals = totalsFor(date);
  const target = targets?.kcal ?? 0;
  const isToday = date === todayStr();
  useEffect(() => { void load(); }, [load]);

  const name = (m: Meal) => (language === 'bn' && m.foodNameBn ? m.foodNameBn : m.foodNameEn);
  const openEdit = async (m: Meal) => {
    try { setToEdit({ meal: m, food: await api.foods.get(m.foodId), grams: m.grams }); } catch { /* offline: editing needs the food record */ }
  };
  return (
    <Screen tabs>
      <TopBar title={t('log.title')} onBack={() => router.back()} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => setDate(addDays(date, -1))} accessibilityRole="button" accessibilityLabel={t('log.prevDay')} style={{ width: MIN_TOUCH, height: MIN_TOUCH, justifyContent: 'center' }}><ChevronLeft size={24} color={colors.text} /></Pressable>
        <AppText variant="label" style={{ fontSize: 16, lineHeight: 24 }}>{formatWeekdayDate(date, language)}</AppText>
        <Pressable disabled={isToday} onPress={() => setDate(addDays(date, 1))} accessibilityRole="button" accessibilityLabel={t('log.nextDay')} style={{ width: MIN_TOUCH, height: MIN_TOUCH, justifyContent: 'center', alignItems: 'flex-end', opacity: isToday ? 0.3 : 1 }}><ChevronRight size={24} color={colors.text} /></Pressable>
      </View>
      {status === 'error' && <Banner kind="warning" text={t('banner.stale')} actionLabel={t('common.retry')} onAction={() => void load()} />}
      <Card style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}><AppText variant="screen" color={colors.primary}>{fmtNum(Math.round(totals.kcal))}</AppText><AppText variant="caption" color={colors.textSecondary}>{t('log.logged')}</AppText></View>
        <View style={{ flex: 1 }}><AppText variant="screen">{fmtNum(Math.max(0, target - Math.round(totals.kcal)))}</AppText><AppText variant="caption" color={colors.textSecondary}>{t('log.remaining')}</AppText></View>
      </Card>
      {meals.length === 0 ? (
        <ContentState kind="empty" title={t('home.emptyTitle')} body={t('home.emptyBody')} actionLabel={t('log.addFood')} onAction={() => router.push('/food')} />
      ) : (
        TYPES.map((type) => {
          const list = meals.filter((m) => m.mealType === type);
          if (!list.length) return null;
          return (
            <View key={type} style={{ gap: 8 }}>
              <AppText variant="eyebrow" color={colors.accent}>{t(`meal.${type}` as 'meal.lunch')}</AppText>
              {list.map((m) => (
                <Card key={m.id} style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {m.pending && <PendingDot label={t('common.pending')} />}
                    <View style={{ flex: 1 }}>
                      <AppText variant="label" style={{ fontSize: 16, lineHeight: 24 }}>{name(m)}</AppText>
                      <AppText variant="caption" color={colors.textSecondary}>{m.grams} g · {m.kcal} kcal{m.pending ? ` · ${t('common.pending')}` : ''}</AppText>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <Pressable onPress={() => void openEdit(m)} accessibilityRole="button" accessibilityLabel={`${t('log.edit')} ${name(m)}`} style={{ minHeight: MIN_TOUCH, justifyContent: 'center' }}><AppText variant="label" color={colors.primary}>{t('log.edit')}</AppText></Pressable>
                    <Pressable onPress={() => setToDelete(m)} accessibilityRole="button" accessibilityLabel={`${t('log.remove')} ${name(m)}`} style={{ minHeight: MIN_TOUCH, justifyContent: 'center' }}><AppText variant="label" color={colors.error}>{t('log.remove')}</AppText></Pressable>
                  </View>
                </Card>
              ))}
            </View>
          );
        })
      )}
      {meals.length > 0 && <AppText variant="caption" color={colors.textSecondary}>{t('log.illustrative')}</AppText>}
      <Button label={`+ ${t('log.addFood')}`} variant="secondary" onPress={() => router.push('/food')} />

      <ConfirmSheet
        visible={!!toDelete}
        title={toDelete ? t('log.removeTitle', { n: name(toDelete) }) : ''}
        body={toDelete ? t('log.removeBody', { g: toDelete.grams, n: name(toDelete), m: t(`meal.${toDelete.mealType}` as 'meal.lunch'), k: fmtNum(Math.round(totals.kcal - toDelete.kcal)) }) : ''}
        confirmLabel={toDelete ? t('log.removeConfirm', { n: name(toDelete) }) : ''}
        cancelLabel={t('log.keep')}
        danger
        onCancel={() => setToDelete(null)}
        onConfirm={() => { if (toDelete) removeMeal(toDelete); setToDelete(null); }}
      />
      <BottomSheet visible={!!toEdit} onClose={() => setToEdit(null)}>
        {toEdit && (
          <>
            <AppText variant="section">{t('log.editTitle', { n: name(toEdit.meal) })}</AppText>
            <Stepper label={t('food.portion')} display={String(toEdit.grams)} unit="g" hint={t('food.increments', { n: 50 })}
              decDisabled={toEdit.grams <= 50} incDisabled={toEdit.grams >= 1000}
              onDec={() => setToEdit({ ...toEdit, grams: Math.max(50, toEdit.grams - 50) })} onInc={() => setToEdit({ ...toEdit, grams: Math.min(1000, toEdit.grams + 50) })} />
            <Button label={t('common.save')} loading={editBusy} onPress={async () => { setEditBusy(true); try { await replaceMeal(toEdit.meal, toEdit.food, toEdit.grams); } finally { setEditBusy(false); setToEdit(null); } }} />
            <Button label={t('common.cancel')} variant="ghost" onPress={() => setToEdit(null)} />
          </>
        )}
      </BottomSheet>
    </Screen>
  );
}

// Owner: Swarna Sikder | F5, F6
import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../theme/tokens';
import { AppText } from '../../../components/AppText';
import { Button, Card, Chip, ContentState, Screen, Segmented, Skeleton, Stepper, TopBar } from '../../../components/ui';
import { api } from '../../../services/api';
import { useMeals } from '../../../context/MealsContext';
import { useSettings } from '../../../context/SettingsContext';
import { useSnackbar } from '../../../context/SnackbarContext';
import { nutritionFor } from '../../../lib/nutrition';
import type { Food, MealType } from '../../../lib/types';

const TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const defaultType = (): MealType => { const h = new Date().getHours(); return h < 11 ? 'breakfast' : h < 16 ? 'lunch' : h < 18 ? 'snack' : 'dinner'; };

/** F6: portion in grams or servings, live nutrition, meal type, add to meal. */
export default function FoodDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, language } = useSettings();
  const { addMeal } = useMeals();
  const snack = useSnackbar();
  const [food, setFood] = useState<Food | null>(null);
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<'g' | 'srv'>('g');
  const [grams, setGrams] = useState(100);
  const [type, setType] = useState<MealType>(defaultType());
  const [busy, setBusy] = useState(false);
  const load = () => { setError(false); api.foods.get(String(id)).then(setFood).catch(() => setError(true)); };
  useEffect(load, [id]);

  const n = useMemo(() => (food ? nutritionFor(food, grams) : null), [food, grams]);
  const step = mode === 'g' ? 50 : (food?.servingG ?? 100) / 2;
  const min = mode === 'g' ? 50 : step;
  const max = mode === 'g' ? 1000 : 1000;
  const display = mode === 'g' ? String(grams) : String(Math.round((grams / (food?.servingG ?? 100)) * 10) / 10);

  const add = async () => {
    if (!food || busy) return;
    setBusy(true);
    await addMeal(food, grams, type);
    snack.show({ text: t('snack.mealAdded', { m: t(`meal.${type}` as 'meal.lunch') }) });
    router.replace('/food/meal-log');
  };
  return (
    <Screen footer={food && n ? <Button label={t('food.addTo', { m: t(`meal.${type}` as 'meal.lunch'), k: Math.round(n.kcal) })} onPress={() => void add()} loading={busy} /> : undefined}>
      <TopBar title={t('food.detailTitle')} onBack={() => router.back()} />
      {error && <ContentState kind="error" title={t('food.errorTitle')} body={t('food.errorBody')} actionLabel={t('common.tryAgain')} onAction={load} />}
      {!food && !error && <Skeleton height={220} />}
      {food && n && (
        <>
          <View>
            <AppText variant="screen">{language === 'bn' && food.nameBn ? food.nameBn : food.nameEn}</AppText>
            <AppText variant="label" color={colors.accent}>{food.kcal100} kcal / 100 g</AppText>
          </View>
          <Card>
            <AppText variant="eyebrow" color={colors.accent}>{t('food.portion')}</AppText>
            <Segmented options={[{ value: 'g', label: t('food.grams') }, { value: 'srv', label: t('food.servings') }]} value={mode} onChange={setMode} />
            <Stepper
              label={t('food.portion')} display={display} unit={mode === 'g' ? 'g' : t('food.servingUnit', { s: food.servingLabel })}
              hint={mode === 'g' ? t('food.increments', { n: 50 }) : t('food.incrementsSrv')}
              decDisabled={grams - step < min - 0.01} incDisabled={grams + step > max + 0.01}
              onDec={() => setGrams((g) => Math.max(min, Math.round((g - step) * 10) / 10))}
              onInc={() => setGrams((g) => Math.min(max, Math.round((g + step) * 10) / 10))}
            />
            <AppText variant="caption" color={colors.textSecondary} align="center">{t('food.gramsTotal', { g: grams })}</AppText>
          </Card>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[{ v: n.proteinG, l: t('macro.protein') }, { v: n.carbG, l: t('macro.carbs') }, { v: n.fatG, l: t('macro.fat') }].map((m) => (
              <View key={m.l} style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 12 }} accessible accessibilityLabel={`${m.l} ${m.v} g`}>
                <AppText variant="label" style={{ fontSize: 16, lineHeight: 24 }}>{m.v.toFixed(2)} g</AppText>
                <AppText variant="caption" color={colors.textSecondary}>{m.l}</AppText>
              </View>
            ))}
          </View>
          <AppText variant="section">{Math.round(n.kcal)} kcal</AppText>
          <View style={{ gap: 8 }}>
            <AppText variant="label" color={colors.textSecondary}>{t('food.mealType')}</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {TYPES.map((m) => <Chip key={m} label={t(`mealc.${m}` as 'mealc.lunch')} selected={type === m} onPress={() => setType(m)} />)}
            </View>
          </View>
          <Card style={{ gap: 4 }}>
            <AppText variant="label">{t('food.source')}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>{food.source}</AppText>
            {!!food.sourceUrl && (
              <Pressable onPress={() => void Linking.openURL(food.sourceUrl!)} accessibilityRole="link" style={{ minHeight: 48, justifyContent: 'center' }}>
                <AppText variant="caption" color={colors.primary}>{food.sourceUrl}</AppText>
              </Pressable>
            )}
            {!!food.note && <AppText variant="caption" color={colors.textSecondary}>{food.note}</AppText>}
            <AppText variant="caption" color={colors.textSecondary}>{t('food.disclaimer')}</AppText>
          </Card>
        </>
      )}
    </Screen>
  );
}

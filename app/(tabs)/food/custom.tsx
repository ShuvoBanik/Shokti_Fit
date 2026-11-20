// Owner: Swarna Sikder | F5, F6
import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { colors } from '../../../theme/tokens';
import { AppText } from '../../../components/AppText';
import { Banner, Button, Input, Screen, TopBar } from '../../../components/ui';
import { api } from '../../../services/api';
import { useSettings } from '../../../context/SettingsContext';
import { useSnackbar } from '../../../context/SnackbarContext';
import { CustomFoodValues, validateCustomFood } from '../../../lib/validation';
import { parseNumber } from '../../../lib/units';

const EMPTY: CustomFoodValues = { name: '', serving: '', kcal: '', protein: '', carb: '', fat: '', source: '' };

/** FR-12: custom food from a label or verified source. Nutrition is entered per one serving. */
export default function CustomFood() {
  const router = useRouter();
  const { t } = useSettings();
  const snack = useSnackbar();
  const [v, setV] = useState(EMPTY);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const errors = useMemo(() => validateCustomFood(v), [v]);
  const valid = Object.keys(errors).length === 0;
  const set = (k: keyof CustomFoodValues) => (x: string) => setV((p) => ({ ...p, [k]: x }));
  const err = (k: keyof CustomFoodValues) => {
    const e = errors[k];
    if (!e || !(touched[k] || v[k].trim() !== '')) return undefined;
    return e === 'required' ? t('form.required') : e === 'positive' ? t('cf.positive') : t('cf.nonNegative');
  };
  const field = (k: keyof CustomFoodValues, label: string, extra: object = {}) => (
    <Input label={label} value={v[k]} onChangeText={set(k)} onBlur={() => setTouched((x) => ({ ...x, [k]: true }))} error={err(k)} {...extra} />
  );
  const save = async () => {
    if (!valid) return;
    setSaving(true);
    setFailed(false);
    const serving = parseNumber(v.serving);
    const per100 = (x: string) => Math.round(((parseNumber(x) * 100) / serving) * 100) / 100;
    try {
      await api.foods.createCustom({
        nameEn: v.name.trim(), servingLabel: `1 serving (${serving} g)`, servingG: serving,
        kcal100: per100(v.kcal), protein100: per100(v.protein), carb100: per100(v.carb), fat100: per100(v.fat), source: v.source.trim(),
      });
      snack.show({ text: t('cf.saved') });
      router.back();
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Screen>
      <TopBar title={t('cf.title')} subtitle={t('cf.subtitle')} onBack={() => router.back()} />
      <AppText variant="eyebrow" color={colors.accent}>{t('cf.eyebrow')}</AppText>
      <AppText variant="body" color={colors.textSecondary}>{t('cf.copy')}</AppText>
      {field('name', t('cf.name'), { placeholder: t('cf.namePh') })}
      {field('serving', t('cf.serving'), { keyboardType: 'decimal-pad', suffix: 'g' })}
      {field('kcal', t('cf.energy'), { keyboardType: 'decimal-pad', suffix: 'kcal' })}
      {field('protein', t('macro.protein'), { keyboardType: 'decimal-pad', suffix: 'g' })}
      {field('carb', t('cf.carb'), { keyboardType: 'decimal-pad', suffix: 'g' })}
      {field('fat', t('macro.fat'), { keyboardType: 'decimal-pad', suffix: 'g' })}
      {field('source', t('cf.source'), { placeholder: t('cf.sourcePh') })}
      {failed && <Banner kind="error" text={t('err.network')} actionLabel={t('common.tryAgain')} onAction={() => void save()} />}
      <Button label={t('cf.save')} onPress={() => void save()} disabled={!valid} loading={saving} />
      <AppText variant="caption" color={colors.textSecondary}>{valid ? t('cf.rules') : t('cf.notReady')}</AppText>
    </Screen>
  );
}

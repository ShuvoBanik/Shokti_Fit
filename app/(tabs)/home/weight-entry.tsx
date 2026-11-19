// Owner: Rafsan Zaman Abir | F7
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, MIN_TOUCH } from '../../../theme/tokens';
import { AppText } from '../../../components/AppText';
import { Banner, Button, Card, Screen, TopBar } from '../../../components/ui';
import { useProfile } from '../../../context/ProfileContext';
import { useSettings } from '../../../context/SettingsContext';
import { useSnackbar } from '../../../context/SnackbarContext';
import { useTracking } from '../../../context/TrackingContext';
import { addDays, formatDay, formatLong, todayStr, parseDate } from '../../../lib/dates';
import { formatWeight, parseNumber, round1, weightToKg, weightUnit, weightValue } from '../../../lib/units';
import { isValidWeightKg, LIMITS } from '../../../lib/validation';
import { Minus, Plus } from 'lucide-react-native';
import { ApiError } from '../../../services/api/errors';

/** F7: record one weight per day (same-day post updates). Range 30–200 kg, 0.1 kg steps. */
export default function WeightEntry() {
  const params = useLocalSearchParams<{ date?: string }>();
  const router = useRouter();
  const { t, units, language } = useSettings();
  const { profile } = useProfile();
  const { weights, saveWeight } = useTracking();
  const snack = useSnackbar();
  const today = todayStr();
  const [date, setDate] = useState(params.date ?? today);
  const existing = weights.find((w) => w.entryDate === date);
  const lastBefore = [...weights].reverse().find((w) => w.entryDate < date) ?? weights[weights.length - 1];
  const start = existing?.weightKg ?? lastBefore?.weightKg ?? profile?.weightKg ?? 70;
  const [text, setText] = useState(String(weightValue(start, units)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setText(String(weightValue(existing?.weightKg ?? lastBefore?.weightKg ?? profile?.weightKg ?? 70, units))); /* eslint-disable-next-line */ }, [date]);

  const num = parseNumber(text);
  const kg = Number.isFinite(num) ? round1(weightToKg(num, units)) : NaN;
  const valid = isValidWeightKg(kg);
  const stepKg = (d: number) => { const base = Number.isFinite(kg) ? kg : start; setText(String(weightValue(Math.round((base + d) * 10) / 10, units))); };
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)), [today]);

  const save = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      await saveWeight(date, kg);
      snack.show({ text: t('weight.saved', { w: formatWeight(kg, units), d: formatDay(date, language, false) }) });
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('err.generic'));
    } finally {
      setBusy(false);
    }
  };
  const prev = lastBefore && lastBefore.entryDate !== date ? lastBefore : undefined;
  return (
    <Screen footer={<Button label={t('weight.save')} onPress={() => void save()} disabled={!valid} loading={busy} />}>
      <TopBar title={t('weight.title')} subtitle={t('weight.subtitle')} onBack={() => router.back()} />
      <Card style={{ alignItems: 'center' }}>
        <AppText variant="eyebrow" color={colors.accent}>{date === today ? t('weight.todayCheck') : formatLong(date, language)}</AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Pressable onPress={() => stepKg(-0.1)} accessibilityRole="button" accessibilityLabel={t('common.decrease')} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}><Minus size={22} color={colors.text} /></Pressable>
          <View style={{ alignItems: 'center', minWidth: 130 }}>
            <TextInput value={text} onChangeText={setText} keyboardType="decimal-pad" accessibilityLabel={t('weight.title')} selectTextOnFocus
              style={{ color: valid ? colors.text : colors.error, fontSize: 44, lineHeight: 52, fontFamily: 'Manrope_800ExtraBold', textAlign: 'center', minWidth: 130 }} />
            <AppText variant="label" color={colors.textSecondary}>{weightUnit(units)}</AppText>
          </View>
          <Pressable onPress={() => stepKg(0.1)} accessibilityRole="button" accessibilityLabel={t('common.increase')} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}><Plus size={22} color={colors.text} /></Pressable>
        </View>
        <AppText variant="caption" color={colors.textSecondary}>{units === 'metric' ? t('weight.step', { s: '0.1 kg' }) : t('weight.step', { s: '≈0.2 lb' })}</AppText>
      </Card>
      {!valid && (
        <Banner kind="error" text={t('weight.range', { min: weightValue(LIMITS.weightKg.min, units), max: weightValue(LIMITS.weightKg.max, units), u: weightUnit(units) })} />
      )}
      {!!error && <Banner kind="error" text={error} />}
      {prev && <AppText variant="body" color={colors.textSecondary}>{t('weight.previous', { w: formatWeight(prev.weightKg, units), d: formatDay(prev.entryDate, language) })}</AppText>}
      {existing && <AppText variant="caption" color={colors.warning}>{t('weight.updating')}</AppText>}
      <View style={{ gap: 8 }}>
        <AppText variant="label" color={colors.textSecondary}>{t('weight.date')}</AppText>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {days.map((d) => {
            const sel = d === date;
            return (
              <Pressable key={d} onPress={() => setDate(d)} accessibilityRole="button" accessibilityState={{ selected: sel }} accessibilityLabel={formatLong(d, language)} style={{ flex: 1, minHeight: MIN_TOUCH + 8, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? colors.primary : colors.card, borderWidth: 1, borderColor: sel ? colors.primary : colors.border }}>
                <AppText variant="caption" color={sel ? colors.onPrimary : colors.textSecondary}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][parseDate(d).getDay()]}</AppText>
                <AppText variant="label" color={sel ? colors.onPrimary : colors.text}>{parseDate(d).getDate()}</AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
      <AppText variant="caption" color={colors.textSecondary}>{t('weight.note')}</AppText>
    </Screen>
  );
}

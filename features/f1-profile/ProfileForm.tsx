// Owner: Mahbub Hasnain | F1
/** F1/F2 (Mahbub): shared profile form with inline validation, used by onboarding and Edit profile. */
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { colors, MIN_TOUCH, radius } from '../../theme/tokens';
import { AppText } from '../../components/AppText';
import { BottomSheet, Banner, Button, Chip, Input } from '../../components/ui';
import { useSettings } from '../../context/SettingsContext';
import type { Activity, Gender, Goal, Profile, SexForCalc } from '../../lib/types';
import { heightUnit, heightValue, weightToKg, heightToCm, weightUnit, weightValue, parseNumber, round1, fmtNum } from '../../lib/units';
import { LIMITS, validateProfileForm } from '../../lib/validation';
import { ApiError } from '../../services/api/errors';

interface Props {
  initial?: Profile | null;
  submitLabel: string;
  onSubmit: (p: Profile) => Promise<void>;
  footerNote?: string;
}
type FieldKey = 'name' | 'age' | 'height' | 'weight';

export function ProfileForm({ initial, submitLabel, onSubmit, footerNote }: Props) {
  const { t, units } = useSettings();
  const [name, setName] = useState(initial?.displayName ?? '');
  const [age, setAge] = useState(initial ? String(initial.age) : '');
  const [height, setHeight] = useState(initial ? String(heightValue(initial.heightCm, units)) : '');
  const [weight, setWeight] = useState(initial ? String(weightValue(initial.weightKg, units)) : '');
  const [gender, setGender] = useState<Gender>(initial?.gender ?? 'male');
  const [sex, setSex] = useState<SexForCalc>(initial?.sexForCalc ?? 'male');
  const [goal, setGoal] = useState<Goal>(initial?.goal ?? 'stay_fit');
  const [activity, setActivity] = useState<Activity>(initial?.activity ?? 'light');
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [genderOpen, setGenderOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [netError, setNetError] = useState(false);

  const errors = useMemo(() => validateProfileForm({ name, age, height, weight }, units), [name, age, height, weight, units]);
  const valid = Object.keys(errors).length === 0;
  const ageNum = parseNumber(age);

  const msg = (f: FieldKey): string | undefined => {
    if (serverErrors[f]) return serverErrors[f];
    const e = errors[f];
    if (!e) return undefined;
    const shown = touched[f] || (f !== 'name' && (f === 'age' ? age : f === 'height' ? height : weight).trim() !== '');
    if (!shown) return undefined;
    if (e === 'required') return t('form.required');
    if (f === 'age') return t('form.ageRange');
    if (f === 'height') return t('form.heightRange', { min: fmtNum(heightValue(LIMITS.heightCm.min, units)), max: fmtNum(heightValue(LIMITS.heightCm.max, units)), unit: heightUnit(units) });
    return t('form.weightRange', { min: fmtNum(weightValue(LIMITS.weightKg.min, units)), max: fmtNum(weightValue(LIMITS.weightKg.max, units)), unit: weightUnit(units) });
  };
  const blur = (f: FieldKey) => () => setTouched((x) => ({ ...x, [f]: true }));
  const set = (f: FieldKey, fn: (v: string) => void) => (v: string) => {
    setServerErrors((s) => ({ ...s, [f]: undefined }));
    fn(v);
  };

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    setNetError(false);
    try {
      await onSubmit({
        displayName: name.trim(), gender, sexForCalc: gender === 'female' ? 'female' : gender === 'male' ? 'male' : sex,
        age: Math.round(ageNum), heightCm: round1(heightToCm(parseNumber(height), units)), weightKg: round1(weightToKg(parseNumber(weight), units)),
        goal, activity, proteinPerKg: initial?.proteinPerKg ?? 1.6,
      });
    } catch (e) {
      if (e instanceof ApiError && e.details?.length) {
        const next: Partial<Record<FieldKey, string>> = {};
        e.details.forEach((d) => { if (['name', 'age', 'height', 'weight'].includes(d.field)) next[d.field as FieldKey] = e.message; });
        setServerErrors(next);
      } else setNetError(true);
    } finally {
      setSaving(false);
    }
  };

  const genders: { v: Gender; l: string }[] = [
    { v: 'female', l: t('gender.woman') }, { v: 'male', l: t('gender.man') }, { v: 'self', l: t('gender.self') }, { v: 'none', l: t('gender.none') },
  ];
  const activityHelp = activity === 'sedentary' ? t('act.sedentary.help') : activity === 'light' || activity === 'moderate' ? t('act.light.help') : t('act.active.help');

  return (
    <View style={{ gap: 16 }}>
      <Input label={t('form.name')} value={name} onChangeText={set('name', setName)} onBlur={blur('name')} error={msg('name')} maxLength={LIMITS.nameMax} placeholder={t('form.namePh')} autoCapitalize="words" />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Input style={{ flex: 1 }} label={t('form.age')} value={age} onChangeText={set('age', setAge)} onBlur={blur('age')} keyboardType="number-pad" suffix={t('form.years')} error={msg('age')} helper={t('form.ageHelp')} maxLength={3} />
        <Input style={{ flex: 1 }} label={t('form.height')} value={height} onChangeText={set('height', setHeight)} onBlur={blur('height')} keyboardType="decimal-pad" suffix={heightUnit(units)} error={msg('height')} />
      </View>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <Input style={{ flex: 1 }} label={t('form.weight')} value={weight} onChangeText={set('weight', setWeight)} onBlur={blur('weight')} keyboardType="decimal-pad" suffix={weightUnit(units)} error={msg('weight')} helper={`${weightValue(LIMITS.weightKg.min, units)}–${weightValue(LIMITS.weightKg.max, units)} ${weightUnit(units)}`} />
        <View style={{ flex: 1, gap: 6 }}>
          <AppText variant="label" color={colors.textSecondary}>{t('form.gender')}</AppText>
          <Pressable onPress={() => setGenderOpen(true)} accessibilityRole="button" accessibilityLabel={t('form.gender')} style={{ minHeight: 56, borderRadius: radius.input, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
            <AppText variant="body">{genders.find((g) => g.v === gender)?.l}</AppText>
            <ChevronDown size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>
      <AppText variant="caption" color={colors.textSecondary}>{t('form.genderHelp')}</AppText>
      {(gender === 'self' || gender === 'none') && (
        <View style={{ gap: 8 }}>
          <AppText variant="label" color={colors.textSecondary}>{t('form.sexCalc')}</AppText>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label={t('gender.woman')} selected={sex === 'female'} onPress={() => setSex('female')} />
            <Chip label={t('gender.man')} selected={sex === 'male'} onPress={() => setSex('male')} />
          </View>
          <AppText variant="caption" color={colors.textSecondary}>{t('form.sexCalcHelp')}</AppText>
        </View>
      )}
      <View style={{ gap: 8 }}>
        <AppText variant="label" color={colors.textSecondary}>{t('form.goal')}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip label={t('goal.lose_fat')} selected={goal === 'lose_fat'} onPress={() => setGoal('lose_fat')} />
          <Chip label={t('goal.build_muscle')} selected={goal === 'build_muscle'} onPress={() => setGoal('build_muscle')} />
          <Chip label={t('goal.stay_fit')} selected={goal === 'stay_fit'} onPress={() => setGoal('stay_fit')} />
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <AppText variant="label" color={colors.textSecondary}>{t('form.activity')}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip label={t('act.sedentary')} selected={activity === 'sedentary'} onPress={() => setActivity('sedentary')} />
          <Chip label={t('act.light')} selected={activity === 'light' || activity === 'moderate'} onPress={() => setActivity('light')} />
          <Chip label={t('act.active')} selected={activity === 'active'} onPress={() => setActivity('active')} />
        </View>
        <AppText variant="caption" color={colors.textSecondary}>{activityHelp}</AppText>
      </View>
      {Number.isFinite(ageNum) && ageNum < 18 && ageNum >= LIMITS.age.min && (
        <Banner kind="warning" text={goal === 'lose_fat' ? t('form.under18Loss') : t('form.under18')} />
      )}
      {netError && <Banner kind="error" text={t('err.network')} actionLabel={t('common.tryAgain')} onAction={() => void submit()} />}
      <Button label={submitLabel} onPress={() => void submit()} disabled={!valid} loading={saving} />
      <AppText variant="caption" color={colors.textSecondary}>{footerNote ?? t('form.healthNote')}</AppText>

      <BottomSheet visible={genderOpen} onClose={() => setGenderOpen(false)}>
        <AppText variant="section">{t('form.gender')}</AppText>
        {genders.map((g) => (
          <Pressable key={g.v} onPress={() => { setGender(g.v); setGenderOpen(false); }} accessibilityRole="radio" accessibilityState={{ selected: gender === g.v }} style={{ minHeight: MIN_TOUCH, justifyContent: 'center' }}>
            <AppText variant="body" color={gender === g.v ? colors.primary : colors.text}>{g.l}</AppText>
          </Pressable>
        ))}
      </BottomSheet>
    </View>
  );
}

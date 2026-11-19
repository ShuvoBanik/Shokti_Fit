// Owner: Mahbub Hasnain | F1
import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme/tokens';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/ui';
import { useSettings } from '../../context/SettingsContext';
import type { Profile, Targets } from '../../lib/types';
import { fmtNum } from '../../lib/units';

export function MacroRow({ targets }: { targets: Targets }) {
  const { t } = useSettings();
  const items = [
    { v: targets.proteinG, l: t('macro.protein') }, { v: targets.carbG, l: t('macro.carbs') }, { v: targets.fatG, l: t('macro.fat') },
  ];
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {items.map((i) => (
        <View key={i.l} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 12, gap: 2 }}>
          <AppText variant="section">{i.v} g</AppText>
          <AppText variant="caption" color={colors.textSecondary}>{i.l}</AppText>
        </View>
      ))}
    </View>
  );
}

export function TargetCard({ profile, targets, previous, eyebrow }: { profile: Profile; targets: Targets; previous?: number | null; eyebrow?: string }) {
  const { t } = useSettings();
  return (
    <Card>
      {!!eyebrow && <AppText variant="eyebrow" color={colors.accent}>{eyebrow}</AppText>}
      <AppText variant="label" color={colors.textSecondary}>{t('target.estimated')}</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        <AppText variant="display" color={colors.primary}>{fmtNum(targets.kcal)}</AppText>
        <AppText variant="body" color={colors.textSecondary}>{t('target.kcalDay')}</AppText>
      </View>
      {previous != null && previous !== targets.kcal && (
        <AppText variant="label" color={colors.textSecondary}>{t('edit.previous', { n: fmtNum(previous) })}</AppText>
      )}
      <AppText variant="label" color={colors.textSecondary}>{t(`goal.${profile.goal}` as 'goal.stay_fit')} · {t(`act.${profile.activity === 'moderate' ? 'light' : profile.activity}` as 'act.light')}</AppText>
      <AppText variant="label" style={{ marginTop: 4 }}>{t('target.macroGuide')}</AppText>
      <MacroRow targets={targets} />
      <AppText variant="caption" color={colors.textSecondary}>{t('target.estimateOnly')}</AppText>
    </Card>
  );
}

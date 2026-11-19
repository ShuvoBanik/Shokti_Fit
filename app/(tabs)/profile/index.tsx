// Owner: Mahbub Hasnain | F2
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Info, SlidersHorizontal, Trash2 } from 'lucide-react-native';
import { colors, MIN_TOUCH } from '../../../theme/tokens';
import { AppText } from '../../../components/AppText';
import { BottomSheet, Button, Card, Screen, TopBar } from '../../../components/ui';
import { DeleteDataSheet } from '../../../features/f2-profile/DeleteDataSheet';
import { useProfile } from '../../../context/ProfileContext';
import { useSettings } from '../../../context/SettingsContext';
import { useTracking } from '../../../context/TrackingContext';
import { formatHeight, formatWeight } from '../../../lib/units';
import { formatDay } from '../../../lib/dates';
import { FOODS } from '../../../services/mock/seed';

export default function ProfileHome() {
  const router = useRouter();
  const { t, units, language } = useSettings();
  const { profile, targets } = useProfile();
  const { weights } = useTracking();
  const [sheet, setSheet] = useState<null | 'sources' | 'privacy' | 'delete'>(null);
  if (!profile || !targets) return null;
  const latest = weights[weights.length - 1];
  const initials = profile.displayName.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const Row = ({ icon, title, sub, onPress, tint }: { icon: React.ReactNode; title: string; sub?: string; onPress: () => void; tint?: string }) => (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      {icon}
      <View style={{ flex: 1 }}>
        <AppText variant="label" color={tint ?? colors.text} style={{ fontSize: 16, lineHeight: 24 }}>{title}</AppText>
        {!!sub && <AppText variant="caption" color={colors.textSecondary}>{sub}</AppText>}
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </Pressable>
  );
  return (
    <Screen tabs>
      <TopBar title={t('profile.title')} subtitle={t('profile.subtitle')} />
      <Card style={{ alignItems: 'center' }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <AppText variant="section" color={colors.onPrimary}>{initials}</AppText>
        </View>
        <AppText variant="section">{profile.displayName}</AppText>
        <AppText variant="label" color={colors.textSecondary}>{t(`goal.${profile.goal}` as 'goal.stay_fit')} · {t(`act.${profile.activity === 'moderate' ? 'light' : profile.activity}` as 'act.light')}</AppText>
        <View style={{ flexDirection: 'row', gap: 12, alignSelf: 'stretch' }}>
          {[{ v: String(profile.age), l: t('profile.years') }, { v: formatHeight(profile.heightCm, units), l: t('form.height') }, { v: formatWeight(profile.weightKg, units), l: t('profile.profileWeight') }].map((s) => (
            <View key={s.l} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 12, alignItems: 'center' }}>
              <AppText variant="label">{s.v}</AppText>
              <AppText variant="caption" color={colors.textSecondary}>{s.l}</AppText>
            </View>
          ))}
        </View>
        {latest && <AppText variant="caption" color={colors.textSecondary}>{t('profile.latestLog', { w: formatWeight(latest.weightKg, units), d: formatDay(latest.entryDate, language, false) })}</AppText>}
        <Button label={t('profile.edit')} onPress={() => router.push('/profile/edit')} style={{ alignSelf: 'stretch' }} />
      </Card>
      <Card style={{ gap: 0 }}>
        <Row icon={<SlidersHorizontal size={22} color={colors.primary} />} title={t('profile.settings')} sub={t('profile.settingsSub')} onPress={() => router.push('/profile/settings')} />
        <Row icon={<Info size={22} color={colors.primary} />} title={t('profile.sources')} sub="USDA FDC · Basic-food equivalents" onPress={() => setSheet('sources')} />
        <Row icon={<Info size={22} color={colors.primary} />} title={t('profile.privacy')} sub={t('profile.privacySub')} onPress={() => setSheet('privacy')} />
        <Row icon={<Trash2 size={22} color={colors.error} />} title={t('profile.delete')} sub={t('profile.deleteSub')} tint={colors.error} onPress={() => setSheet('delete')} />
      </Card>
      <BottomSheet visible={sheet === 'sources'} onClose={() => setSheet(null)}>
        <AppText variant="section">{t('profile.sources')}</AppText>
        {FOODS.map((f) => (
          <AppText key={f.id} variant="caption" color={colors.textSecondary}>{f.nameEn} — {f.source}</AppText>
        ))}
        <AppText variant="body" color={colors.textSecondary}>{t('sources.note')}</AppText>
        <Button label={t('common.close')} variant="ghost" onPress={() => setSheet(null)} />
      </BottomSheet>
      <BottomSheet visible={sheet === 'privacy'} onClose={() => setSheet(null)}>
        <AppText variant="section">{t('profile.privacy')}</AppText>
        <AppText variant="body" color={colors.textSecondary}>{t('privacy.body')}</AppText>
        <AppText variant="body" color={colors.textSecondary}>{t('disc.b2')}</AppText>
        <Button label={t('common.close')} variant="ghost" onPress={() => setSheet(null)} />
      </BottomSheet>
      <DeleteDataSheet visible={sheet === 'delete'} onClose={() => setSheet(null)} />
    </Screen>
  );
}

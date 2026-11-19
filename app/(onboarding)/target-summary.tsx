// Owner: Mahbub Hasnain | F1
import React from 'react';
import { View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { colors } from '../../theme/tokens';
import { AppText } from '../../components/AppText';
import { Banner, Button, Card, Screen } from '../../components/ui';
import { TargetCard } from '../../features/f1-profile/TargetCard';
import { useProfile } from '../../context/ProfileContext';
import { useSettings } from '../../context/SettingsContext';

export default function TargetSummary() {
  const router = useRouter();
  const { t } = useSettings();
  const { profile, targets } = useProfile();
  if (!profile || !targets) return <Redirect href="/welcome" />;
  return (
    <Screen footer={<Button label={t('target.cta')} onPress={() => router.replace('/home')} />}>
      <View style={{ paddingTop: 16, gap: 4 }}>
        <AppText variant="screen">{t('target.title')}</AppText>
        <AppText variant="body" color={colors.textSecondary}>{t('target.subtitle')}</AppText>
        <AppText variant="eyebrow" color={colors.accent} style={{ marginTop: 8 }}>{t('target.step')}</AppText>
      </View>
      <TargetCard profile={profile} targets={targets} />
      <Card>
        <AppText variant="body" color={colors.textSecondary}>{t('target.basis')}</AppText>
        <AppText variant="body" color={colors.textSecondary}>{t('target.flex')}</AppText>
      </Card>
      {targets.floorApplied && <Banner kind="warning" text={t('target.floor')} />}
      {targets.aggressiveGoal && <Banner kind="warning" text={t('target.aggressive')} />}
    </Screen>
  );
}

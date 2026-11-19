// Owner: Mahbub Hasnain | F1
import React from 'react';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/tokens';
import { AppText } from '../../components/AppText';
import { Screen, TopBar } from '../../components/ui';
import { ProfileForm } from '../../features/f1-profile/ProfileForm';
import { useProfile } from '../../context/ProfileContext';
import { useSettings } from '../../context/SettingsContext';

export default function ProfileSetup() {
  const router = useRouter();
  const { t } = useSettings();
  const { create } = useProfile();
  return (
    <Screen>
      <TopBar title={t('setup.title')} subtitle={t('setup.subtitle')} onBack={() => router.back()} />
      <AppText variant="eyebrow" color={colors.accent}>{t('setup.step')}</AppText>
      <AppText variant="caption" color={colors.textSecondary}>{t('setup.estimates')}</AppText>
      <ProfileForm
        submitLabel={t('common.next')}
        onSubmit={async (p) => {
          await create(p); // POST /api/profiles; throws on failure so the form keeps its values
          router.push('/target-summary');
        }}
      />
    </Screen>
  );
}

// Owner: Mahbub Hasnain | F2
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors } from '../../../theme/tokens';
import { AppText } from '../../../components/AppText';
import { Banner, Screen, TopBar } from '../../../components/ui';
import { ProfileForm } from '../../../features/f1-profile/ProfileForm';
import { TargetCard } from '../../../features/f1-profile/TargetCard';
import { useProfile } from '../../../context/ProfileContext';
import { useSettings } from '../../../context/SettingsContext';
import { useSnackbar } from '../../../context/SnackbarContext';
import type { Profile, Targets } from '../../../lib/types';

/** F2: edit profile. PATCH recalculates targets; a failed save keeps previous values and shows an error. */
export default function EditProfile() {
  const router = useRouter();
  const { t } = useSettings();
  const { profile, targets, update } = useProfile();
  const snack = useSnackbar();
  const [result, setResult] = useState<{ previous: number | null; next: Targets } | null>(null);
  const [saved, setSaved] = useState<Profile | null>(null);
  if (!profile || !targets) return null;
  return (
    <Screen>
      <TopBar title={t('edit.title')} subtitle={t('edit.subtitle')} onBack={() => router.back()} />
      {result && saved && (
        <>
          <Banner kind="info" text={t('edit.saved')} />
          <TargetCard profile={saved} targets={result.next} previous={result.previous} eyebrow={t('edit.revised')} />
          <AppText variant="caption" color={colors.textSecondary}>{t('target.estimateOnly')}</AppText>
        </>
      )}
      <ProfileForm
        key={saved ? JSON.stringify(saved) : 'initial'}
        initial={saved ?? profile}
        submitLabel={t('edit.save')}
        footerNote={t('edit.note')}
        onSubmit={async (p) => {
          const res = await update(p);
          setSaved(p);
          setResult({ previous: res.previous?.kcal ?? null, next: res.next });
          snack.show({ text: t('edit.saved') });
        }}
      />
    </Screen>
  );
}

// Owner: Shared (led by Mahbub Hasnain) | shell
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { colors } from '../theme/tokens';
import { AppText } from '../components/AppText';
import { useProfile } from '../context/ProfileContext';
import { useSettings } from '../context/SettingsContext';

/** Splash (Flow A step 1): token found → Home, otherwise → Welcome. */
export default function Splash() {
  const { ready, onboarded } = useProfile();
  const { ready: settingsReady, t, language } = useSettings();
  const [minDone, setMinDone] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMinDone(true), 1200);
    return () => clearTimeout(id);
  }, []);
  if (ready && settingsReady && minDone) return <Redirect href={onboarded ? '/home' : '/welcome'} />;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <AppText variant="display" color={colors.onPrimary} style={{ fontSize: 40 }}>S</AppText>
      </View>
      <AppText variant="screen" style={{ letterSpacing: 4 }}>SHOKTI FIT</AppText>
      {language === 'bn' && <AppText variant="section">শক্তি</AppText>}
      <AppText variant="label" color={colors.textSecondary}>{t('splash.tagline')}</AppText>
      <AppText variant="eyebrow" color={colors.accent} style={{ marginTop: 24 }}>{t('splash.sub')}</AppText>
    </View>
  );
}

// Owner: Mahbub Hasnain | F1
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { colors, MIN_TOUCH } from '../../theme/tokens';
import { AppText } from '../../components/AppText';
import { Button, Card, Screen, TopBar } from '../../components/ui';
import { useSettings } from '../../context/SettingsContext';

export default function Disclaimer() {
  const router = useRouter();
  const { t } = useSettings();
  const [ok, setOk] = useState(false);
  return (
    <Screen footer={<Button label={t('common.continue')} disabled={!ok} onPress={() => router.push('/profile-setup')} />}>
      <TopBar title={t('disc.title')} onBack={() => router.back()} />
      <Card>
        <AppText variant="section">{t('disc.h1')}</AppText>
        <AppText variant="body" color={colors.textSecondary}>{t('disc.b1')}</AppText>
      </Card>
      <Card>
        <AppText variant="section">{t('disc.h2')}</AppText>
        <AppText variant="body" color={colors.textSecondary}>{t('disc.b2')}</AppText>
        <AppText variant="body" color={colors.warning}>{t('disc.under18')}</AppText>
        <AppText variant="body" color={colors.textSecondary}>{t('disc.rest')}</AppText>
      </Card>
      <Pressable onPress={() => setOk(!ok)} accessibilityRole="checkbox" accessibilityState={{ checked: ok }} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: MIN_TOUCH }}>
        <View style={{ width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: ok ? colors.primary : colors.muted, backgroundColor: ok ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {ok && <Check size={18} color={colors.onPrimary} strokeWidth={3} />}
        </View>
        <AppText variant="body" style={{ flex: 1 }}>{t('disc.ack')}</AppText>
      </Pressable>
    </Screen>
  );
}

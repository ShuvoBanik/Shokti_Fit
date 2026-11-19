// Owner: Mahbub Hasnain | F1
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/tokens';
import { AppText } from '../../components/AppText';
import { Button, Chip, Screen } from '../../components/ui';
import { useSettings } from '../../context/SettingsContext';

export default function Welcome() {
  const router = useRouter();
  const { t, language, update } = useSettings();
  return (
    <Screen footer={<Button label={t('welcome.cta')} onPress={() => router.push('/intro')} />}>
      <View style={{ gap: 16, paddingTop: 24 }}>
        <AppText variant="eyebrow" color={colors.accent}>{language === 'bn' ? 'SHOKTI FIT / শক্তি' : 'SHOKTI FIT'}</AppText>
        <AppText variant="display" style={{ fontSize: 44, lineHeight: 52 }}>{t('welcome.title1')}{'\n'}<AppText variant="display" color={colors.primary} style={{ fontSize: 44, lineHeight: 52 }}>{t('welcome.title2')}</AppText></AppText>
        <AppText variant="body" color={colors.textSecondary}>{t('welcome.body')}</AppText>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="English" selected={language === 'en'} onPress={() => update({ language: 'en' })} />
          <Chip label="বাংলা" selected={language === 'bn'} onPress={() => update({ language: 'bn' })} />
        </View>
        <AppText variant="label" color={colors.textSecondary}>{t('welcome.noAccount')}</AppText>
      </View>
    </Screen>
  );
}

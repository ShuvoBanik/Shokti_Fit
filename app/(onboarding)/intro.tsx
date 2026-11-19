// Owner: Mahbub Hasnain | F1
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Dumbbell, Utensils, ChartNoAxesCombined } from 'lucide-react-native';
import { colors } from '../../theme/tokens';
import { AppText } from '../../components/AppText';
import { Button, Card, Screen, TopBar } from '../../components/ui';
import { useSettings } from '../../context/SettingsContext';

export default function Intro() {
  const router = useRouter();
  const { t } = useSettings();
  const slides = [
    { Icon: Dumbbell, title: t('intro.s1.title'), body: t('intro.s1.body') },
    { Icon: Utensils, title: t('intro.s2.title'), body: t('intro.s2.body') },
    { Icon: ChartNoAxesCombined, title: t('intro.s3.title'), body: t('intro.s3.body') },
  ];
  return (
    <Screen footer={<Button label={t('common.continue')} onPress={() => router.push('/disclaimer')} />}>
      <TopBar title={t('intro.title')} subtitle={t('intro.subtitle')} onBack={() => router.back()} />
      <AppText variant="eyebrow" color={colors.accent}>{t('intro.eyebrow')}</AppText>
      {slides.map(({ Icon, title, body }) => (
        <Card key={title} style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
          <Icon size={28} color={colors.primary} strokeWidth={1.9} />
          <View style={{ flex: 1, gap: 4 }}>
            <AppText variant="section">{title}</AppText>
            <AppText variant="body" color={colors.textSecondary}>{body}</AppText>
          </View>
        </Card>
      ))}
      <AppText variant="label" color={colors.textSecondary}>{t('intro.tagline')}</AppText>
    </Screen>
  );
}

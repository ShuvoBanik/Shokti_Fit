// Owner: Mahbub Hasnain | F2
import React, { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, MIN_TOUCH } from '../../../theme/tokens';
import { AppText } from '../../../components/AppText';
import { Button, Card, Chip, Screen, TopBar } from '../../../components/ui';
import { DeleteDataSheet } from '../../../features/f2-profile/DeleteDataSheet';
import { useSettings } from '../../../context/SettingsContext';
import { useOutbox } from '../../../hooks/useOutbox';
import { USE_MOCK } from '../../../services/api';
import { mockControl } from '../../../services/mock/control';

export default function Settings() {
  const router = useRouter();
  const { t, language, units, reducedMotion, update } = useSettings();
  const [del, setDel] = useState(false);
  const [offline, setOffline] = useState(mockControl.isOffline());
  const { pending, failed } = useOutbox();
  return (
    <Screen>
      <TopBar title={t('settings.title')} subtitle={t('settings.subtitle')} onBack={() => router.back()} />
      <Card>
        <AppText variant="section">{t('settings.language')}</AppText>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="English" selected={language === 'en'} onPress={() => update({ language: 'en' })} />
          <Chip label="বাংলা" selected={language === 'bn'} onPress={() => update({ language: 'bn' })} />
        </View>
        <AppText variant="caption" color={colors.textSecondary}>{t('settings.languageHelp')}</AppText>
      </Card>
      <Card>
        <AppText variant="section">{t('settings.units')}</AppText>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label={t('settings.metric')} selected={units === 'metric'} onPress={() => update({ units: 'metric' })} />
          <Chip label={t('settings.imperial')} selected={units === 'imperial'} onPress={() => update({ units: 'imperial' })} />
        </View>
        <AppText variant="caption" color={colors.textSecondary}>{units === 'metric' ? 'kg, cm, ml' : 'lb, in, fl oz'} · {t('settings.unitsHelp')}</AppText>
      </Card>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: MIN_TOUCH }}>
          <View style={{ flex: 1 }}>
            <AppText variant="section">{t('settings.motion')}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>{reducedMotion ? t('settings.motionOn') : t('settings.motionOff')}</AppText>
          </View>
          <Switch value={reducedMotion} onValueChange={(v) => update({ reducedMotion: v })} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={colors.text} accessibilityLabel={t('settings.motion')} />
        </View>
      </Card>
      <Card>
        <AppText variant="section">{t('settings.privacy')}</AppText>
        <AppText variant="body" color={colors.textSecondary}>{t('settings.privacyBody')}</AppText>
      </Card>
      {USE_MOCK && (
        <Card>
          <AppText variant="section">{t('settings.demo')}</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: MIN_TOUCH }}>
            <AppText variant="body" style={{ flex: 1 }}>{t('settings.simOffline')}</AppText>
            <Switch value={offline} onValueChange={(v) => { setOffline(v); mockControl.setOffline(v); }} trackColor={{ true: colors.warning, false: colors.border }} thumbColor={colors.text} accessibilityLabel={t('settings.simOffline')} />
          </View>
          <AppText variant="caption" color={colors.textSecondary}>{t('settings.simHelp', { p: pending.length, f: failed.length })}</AppText>
        </Card>
      )}
      <Pressable onPress={() => setDel(true)} accessibilityRole="button" style={{ minHeight: 64, justifyContent: 'center' }}>
        <AppText variant="label" color={colors.error} style={{ fontSize: 16, lineHeight: 24 }}>{t('profile.delete')}</AppText>
        <AppText variant="caption" color={colors.textSecondary}>{t('settings.deleteSub')}</AppText>
      </Pressable>
      <AppText variant="caption" color={colors.textSecondary}>SHOKTI FIT · {t('settings.version')} 1.0{'\n'}{t('target.estimateOnly')}</AppText>
      <Button label={t('common.back')} variant="ghost" onPress={() => router.back()} />
      <DeleteDataSheet visible={del} onClose={() => setDel(false)} />
    </Screen>
  );
}

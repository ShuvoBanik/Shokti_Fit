// Owner: Rafsan Zaman Abir | F7
import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../theme/tokens';
import { AppText } from '../../../components/AppText';
import { Button, Card, ContentState, Screen, TopBar } from '../../../components/ui';
import { useSettings } from '../../../context/SettingsContext';
import { useTracking } from '../../../context/TrackingContext';
import { formatDay, monthName, parseDate } from '../../../lib/dates';
import { formatWeight, round1, weightUnit, weightValue } from '../../../lib/units';

/** F7: history with change vs the previous entry, calculated on the device. */
export default function WeightHistory() {
  const router = useRouter();
  const { t, language, units } = useSettings();
  const { weights } = useTracking();
  const desc = [...weights].reverse();
  const change = (i: number) => (i + 1 < desc.length ? round1(weightValue(desc[i].weightKg, units) - weightValue(desc[i + 1].weightKg, units)) : null);
  const latestChange = desc.length > 1 ? change(0) : null;
  let lastMonth = '';
  return (
    <Screen>
      <TopBar title={t('wh.title')} subtitle={t('wh.subtitle')} onBack={() => router.back()} />
      {desc.length === 0 ? (
        <ContentState kind="empty" title={t('prog.emptyTitle')} body={t('prog.emptyBody')} actionLabel={t('prog.addWeight')} onAction={() => router.push('/home/weight-entry')} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16 }}>
              <AppText variant="screen" color={colors.primary}>{formatWeight(desc[0].weightKg, units)}</AppText>
              <AppText variant="caption" color={colors.textSecondary}>{t('wh.latest')}</AppText>
            </View>
            {latestChange !== null && (
              <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16 }}>
                <AppText variant="screen">{latestChange > 0 ? '+' : latestChange < 0 ? '−' : ''}{Math.abs(latestChange)} {weightUnit(units)}</AppText>
                <AppText variant="caption" color={colors.textSecondary}>{t('wh.since')}</AppText>
              </View>
            )}
          </View>
          <AppText variant="caption" color={colors.textSecondary}>{t('wh.note')}</AppText>
          {desc.map((w, i) => {
            const c = change(i);
            const m = `${monthName(w.entryDate, language)} ${parseDate(w.entryDate).getFullYear()}`;
            const header = m !== lastMonth;
            lastMonth = m;
            return (
              <View key={w.id} style={{ gap: 8 }}>
                {header && <AppText variant="eyebrow" color={colors.accent}>{m}</AppText>}
                <Pressable onPress={() => router.push({ pathname: '/home/weight-entry', params: { date: w.entryDate } })} accessibilityRole="button" accessibilityLabel={`${formatDay(w.entryDate, language)}, ${formatWeight(w.weightKg, units)}`}>
                  <Card style={{ gap: 2 }}>
                    <AppText variant="section">{formatWeight(w.weightKg, units)}{w.pending ? ` · ${t('common.pending')}` : ''}</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {formatDay(w.entryDate, language)}{c === null ? '' : c === 0 ? ` · ${t('wh.same')}` : ` · ${c < 0 ? '↓' : '↑'} ${t(c < 0 ? 'wh.lower' : 'wh.higher', { n: Math.abs(c) })}`}
                    </AppText>
                  </Card>
                </Pressable>
              </View>
            );
          })}
        </>
      )}
      <Button label={`+ ${t('prog.addWeight')}`} onPress={() => router.push('/home/weight-entry')} />
    </Screen>
  );
}

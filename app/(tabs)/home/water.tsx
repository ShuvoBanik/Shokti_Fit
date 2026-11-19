// Owner: Rafsan Zaman Abir | F8
import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassWater } from 'lucide-react-native';
import { colors } from '../../../theme/tokens';
import { AppText } from '../../../components/AppText';
import { Banner, BottomSheet, Button, Card, ConfirmSheet, ProgressBar, Screen, Stepper, TopBar } from '../../../components/ui';
import { useSettings } from '../../../context/SettingsContext';
import { useSnackbar } from '../../../context/SnackbarContext';
import { useTracking } from '../../../context/TrackingContext';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { useOutbox } from '../../../hooks/useOutbox';
import { formatTime } from '../../../lib/dates';
import { formatWater, formatWaterShort } from '../../../lib/units';
import { LIMITS } from '../../../lib/validation';

/** F8: water tracker with offline-first sync. Glass counter style (open item: confirm with team). */
export default function Water() {
  const router = useRouter();
  const { t, units, waterGoalMl, update } = useSettings();
  const { water, waterPending, addWater, undoWater, resetWater } = useTracking();
  const { online } = useNetworkStatus();
  const { failed, retry, discard } = useOutbox();
  const snack = useSnackbar();
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalDraft, setGoalDraft] = useState(waterGoalMl);
  const [resetOpen, setResetOpen] = useState(false);
  const amount = water.amountMl;
  const glasses = Math.round(waterGoalMl / 250);
  const filled = Math.floor(amount / 250);
  const last = water.entries[water.entries.length - 1];
  const failedWater = failed.filter((f) => f.type === 'water.put');
  const add = (ml: number) => { addWater(ml); snack.show({ text: t('water.added', { ml, total: formatWaterShort(Math.min(6000, amount + ml), units) }) }); };

  return (
    <Screen>
      <TopBar title={t('water.title')} subtitle={t('water.sub')} onBack={() => router.back()} />
      {(!online || waterPending) && (
        <Banner kind={online ? 'info' : 'offline'} text={!online ? t('water.offline') : t('water.syncing')} />
      )}
      {failedWater.length > 0 && (
        <Banner kind="error" text={t('water.failed')} actionLabel={t('common.retry')} onAction={() => void retry(failedWater[0].clientId)} secondaryLabel={t('common.discard')} onSecondary={() => void discard(failedWater[0].clientId)} />
      )}
      <Card>
        <AppText variant="display" style={{ fontSize: 36, lineHeight: 44 }}>{formatWater(amount, units)}<AppText variant="body" color={colors.textSecondary}> / {formatWater(waterGoalMl, units)}</AppText></AppText>
        <ProgressBar label={t('water.title')} value={amount} max={waterGoalMl} unit="ml" caption={t('water.toGoal', { a: formatWaterShort(amount, units), b: formatWaterShort(waterGoalMl, units), n: formatWater(Math.max(0, waterGoalMl - amount), units) })} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }} accessible accessibilityLabel={t('water.glasses', { a: filled, b: glasses })}>
          {Array.from({ length: glasses }, (_, i) => <GlassWater key={i} size={26} color={i < filled ? colors.primary : colors.border} />)}
        </View>
        <AppText variant="caption" color={colors.textSecondary}>{t('water.glasses', { a: filled, b: glasses })}</AppText>
        {waterPending && <AppText variant="caption" color={colors.warning}>{t('water.stored')}</AppText>}
      </Card>
      <Button label={t('water.add250')} onPress={() => add(250)} />
      <Button label={`+ ${t('water.add500')}`} variant="secondary" onPress={() => add(500)} />
      <Button label={t('water.undo')} variant="ghost" disabled={!last} onPress={() => { undoWater(); snack.show({ kind: 'info', text: t('water.undone') }); }} />
      <AppText variant="caption" color={colors.textSecondary}>{last ? t('water.lastEntry', { ml: formatWater(last.ml, units), at: formatTime(last.at) }) : t('water.noEntries')}</AppText>
      <Button label={t('water.editGoal')} variant="ghost" onPress={() => { setGoalDraft(waterGoalMl); setGoalOpen(true); }} />
      <AppText variant="caption" color={colors.textSecondary}>{formatWaterShort(waterGoalMl, units)} {t('water.today')} · {t('water.configurable')}</AppText>
      <Button label={t('water.reset')} variant="ghost" disabled={amount === 0} onPress={() => setResetOpen(true)} />
      <AppText variant="caption" color={colors.textSecondary}>{t('water.example')}</AppText>

      <BottomSheet visible={goalOpen} onClose={() => setGoalOpen(false)}>
        <AppText variant="section">{t('water.editGoal')}</AppText>
        <Stepper label={t('water.editGoal')} display={units === 'metric' ? String(goalDraft) : formatWater(goalDraft, units).replace(' fl oz', '')} unit={units === 'metric' ? 'ml' : 'fl oz'} hint={t('water.goalHint', { min: LIMITS.waterGoalMl.min, max: LIMITS.waterGoalMl.max })}
          decDisabled={goalDraft <= LIMITS.waterGoalMl.min} incDisabled={goalDraft >= LIMITS.waterGoalMl.max}
          onDec={() => setGoalDraft((g) => Math.max(LIMITS.waterGoalMl.min, g - 250))} onInc={() => setGoalDraft((g) => Math.min(LIMITS.waterGoalMl.max, g + 250))} />
        <Button label={t('common.save')} onPress={() => { update({ waterGoalMl: goalDraft }); setGoalOpen(false); }} />
        <Button label={t('common.cancel')} variant="ghost" onPress={() => setGoalOpen(false)} />
      </BottomSheet>
      <ConfirmSheet visible={resetOpen} title={t('water.resetTitle')} body={t('water.resetBody')} confirmLabel={t('water.resetConfirm')} cancelLabel={t('common.cancel')} danger
        onCancel={() => setResetOpen(false)} onConfirm={() => { resetWater(); setResetOpen(false); }} />
    </Screen>
  );
}

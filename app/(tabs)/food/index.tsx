// Owner: Swarna Sikder | F5, F6
import React, { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { colors, radius } from '../../../theme/tokens';
import { AppText } from '../../../components/AppText';
import { Card, Chip, ChipRow, ContentState, Screen, Skeleton, TopBar } from '../../../components/ui';
import { api } from '../../../services/api';
import { useDebounce } from '../../../hooks/useDebounce';
import { useSettings } from '../../../context/SettingsContext';
import { useSnackbar } from '../../../context/SnackbarContext';
import type { Food } from '../../../lib/types';

const CATS = ['All', 'Staples', 'Protein', 'Fruit'];

/** F5: bilingual food search, debounced 300 ms; the API is queried with 2+ characters. */
export default function FoodSearch() {
  const router = useRouter();
  const { t, language } = useSettings();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const dq = useDebounce(q, 300);
  const [state, setState] = useState<{ status: 'loading' | 'error' | 'ready'; items: Food[] }>({ status: 'loading', items: [] });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading' }));
    api.foods.search(dq, cat).then((items) => !cancelled && setState({ status: 'ready', items })).catch(() => !cancelled && setState({ status: 'error', items: [] }));
    return () => { cancelled = true; };
  }, [dq, cat, tick]);

  const per = (f: Food) => {
    const kcal = Math.round(f.kcal100 * f.listBasisG) / 100;
    return `${kcal} kcal / ${f.listBasisG} g${f.listBasisG === 50 ? ' egg' : ''}`;
  };
  void useSnackbar;
  return (
    <Screen tabs>
      <TopBar title={t('food.title')} subtitle={t('food.searchBn')} />
      <View style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, backgroundColor: colors.surface, borderRadius: radius.input, borderWidth: 1.5, borderColor: colors.border }}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput value={q} onChangeText={setQ} placeholder={t('food.searchPh')} placeholderTextColor={colors.muted} accessibilityLabel={t('food.searchPh')} selectionColor={colors.primary} autoCorrect={false} style={{ flex: 1, color: colors.text, fontSize: 16, fontFamily: 'Inter_400Regular', paddingVertical: 12 }} />
      </View>
      <ChipRow>{CATS.map((c) => <Chip key={c} label={t(`cat.${c}` as 'cat.All')} selected={cat === c} onPress={() => setCat(c)} />)}</ChipRow>
      {dq.trim().length < 2 && state.status === 'ready' && <AppText variant="eyebrow" color={colors.accent}>{t('food.basic')}</AppText>}

      {state.status === 'loading' && <><Skeleton height={80} /><Skeleton height={80} /></>}
      {state.status === 'error' && <ContentState kind="error" title={t('food.errorTitle')} body={t('food.errorBody')} actionLabel={t('common.tryAgain')} onAction={() => setTick((x) => x + 1)} />}
      {state.status === 'ready' && state.items.length === 0 && (
        <ContentState kind="empty" title={t('food.noneTitle')} body={t('food.noneBody')} actionLabel={t('food.addCustom')} onAction={() => router.push('/food/custom')} />
      )}
      {state.status === 'ready' && state.items.map((f) => (
        <Pressable key={f.id} onPress={() => router.push(`/food/${f.id}`)} accessibilityRole="button" accessibilityLabel={`${f.nameEn}, ${per(f)}`}>
          <Card style={{ gap: 2 }}>
            <AppText variant="label" style={{ fontSize: 16, lineHeight: 24 }}>{language === 'bn' && f.nameBn ? f.nameBn : f.nameEn}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>{per(f)} · {f.source.replace('USDA FoodData Central, ', 'USDA ').replace(/, (NDB|FDC) \d+/, '')}</AppText>
          </Card>
        </Pressable>
      ))}
      {state.status === 'ready' && state.items.length > 0 && <AppText variant="caption" color={colors.textSecondary}>{t('food.disclaimer')}</AppText>}
      {state.status === 'ready' && (
        <Pressable onPress={() => router.push('/food/custom')} accessibilityRole="button" style={{ minHeight: 48, justifyContent: 'center' }}>
          <AppText variant="label" color={colors.primary}>+ {t('food.addCustom')}</AppText>
        </Pressable>
      )}
    </Screen>
  );
}

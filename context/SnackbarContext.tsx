// Owner: Shared (led by Mahbub Hasnain) | shell
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSegments } from 'expo-router';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react-native';
import { colors, MIN_TOUCH, radius, TAB_BAR_HEIGHT } from '../theme/tokens';
import { AppText } from '../components/AppText';
import { useSettings } from './SettingsContext';

export interface SnackOptions {
  text: string;
  kind?: 'success' | 'error' | 'info';
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
  /** called when the snackbar closes without the action being used */
  onExpire?: () => void;
}
const Ctx = createContext<{ show: (o: SnackOptions) => void; hide: () => void } | null>(null);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snack, setSnack] = useState<SnackOptions | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = useRef<SnackOptions | null>(null);
  const insets = useSafeAreaInsets();
  const segments = useSegments() as string[];
  const { t } = useSettings();
  const inTabs = segments.includes('(tabs)');

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const hide = useCallback(() => {
    clear();
    setSnack(null);
    current.current = null;
  }, [clear]);
  const show = useCallback(
    (o: SnackOptions) => {
      clear();
      current.current?.onExpire?.();
      current.current = o;
      setSnack(o);
      timer.current = setTimeout(() => {
        const cur = current.current;
        setSnack(null);
        current.current = null;
        cur?.onExpire?.();
      }, o.durationMs ?? (o.actionLabel ? 5000 : 3500));
    },
    [clear],
  );
  useEffect(() => clear, [clear]);
  const value = useMemo(() => ({ show, hide }), [show, hide]);

  const Icon = snack?.kind === 'error' ? CircleAlert : snack?.kind === 'info' ? Info : CircleCheck;
  const tint = snack?.kind === 'error' ? colors.error : snack?.kind === 'info' ? colors.accent : colors.success;
  return (
    <Ctx.Provider value={value}>
      {children}
      {snack && (
        <View pointerEvents="box-none" style={[styles.host, { bottom: insets.bottom + (inTabs ? TAB_BAR_HEIGHT : 0) + 12 }]}>
          <View style={styles.bar} accessibilityLiveRegion="polite">
            <Icon size={20} color={tint} />
            <AppText variant="label" style={{ flex: 1 }}>{snack.text}</AppText>
            {snack.actionLabel && (
              <Pressable
                accessibilityRole="button"
                style={styles.action}
                onPress={() => {
                  const a = snack.onAction;
                  current.current = null;
                  hide();
                  a?.();
                }}
              >
                <AppText variant="label" color={colors.primary}>{snack.actionLabel}</AppText>
              </Pressable>
            )}
            <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} style={styles.close} onPress={() => { const c = current.current; hide(); c?.onExpire?.(); }}>
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      )}
    </Ctx.Provider>
  );
}

export const useSnackbar = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('SnackbarProvider missing');
  return c;
};

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 20, right: 20 },
  bar: {
    minHeight: MIN_TOUCH, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 14, paddingRight: 4,
    backgroundColor: colors.card, borderRadius: radius.input, borderWidth: 1, borderColor: colors.border, elevation: 6,
  },
  action: { minHeight: MIN_TOUCH, minWidth: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: 8 },
  close: { width: 40, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
});

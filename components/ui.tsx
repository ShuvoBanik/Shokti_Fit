// Owner: Shared (led by Mahbub Hasnain) | shell
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, StyleProp, StyleSheet,
  TextInput, TextInputProps, View, ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CircleAlert, CircleCheck, Info, Minus, Plus, WifiOff } from 'lucide-react-native';
import { colors, GUTTER, MIN_TOUCH, radius, TAB_BAR_HEIGHT } from '../theme/tokens';
import { AppText } from './AppText';
import { useSettings } from '../context/SettingsContext';

/* ---------- Screen ---------- */
interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  tabs?: boolean; // reserve space for the bottom tab bar
  onRefresh?: () => Promise<void> | void;
  refreshing?: boolean;
  footer?: React.ReactNode;
  topInset?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}
export function Screen({ children, scroll = true, tabs = false, onRefresh, refreshing, footer, topInset = true, contentStyle }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bottom = (tabs ? TAB_BAR_HEIGHT : 0) + insets.bottom;
  const pad = { paddingTop: topInset ? insets.top : 0, paddingBottom: footer ? 16 : bottom + 24 };
  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[{ paddingHorizontal: GUTTER, gap: 16 }, pad, contentStyle]}
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={() => void onRefresh()} tintColor={colors.primary} colors={[colors.primary]} progressBackgroundColor={colors.card} /> : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, paddingHorizontal: GUTTER }, pad, contentStyle]}>{children}</View>
      )}
      {footer && <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + (tabs ? TAB_BAR_HEIGHT : 0) }]}>{footer}</View>}
    </KeyboardAvoidingView>
  );
}

export function TopBar({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack?: () => void; right?: React.ReactNode }) {
  const { t } = useSettings();
  return (
    <View style={styles.topBar}>
      {onBack && (
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={t('common.back')} style={styles.iconBtn}>
          <ArrowLeft size={24} color={colors.text} strokeWidth={1.9} />
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        <AppText variant="screen" accessibilityRole="header">{title}</AppText>
        {!!subtitle && <AppText variant="body" color={colors.textSecondary}>{subtitle}</AppText>}
      </View>
      {right}
    </View>
  );
}

/* ---------- Buttons ---------- */
interface BtnProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}
export function Button({ label, onPress, variant = 'primary', disabled, loading, icon, style, accessibilityHint }: BtnProps) {
  const { t } = useSettings();
  const off = disabled || loading;
  const bg = variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.card : variant === 'danger' ? colors.error : 'transparent';
  const fg = variant === 'primary' || variant === 'danger' ? colors.onPrimary : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: off && !loading ? 0.4 : 1, borderColor: variant === 'ghost' ? colors.border : bg, borderWidth: 1 },
        pressed && { opacity: 0.75 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon}
      <AppText variant="label" color={fg} style={{ fontSize: 16, lineHeight: 24 }}>{loading ? t('common.saving') : label}</AppText>
    </Pressable>
  );
}

/* ---------- Inputs ---------- */
interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  helper?: string;
  suffix?: string;
  style?: StyleProp<ViewStyle>;
}
export function Input({ label, error, helper, suffix, style, editable = true, ...rest }: InputProps) {
  const [focus, setFocus] = React.useState(false);
  const border = error ? colors.error : focus ? colors.primary : colors.border;
  return (
    <View style={[{ gap: 6 }, style]}>
      <AppText variant="label" color={colors.textSecondary}>{label}</AppText>
      <View style={[styles.input, { borderColor: border, opacity: editable ? 1 : 0.5 }]}>
        <TextInput
          {...rest}
          editable={editable}
          accessibilityLabel={label}
          onFocus={(e) => { setFocus(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocus(false); rest.onBlur?.(e); }}
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          style={styles.inputText}
        />
        {!!suffix && <AppText variant="body" color={colors.textSecondary}>{suffix}</AppText>}
      </View>
      {!!error ? (
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }} accessibilityLiveRegion="polite">
          <CircleAlert size={14} color={colors.error} />
          <AppText variant="caption" color={colors.error} style={{ flex: 1 }}>{error}</AppText>
        </View>
      ) : !!helper ? (
        <AppText variant="caption" color={colors.textSecondary}>{helper}</AppText>
      ) : null}
    </View>
  );
}

export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress: () => void; icon?: React.ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[styles.chip, selected ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {icon}
      <AppText variant="label" color={selected ? colors.onPrimary : colors.text}>{label}</AppText>
    </Pressable>
  );
}
export const ChipRow = ({ children }: { children: React.ReactNode }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }} style={{ flexGrow: 0, marginHorizontal: -GUTTER }}>
    <View style={{ width: GUTTER - 8 }} />
    {children}
  </ScrollView>
);

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={styles.segmented} accessibilityRole="radiogroup">
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} accessibilityRole="radio" accessibilityState={{ selected: sel }} style={[styles.segment, sel && { backgroundColor: colors.primary }]}>
            <AppText variant="label" color={sel ? colors.onPrimary : colors.text}>{o.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- Cards, progress ---------- */
export const Card = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => <View style={[styles.card, style]}>{children}</View>;

export function ProgressBar({ label, value, max, unit = 'g', caption }: { label: string; value: number; max: number; unit?: string; caption?: string }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View style={{ gap: 6 }} accessible accessibilityLabel={`${label} ${Math.round(value)} / ${Math.round(max)} ${unit}`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText variant="label">{label}</AppText>
        <AppText variant="label" color={colors.textSecondary}>{Math.round(value)} / {Math.round(max)} {unit}</AppText>
      </View>
      <View style={styles.track}><View style={[styles.fill, { width: `${pct * 100}%` }]} /></View>
      {!!caption && <AppText variant="caption" color={colors.textSecondary}>{caption}</AppText>}
    </View>
  );
}

export function Skeleton({ height = 80, style }: { height?: number; style?: StyleProp<ViewStyle> }) {
  return <View accessibilityLabel="Loading" style={[{ height, borderRadius: radius.input, backgroundColor: colors.card }, style]} />;
}

/* ---------- States and banners ---------- */
export function ContentState({ kind, title, body, actionLabel, onAction, secondaryLabel, onSecondary }: {
  kind: 'empty' | 'error' | 'success' | 'loading' | 'info'; title: string; body?: string; actionLabel?: string; onAction?: () => void;
  secondaryLabel?: string; onSecondary?: () => void;
}) {
  const Icon = kind === 'error' ? CircleAlert : kind === 'success' ? CircleCheck : kind === 'loading' ? ActivityIndicator : Info;
  const tint = kind === 'error' ? colors.error : kind === 'success' ? colors.success : colors.primary;
  return (
    <View style={styles.state} accessibilityLiveRegion="polite">
      <View style={[styles.stateIcon, { backgroundColor: colors.surface }]}>
        {kind === 'loading' ? <ActivityIndicator color={colors.primary} /> : <Icon size={28} color={tint} />}
      </View>
      <AppText variant="section" align="center">{title}</AppText>
      {!!body && <AppText variant="body" color={colors.textSecondary} align="center">{body}</AppText>}
      {actionLabel && onAction && <Button label={actionLabel} onPress={onAction} style={{ alignSelf: 'stretch', marginTop: 8 }} />}
      {secondaryLabel && onSecondary && <Button label={secondaryLabel} variant="ghost" onPress={onSecondary} style={{ alignSelf: 'stretch' }} />}
    </View>
  );
}

export function Banner({ kind = 'info', text, actionLabel, onAction, secondaryLabel, onSecondary }: {
  kind?: 'info' | 'warning' | 'error' | 'offline'; text: string; actionLabel?: string; onAction?: () => void; secondaryLabel?: string; onSecondary?: () => void;
}) {
  const tint = kind === 'error' ? colors.error : kind === 'warning' ? colors.warning : colors.accent;
  const Icon = kind === 'offline' ? WifiOff : kind === 'info' ? Info : CircleAlert;
  return (
    <View style={[styles.banner, { borderColor: tint }]} accessibilityLiveRegion="polite">
      <Icon size={20} color={tint} />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="label">{text}</AppText>
        {(actionLabel || secondaryLabel) && (
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {actionLabel && <Pressable onPress={onAction} accessibilityRole="button" style={styles.linkBtn}><AppText variant="label" color={colors.primary}>{actionLabel}</AppText></Pressable>}
            {secondaryLabel && <Pressable onPress={onSecondary} accessibilityRole="button" style={styles.linkBtn}><AppText variant="label" color={colors.textSecondary}>{secondaryLabel}</AppText></Pressable>}
          </View>
        )}
      </View>
    </View>
  );
}

/* ---------- Stepper ---------- */
export function Stepper({ display, unit, hint, onDec, onInc, decDisabled, incDisabled, label }: {
  display: string; unit: string; hint?: string; onDec: () => void; onInc: () => void; decDisabled?: boolean; incDisabled?: boolean; label: string;
}) {
  const { t } = useSettings();
  return (
    <View style={{ alignItems: 'center', gap: 8 }} accessible accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ text: `${display} ${unit}` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => (e.nativeEvent.actionName === 'increment' ? onInc() : onDec())}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        <Pressable onPress={onDec} disabled={decDisabled} accessibilityRole="button" accessibilityLabel={t('common.decrease')} style={[styles.stepBtn, decDisabled && { opacity: 0.35 }]}><Minus size={22} color={colors.text} /></Pressable>
        <View style={{ alignItems: 'center', minWidth: 110 }}>
          <AppText variant="display" style={{ fontSize: 40, lineHeight: 48 }}>{display}</AppText>
          <AppText variant="label" color={colors.textSecondary}>{unit}</AppText>
        </View>
        <Pressable onPress={onInc} disabled={incDisabled} accessibilityRole="button" accessibilityLabel={t('common.increase')} style={[styles.stepBtn, incDisabled && { opacity: 0.35 }]}><Plus size={22} color={colors.text} /></Pressable>
      </View>
      {!!hint && <AppText variant="caption" color={colors.textSecondary}>{hint}</AppText>}
    </View>
  );
}

/* ---------- Bottom sheet ---------- */
export function BottomSheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const { reducedMotion, t } = useSettings();
  return (
    <Modal visible={visible} transparent animationType={reducedMotion ? 'none' : 'slide'} onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('common.close')} accessibilityRole="button"><View style={{ flex: 1, backgroundColor: colors.scrim }} /></Pressable>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
            <View style={styles.grab} />
            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export function ConfirmSheet({ visible, title, titleBn, body, confirmLabel, cancelLabel, danger, onConfirm, onCancel }: {
  visible: boolean; title: string; titleBn?: string; body: string; confirmLabel: string; cancelLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onCancel}>
      <AppText variant="section" accessibilityRole="header">{title}</AppText>
      {!!titleBn && <AppText variant="label" color={colors.textSecondary}>{titleBn}</AppText>}
      <AppText variant="body" color={colors.textSecondary}>{body}</AppText>
      <Button label={confirmLabel} variant={danger ? 'danger' : 'primary'} onPress={onConfirm} />
      <Button label={cancelLabel} variant="ghost" onPress={onCancel} />
    </BottomSheet>
  );
}

export const SectionHeader = ({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
    <AppText variant="section" accessibilityRole="header">{title}</AppText>
    {actionLabel && <Pressable onPress={onAction} accessibilityRole="button" style={styles.linkBtn}><AppText variant="label" color={colors.primary}>{actionLabel}</AppText></Pressable>}
  </View>
);

export const PendingDot = ({ label }: { label: string }) => (
  <View accessible accessibilityLabel={label} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.warning }} />
);

export function useOnFocusRefresh(fn: () => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => { ref.current(); }, []);
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  footer: { paddingHorizontal: GUTTER, paddingTop: 12, backgroundColor: colors.bg, gap: 8 },
  topBar: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  iconBtn: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center', marginLeft: -12 },
  btn: { minHeight: 56, borderRadius: radius.button, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20 },
  input: { minHeight: 56, borderRadius: radius.input, borderWidth: 1.5, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  inputText: { flex: 1, color: colors.text, fontSize: 16, fontFamily: 'Inter_400Regular', paddingVertical: 12 },
  chip: { minHeight: MIN_TOUCH, borderRadius: radius.pill, paddingHorizontal: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  segmented: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.pill, padding: 4 },
  segment: { flex: 1, minHeight: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.card, borderRadius: radius.card, padding: 20, gap: 12 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surface, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  state: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 24, alignItems: 'center', gap: 10 },
  stateIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  banner: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.input, borderWidth: 1, backgroundColor: colors.surface, alignItems: 'flex-start' },
  linkBtn: { minHeight: MIN_TOUCH, justifyContent: 'center' },
  stepBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, paddingHorizontal: 20, paddingTop: 12, gap: 12 },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 8 },
});

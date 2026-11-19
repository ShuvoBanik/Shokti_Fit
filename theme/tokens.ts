// Owner: Shared (led by Mahbub Hasnain) | shell
export const colors = {
  bg: '#101510',
  surface: '#191F19',
  card: '#222A23',
  border: '#2F3A30',
  primary: '#B8F34A',
  accent: '#83C85B',
  onPrimary: '#101510',
  text: '#FFFFFF',
  textSecondary: '#A6B0A3',
  muted: '#727C72',
  warning: '#FFB547',
  error: '#F06464',
  success: '#65CF8A',
  scrim: 'rgba(0,0,0,0.6)',
};
export const spacing = { xs: 4, sm: 8, md: 12, base: 16, lg: 24, xl: 32, xxl: 48 };
export const radius = { input: 12, button: 16, card: 24, sheet: 28, pill: 999 };
export const GUTTER = 20;
export const TAB_BAR_HEIGHT = 88;
export const MIN_TOUCH = 48;

export const fontFamily = {
  display: 'Manrope_800ExtraBold',
  title: 'Manrope_700Bold',
  body: 'Inter_400Regular',
  label: 'Inter_600SemiBold',
  bn: 'HindSiliguri_400Regular',
  bnBold: 'HindSiliguri_600SemiBold',
};

export type Variant = 'display' | 'screen' | 'section' | 'body' | 'label' | 'caption' | 'eyebrow';
export const typeScale: Record<Variant, { size: number; line: number; font: keyof typeof fontFamily; spacing?: number }> = {
  display: { size: 48, line: 56, font: 'display' },
  screen: { size: 24, line: 32, font: 'display' },
  section: { size: 20, line: 28, font: 'title' },
  body: { size: 16, line: 24, font: 'body' },
  label: { size: 14, line: 20, font: 'label' },
  caption: { size: 12, line: 18, font: 'body' },
  eyebrow: { size: 12, line: 18, font: 'label', spacing: 2 },
};

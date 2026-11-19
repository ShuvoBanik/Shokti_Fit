// Owner: Shared (led by Mahbub Hasnain) | shell
import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { colors, fontFamily, typeScale, Variant } from '../theme/tokens';

const BANGLA = /[\u0980-\u09FF]/;
const textOf = (c: React.ReactNode): string =>
  typeof c === 'string' ? c : Array.isArray(c) ? c.map(textOf).join('') : typeof c === 'number' ? String(c) : '';

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  align?: TextStyle['textAlign'];
}
/** Text with the design-system type scale. Bangla runs switch to Hind Siliguri automatically (never below 14 dp). */
export function AppText({ variant = 'body', color = colors.text, align, style, children, ...rest }: Props) {
  const v = typeScale[variant];
  const isBn = BANGLA.test(textOf(children));
  const bold = v.font === 'display' || v.font === 'title' || v.font === 'label';
  const size = isBn ? Math.max(14, v.size) : v.size;
  return (
    <Text
      {...rest}
      allowFontScaling
      style={[
        {
          color, fontSize: size, lineHeight: isBn ? Math.round(size * 1.5) : v.line, textAlign: align,
          fontFamily: isBn ? (bold ? fontFamily.bnBold : fontFamily.bn) : fontFamily[v.font],
          letterSpacing: v.spacing,
          textTransform: variant === 'eyebrow' && !isBn ? 'uppercase' : undefined,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// Owner: Shared (charts: Rafsan Zaman Abir, ring: Mahbub Hasnain) | F7, dashboard
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { AppText } from './AppText';

export function ProgressRing({ value, total, size = 176, stroke = 14, main, sub }: { value: number; total: number; size?: number; stroke?: number; main: string; sub: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityLabel={`${main}. ${sub}`}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surface} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.primary} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} />
      </Svg>
      <AppText variant="display" style={{ fontSize: 40, lineHeight: 48 }}>{main}</AppText>
      <AppText variant="caption" color={colors.textSecondary} align="center">{sub}</AppText>
    </View>
  );
}

export function WeightChart({ points, width = 320, height = 170, unit }: { points: { label: string; value: number }[]; width?: number; height?: number; unit: string }) {
  if (points.length === 0) return null;
  const padL = 44, padR = 12, padT = 12, padB = 26;
  const vals = points.map((p) => p.value);
  let min = Math.min(...vals), max = Math.max(...vals);
  if (max - min < 1) { min -= 0.5; max += 0.5; }
  const span = max - min;
  min -= span * 0.1; max += span * 0.1;
  const x = (i: number) => padL + (points.length === 1 ? (width - padL - padR) / 2 : (i * (width - padL - padR)) / (points.length - 1));
  const y = (v: number) => padT + ((max - v) / (max - min)) * (height - padT - padB);
  const ticks = [max, (max + min) / 2, min];
  const labelIdx = Array.from(new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]));
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} accessibilityLabel={points.map((p) => `${p.label}: ${p.value} ${unit}`).join(', ')}>
      {ticks.map((t, i) => (
        <React.Fragment key={i}>
          <Line x1={padL} x2={width - padR} y1={y(t)} y2={y(t)} stroke={colors.border} strokeWidth={1} strokeDasharray="3 4" />
          <SvgText x={padL - 6} y={y(t) + 4} fill={colors.textSecondary} fontSize={11} textAnchor="end">{t.toFixed(1)}</SvgText>
        </React.Fragment>
      ))}
      {points.length > 1 && <Polyline points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')} fill="none" stroke={colors.primary} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />}
      {points.map((p, i) => <Circle key={i} cx={x(i)} cy={y(p.value)} r={i === points.length - 1 ? 5 : 3} fill={colors.primary} />)}
      {labelIdx.map((i) => (
        <SvgText key={i} x={x(i)} y={height - 6} fill={colors.textSecondary} fontSize={11} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}>{points[i].label}</SvgText>
      ))}
    </Svg>
  );
}

export function CalorieBars({ days, target, width = 320, height = 170, unit }: { days: { label: string; value: number | null; highlight?: boolean }[]; target: number; width?: number; height?: number; unit: string }) {
  const padL = 8, padR = 8, padT = 18, padB = 24;
  const max = Math.max(target * 1.15, ...days.map((d) => d.value ?? 0));
  const bw = (width - padL - padR) / days.length;
  const y = (v: number) => padT + ((max - v) / max) * (height - padT - padB);
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} accessibilityLabel={days.map((d) => `${d.label}: ${d.value ?? '—'} ${unit}`).join(', ')}>
      <Line x1={padL} x2={width - padR} y1={y(target)} y2={y(target)} stroke={colors.accent} strokeWidth={1.5} strokeDasharray="5 4" />
      {days.map((d, i) => {
        const h = d.value ? (height - padT - padB) * (d.value / max) : 0;
        const cx = padL + i * bw + bw / 2;
        return (
          <React.Fragment key={i}>
            {d.value ? (
              <>
                <Rect x={cx - 11} y={height - padB - h} width={22} height={h} rx={6} fill={d.highlight ? colors.primary : colors.accent} opacity={d.highlight ? 1 : 0.6} />
                <SvgText x={cx} y={height - padB - h - 4} fill={colors.textSecondary} fontSize={10} textAnchor="middle">{Math.round(d.value)}</SvgText>
              </>
            ) : (
              <Rect x={cx - 11} y={height - padB - 3} width={22} height={3} rx={1.5} fill={colors.border} />
            )}
            <SvgText x={cx} y={height - 6} fill={d.highlight ? colors.text : colors.textSecondary} fontSize={11} textAnchor="middle">{d.label}</SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

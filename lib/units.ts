// Owner: Shared (led by Mahbub Hasnain) | shell
import type { Units } from './types';

const LB_PER_KG = 2.2046226218;
const CM_PER_IN = 2.54;
const ML_PER_FLOZ = 29.5735295625;

export const kgToLb = (kg: number) => kg * LB_PER_KG;
export const lbToKg = (lb: number) => lb / LB_PER_KG;
export const cmToIn = (cm: number) => cm / CM_PER_IN;
export const inToCm = (i: number) => i * CM_PER_IN;
export const mlToFlOz = (ml: number) => ml / ML_PER_FLOZ;

export const round1 = (n: number) => Math.round(n * 10) / 10;
export const fmtNum = (n: number, dec = 0) =>
  n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export const weightUnit = (u: Units) => (u === 'metric' ? 'kg' : 'lb');
export const heightUnit = (u: Units) => (u === 'metric' ? 'cm' : 'in');
export const waterUnit = (u: Units) => (u === 'metric' ? 'ml' : 'fl oz');

export const weightValue = (kg: number, u: Units) => (u === 'metric' ? round1(kg) : round1(kgToLb(kg)));
export const heightValue = (cm: number, u: Units) => (u === 'metric' ? Math.round(cm) : Math.round(cmToIn(cm)));
export const waterValue = (ml: number, u: Units) => (u === 'metric' ? Math.round(ml) : round1(mlToFlOz(ml)));

export const formatWeight = (kg: number, u: Units) => `${fmtNum(weightValue(kg, u), 1)} ${weightUnit(u)}`;
export const formatHeight = (cm: number, u: Units) => `${heightValue(cm, u)} ${heightUnit(u)}`;
export const formatWater = (ml: number, u: Units) =>
  u === 'metric' ? `${fmtNum(ml)} ml` : `${fmtNum(waterValue(ml, u), 1)} fl oz`;
/** Litres in metric ("1.75 L"), fl oz in imperial. */
export const formatWaterShort = (ml: number, u: Units) =>
  u === 'metric' ? `${Number((ml / 1000).toFixed(2))} L` : `${fmtNum(waterValue(ml, u), 0)} fl oz`;

/** Parse a user-typed value in display units into kg / cm; NaN if not a number. */
export const parseNumber = (s: string) => Number(s.trim().replace(',', '.'));
export const weightToKg = (v: number, u: Units) => (u === 'metric' ? v : lbToKg(v));
export const heightToCm = (v: number, u: Units) => (u === 'metric' ? v : inToCm(v));

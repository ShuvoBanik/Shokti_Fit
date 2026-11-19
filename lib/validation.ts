// Owner: Mahbub Hasnain (profile rules), Swarna Sikder (custom food), Rafsan Zaman Abir (weight) | F1, F6, F7
import type { Units } from './types';
import { heightToCm, parseNumber, weightToKg } from './units';

export const LIMITS = {
  age: { min: 16, max: 80 },
  heightCm: { min: 100, max: 250 },
  weightKg: { min: 30, max: 200 },
  waterGoalMl: { min: 1000, max: 6000 },
  nameMax: 60,
};

export interface ProfileFormValues {
  name: string;
  age: string;
  height: string;
  weight: string;
}
export type ProfileErrors = Partial<Record<'name' | 'age' | 'height' | 'weight', 'required' | 'range' | 'integer'>>;

export function validateProfileForm(v: ProfileFormValues, units: Units): ProfileErrors {
  const e: ProfileErrors = {};
  if (!v.name.trim()) e.name = 'required';
  const age = parseNumber(v.age);
  if (!v.age.trim()) e.age = 'required';
  else if (!Number.isFinite(age) || !Number.isInteger(age)) e.age = 'integer';
  else if (age < LIMITS.age.min || age > LIMITS.age.max) e.age = 'range';
  const h = parseNumber(v.height);
  if (!v.height.trim()) e.height = 'required';
  else if (!Number.isFinite(h)) e.height = 'range';
  else {
    const cm = heightToCm(h, units);
    if (cm < LIMITS.heightCm.min - 0.5 || cm > LIMITS.heightCm.max + 0.5) e.height = 'range';
  }
  const w = parseNumber(v.weight);
  if (!v.weight.trim()) e.weight = 'required';
  else if (!Number.isFinite(w)) e.weight = 'range';
  else {
    const kg = weightToKg(w, units);
    if (kg < LIMITS.weightKg.min - 0.05 || kg > LIMITS.weightKg.max + 0.05) e.weight = 'range';
  }
  return e;
}

export const isValidWeightKg = (kg: number) =>
  Number.isFinite(kg) && kg >= LIMITS.weightKg.min && kg <= LIMITS.weightKg.max;

export interface CustomFoodValues {
  name: string;
  serving: string;
  kcal: string;
  protein: string;
  carb: string;
  fat: string;
  source: string;
}
export type CustomFoodErrors = Partial<Record<keyof CustomFoodValues, 'required' | 'nonNegative' | 'positive'>>;

export function validateCustomFood(v: CustomFoodValues): CustomFoodErrors {
  const e: CustomFoodErrors = {};
  if (!v.name.trim()) e.name = 'required';
  if (!v.source.trim()) e.source = 'required';
  const serving = parseNumber(v.serving);
  if (!v.serving.trim()) e.serving = 'required';
  else if (!Number.isFinite(serving) || serving <= 0) e.serving = 'positive';
  (['kcal', 'protein', 'carb', 'fat'] as const).forEach((k) => {
    const n = parseNumber(v[k]);
    if (!v[k].trim()) e[k] = 'required';
    else if (!Number.isFinite(n) || n < 0) e[k] = 'nonNegative';
  });
  return e;
}

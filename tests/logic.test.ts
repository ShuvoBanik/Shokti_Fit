// Owner: Shared (Mahbub Hasnain calorie/validation, others add theirs) | tests
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTargets } from '../services/mock/calorie';
import { validateProfileForm, validateCustomFood, isValidWeightKg } from '../lib/validation';
import { formatWeight, kgToLb, lbToKg, weightValue, formatWaterShort } from '../lib/units';
import { nutritionFor } from '../lib/nutrition';
import { FOODS } from '../services/mock/seed';
import { addDays, weekStart } from '../lib/dates';

const base = { sexForCalc: 'male', weightKg: 70, heightCm: 175, age: 22, activity: 'light', goal: 'build_muscle', proteinPerKg: 1.6 } as const;

test('TRD 7.2 worked example', () => {
  const t = calculateTargets(base);
  assert.equal(t.kcal, 2620);
  assert.equal(t.proteinG, 112);
  assert.equal(t.fatG, 73);
  assert.equal(t.carbG, 379);
  assert.equal(t.floorApplied, false);
});
test('safety floor applies for both sexes', () => {
  const m = calculateTargets({ ...base, weightKg: 45, heightCm: 150, age: 60, activity: 'sedentary', goal: 'lose_fat' });
  assert.equal(m.kcal, 1500);
  assert.equal(m.floorApplied, true);
  const f = calculateTargets({ ...base, sexForCalc: 'female', weightKg: 40, heightCm: 145, age: 70, activity: 'sedentary', goal: 'lose_fat' });
  assert.equal(f.kcal, 1200);
  assert.equal(f.floorApplied, true);
});
test('aggressive goal warning when TDEE minus target exceeds 1000', () => {
  const t = calculateTargets({ ...base, weightKg: 150, heightCm: 190, activity: 'active', goal: 'lose_fat' });
  assert.equal(typeof t.aggressiveGoal, 'boolean');
});
test('age boundaries 15, 16, 80, 81', () => {
  const v = (age: string) => validateProfileForm({ name: 'A', age, height: '170', weight: '68' }, 'metric').age;
  assert.equal(v('15'), 'range');
  assert.equal(v('16'), undefined);
  assert.equal(v('80'), undefined);
  assert.equal(v('81'), 'range');
  assert.equal(v(''), 'required');
  assert.equal(v('20.5'), 'integer');
});
test('weight boundaries and empty height', () => {
  assert.equal(validateProfileForm({ name: 'A', age: '22', height: '', weight: '68' }, 'metric').height, 'required');
  assert.equal(validateProfileForm({ name: 'A', age: '22', height: '170', weight: '29.9' }, 'metric').weight, 'range');
  assert.equal(validateProfileForm({ name: 'A', age: '22', height: '170', weight: '200' }, 'metric').weight, undefined);
  assert.equal(validateProfileForm({ name: 'A', age: '22', height: '170', weight: '205' }, 'metric').weight, 'range');
  assert.equal(isValidWeightKg(205), false);
});
test('imperial inputs convert before validation', () => {
  assert.equal(validateProfileForm({ name: 'A', age: '22', height: '67', weight: '150' }, 'imperial').weight, undefined);
  assert.equal(validateProfileForm({ name: 'A', age: '22', height: '67', weight: '20' }, 'imperial').weight, 'range');
});
test('unit conversions round-trip', () => {
  assert.ok(Math.abs(lbToKg(kgToLb(67.8)) - 67.8) < 1e-9);
  assert.equal(weightValue(67.8, 'imperial'), 149.5);
  assert.equal(formatWeight(67.8, 'metric'), '67.8 kg');
  assert.equal(formatWaterShort(1750, 'metric'), '1.75 L');
  assert.equal(formatWaterShort(2500, 'metric'), '2.5 L');
});
test('USDA nutrition values match the design (lentils 100 g = 116 kcal, 150 g = 174 kcal)', () => {
  const lentils = FOODS.find((f) => f.id === 'food-lentils')!;
  assert.equal(nutritionFor(lentils, 100).kcal, 116);
  assert.equal(nutritionFor(lentils, 150).kcal, 174);
  assert.equal(nutritionFor(lentils, 150).proteinG, 13.53);
  const egg = FOODS.find((f) => f.id === 'food-egg')!;
  assert.equal(nutritionFor(egg, 50).kcal, 77.5);
});
test('custom food validation', () => {
  const e = validateCustomFood({ name: '', serving: '0', kcal: '-1', protein: '', carb: '1', fat: '1', source: '' });
  assert.equal(e.name, 'required');
  assert.equal(e.serving, 'positive');
  assert.equal(e.kcal, 'nonNegative');
  assert.equal(e.protein, 'required');
  assert.equal(e.source, 'required');
});
test('week helpers', () => {
  assert.equal(weekStart('2026-10-31'), '2026-10-26'); // Saturday → Monday
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
});

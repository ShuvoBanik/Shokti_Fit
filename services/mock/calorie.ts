// Owner: Mahbub Hasnain | F1
/**
 * Calorie and macro algorithm — mirrors TRD section 7.
 * In the final phase this runs on the server (services/calorie.ts); the app only displays results.
 * Constants must be cited to a published guideline in the README (Mifflin–St Jeor 1990; activity factors).
 */
import type { Activity, Goal, Profile, SexForCalc, Targets } from '../../lib/types';

export const ACTIVITY_FACTOR: Record<Activity, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
export const GOAL_ADJUSTMENT: Record<Goal, number> = { lose_fat: -500, build_muscle: 300, stay_fit: 0 };
export const FLOOR_KCAL: Record<SexForCalc, number> = { male: 1500, female: 1200 };

export function bmr(sex: SexForCalc, weightKg: number, heightCm: number, age: number) {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
}

export function calculateTargets(p: Pick<Profile, 'sexForCalc' | 'weightKg' | 'heightCm' | 'age' | 'activity' | 'goal' | 'proteinPerKg'>): Targets {
  const tdee = bmr(p.sexForCalc, p.weightKg, p.heightCm, p.age) * ACTIVITY_FACTOR[p.activity];
  const raw = Math.round((tdee + GOAL_ADJUSTMENT[p.goal]) / 10) * 10;
  const floor = FLOOR_KCAL[p.sexForCalc];
  const kcal = Math.max(raw, floor);
  const protein = p.proteinPerKg * p.weightKg;
  const fat = (0.25 * kcal) / 9;
  const carbs = Math.max(0, (kcal - protein * 4 - fat * 9) / 4);
  return {
    kcal,
    proteinG: Math.round(protein),
    fatG: Math.round(fat),
    carbG: Math.round(carbs),
    floorApplied: kcal !== raw,
    aggressiveGoal: tdee - kcal > 1000,
  };
}

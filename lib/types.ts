// Owner: Shared (led by Mahbub Hasnain) | shell
export type Gender = 'female' | 'male' | 'self' | 'none';
export type SexForCalc = 'female' | 'male';
export type Goal = 'lose_fat' | 'build_muscle' | 'stay_fit';
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type SessionStatus = 'in_progress' | 'completed' | 'partial';
export type Language = 'en' | 'bn';
export type Units = 'metric' | 'imperial';

export interface Profile {
  displayName: string;
  gender: Gender;
  sexForCalc: SexForCalc;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  activity: Activity;
  proteinPerKg: number;
}
export type ProfileInput = Profile;

export interface Targets {
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  floorApplied: boolean;
  aggressiveGoal: boolean;
}

export interface Food {
  id: string;
  nameEn: string;
  nameBn: string;
  aliases: string[];
  category: string;
  servingLabel: string;
  servingG: number;
  /** grams the list row quotes its per-amount energy for (100 g, or 50 g for an egg) */
  listBasisG: number;
  kcal100: number;
  protein100: number;
  carb100: number;
  fat100: number;
  source: string;
  sourceUrl?: string;
  note?: string;
  custom?: boolean;
}
export type NewCustomFood = Omit<Food, 'id' | 'custom' | 'aliases' | 'nameBn' | 'category' | 'listBasisG'>;

export interface Meal {
  id: string;
  clientId: string;
  foodId: string;
  foodNameEn: string;
  foodNameBn: string;
  mealType: MealType;
  logDate: string;
  grams: number;
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  pending?: boolean;
}
export type NewMeal = Omit<Meal, 'id' | 'pending'>;

export interface Exercise {
  id: string;
  position: number;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  bodyweightOption?: string;
  cue?: string;
  targetKg?: number;
}
export interface Workout {
  id: string;
  nameEn: string;
  nameBn: string;
  taglineBn: string;
  level: Level;
  durationMin: number;
  equipmentRequired: boolean;
  equipmentNote: string;
  description: string;
  tags: string[];
  exercises: Exercise[];
}

export interface SessionSet {
  exerciseId: string;
  setNumber: number;
  repsDone: number;
  weightKg?: number;
  completed: boolean;
}
export interface Session {
  id: string;
  clientId: string;
  workoutId: string;
  workoutName: string;
  status: SessionStatus;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  sets: SessionSet[];
  exercisesCount: number;
}

export interface WeightEntry {
  id: string;
  entryDate: string;
  weightKg: number;
  pending?: boolean;
}
export interface WaterDay {
  logDate: string;
  amountMl: number;
  clientUpdatedAt: string;
}

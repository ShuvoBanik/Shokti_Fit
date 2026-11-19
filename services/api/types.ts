// Owner: Shared (led by Mahbub Hasnain) | shell
import type {
  Food, Level, Meal, NewCustomFood, NewMeal, Profile, ProfileInput, Session, SessionSet, Targets,
  WaterDay, WeightEntry, Workout,
} from '../../lib/types';

/**
 * The only surface the UI talks to. `mock/` implements it in memory for the midterm;
 * `http.ts` implements it against the Express server (TRD section 6) for the final phase.
 */
export interface Api {
  profiles: {
    create(p: ProfileInput): Promise<{ profile: Profile; targets: Targets; token: string }>;
    get(): Promise<{ profile: Profile; targets: Targets }>;
    update(p: Partial<Profile>): Promise<{ profile: Profile; targets: Targets }>;
    remove(): Promise<void>;
  };
  workouts: {
    list(q: { level?: Level; noEquipment?: boolean; tag?: string }): Promise<Workout[]>;
    get(id: string): Promise<Workout>;
  };
  sessions: {
    start(b: { clientId: string; workoutId: string; startedAt: string }): Promise<Session>;
    finish(id: string, b: { status: 'completed' | 'partial'; endedAt: string; durationSeconds: number; sets: SessionSet[] }): Promise<Session>;
    list(): Promise<Session[]>;
  };
  foods: {
    search(q: string, category?: string): Promise<Food[]>;
    get(id: string): Promise<Food>;
    createCustom(f: NewCustomFood): Promise<Food>;
  };
  meals: {
    create(m: NewMeal): Promise<Meal>;
    listByDate(date: string): Promise<Meal[]>;
    listRange(from: string, to: string): Promise<Meal[]>;
    remove(id: string): Promise<void>;
  };
  weights: {
    list(from?: string, to?: string): Promise<WeightEntry[]>;
    upsert(entryDate: string, weightKg: number): Promise<WeightEntry>;
  };
  water: {
    get(date: string): Promise<WaterDay>;
    put(date: string, amountMl: number, clientUpdatedAt: string): Promise<WaterDay>;
  };
}

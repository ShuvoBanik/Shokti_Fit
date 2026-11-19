// Owner: Shuvrata Banik Shuvo | F3, F4
/** Workout reference data for the mock API (F3/F4, Shuvrata). Team-written; must be safety-reviewed before release (TRD 9.4). */
import type { Workout } from '../../../lib/types';

const ex = (id: string, position: number, name: string, sets: number, reps: string, restSeconds: number, bodyweightOption?: string, targetKg?: number, cue?: string) =>
  ({ id, position, name, sets, reps, restSeconds, bodyweightOption, targetKg, cue });

const CUE = 'Chest tall. Move slowly. Try air squats without weights if you prefer.';

export const WORKOUTS: Workout[] = [
  {
    id: 'w-foundations', nameEn: 'Full body foundations', nameBn: 'পূর্ণ শরীরের ভিত্তি', taglineBn: 'ঘরে বা জিমে, আপনার মতো করে',
    level: 'beginner', durationMin: 30, equipmentRequired: false, equipmentNote: 'Dumbbells optional',
    description: 'Use light dumbbells if comfortable, or follow the bodyweight options. Warm up for 3 minutes.',
    tags: ['Strength', 'Full Body'],
    exercises: [
      ex('e-f1', 1, 'Goblet squat', 4, '12', 60, 'Air squat', 8, CUE),
      ex('e-f2', 2, 'Bent-over row', 3, '12', 60, 'Prone W raise', 6),
      ex('e-f3', 3, 'Incline push up', 3, '10', 60, 'Use a stable wall or bench'),
      ex('e-f4', 4, 'Reverse lunge', 3, '10 each side', 60),
      ex('e-f5', 5, 'Glute bridge', 3, '12', 60),
      ex('e-f6', 6, 'Forearm plank', 3, '30 sec', 45),
    ],
  },
  {
    id: 'w-after-class', nameEn: 'Stronger after class', nameBn: 'ক্লাসের পরে আরও শক্তিশালী', taglineBn: 'আজ একটু বেশি শক্তি',
    level: 'beginner', durationMin: 25, equipmentRequired: false, equipmentNote: 'No equipment',
    description: 'A bodyweight session for a hostel room. Stop if you feel pain or dizziness.',
    tags: ['Strength', 'Home', 'Full Body'],
    exercises: [
      ex('e-a1', 1, 'Air squat', 3, '12', 60),
      ex('e-a2', 2, 'Incline push up', 3, '10', 60, 'Use a stable wall or bench'),
      ex('e-a3', 3, 'Glute bridge', 3, '12', 60),
      ex('e-a4', 4, 'Reverse lunge', 3, '8 each side', 60),
      ex('e-a5', 5, 'Dead bug', 3, '8 each side', 45),
      ex('e-a6', 6, 'Forearm plank', 3, '30 sec', 45),
    ],
  },
  {
    id: 'w-home-reset', nameEn: 'Home reset', nameBn: 'ঘরে রিসেট', taglineBn: 'অল্প সময়, সহজ গতি',
    level: 'beginner', durationMin: 20, equipmentRequired: false, equipmentNote: 'No equipment',
    description: 'A short, gentle routine to get moving. Go at your own pace.',
    tags: ['Home', 'Cardio', 'Core'],
    exercises: [
      ex('e-h1', 1, 'March in place', 3, '45 sec', 30),
      ex('e-h2', 2, 'Air squat', 2, '10', 45),
      ex('e-h3', 3, 'Wall push up', 2, '10', 45),
      ex('e-h4', 4, 'Glute bridge', 2, '12', 45),
      ex('e-h5', 5, 'Forearm plank', 3, '20 sec', 30),
    ],
  },
  {
    id: 'w-strength-int', nameEn: 'Full body strength', nameBn: 'পূর্ণ শরীরের শক্তি', taglineBn: 'নিয়ন্ত্রণ নিয়ে, ধাপে ধাপে',
    level: 'intermediate', durationMin: 40, equipmentRequired: true, equipmentNote: 'Dumbbells required',
    description: 'Moderate loads with steady tempo. Choose a weight you can control for every rep.',
    tags: ['Strength', 'Full Body'],
    exercises: [
      ex('e-i1', 1, 'Goblet squat', 4, '10', 75, 'Air squat', 12),
      ex('e-i2', 2, 'One-arm dumbbell row', 4, '10 each side', 75, undefined, 10),
      ex('e-i3', 3, 'Push up', 3, '12', 60, 'Incline push up'),
      ex('e-i4', 4, 'Dumbbell Romanian deadlift', 3, '10', 75, undefined, 10),
      ex('e-i5', 5, 'Forearm plank', 3, '45 sec', 45),
    ],
  },
];

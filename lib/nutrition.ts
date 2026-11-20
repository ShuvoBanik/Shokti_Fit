// Owner: Swarna Sikder | F5, F6
import type { Food } from './types';

const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;

export function nutritionFor(food: Food, grams: number) {
  const f = grams / 100;
  return {
    kcal: r1(food.kcal100 * f),
    proteinG: r2(food.protein100 * f),
    carbG: r2(food.carb100 * f),
    fatG: r2(food.fat100 * f),
  };
}

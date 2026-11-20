// Owner: Swarna Sikder | F5, F6
/**
 * Food reference data for the mock API (F5/F6, Swarna). Values come ONLY from the USDA FoodData Central / SR Legacy
 * records quoted in the design files. Nothing here is invented. Add more foods only from a cited table (TRD 9.4).
 */
import type { Food } from '../../../lib/types';

export const FOODS: Food[] = [
  {
    id: 'food-rice', nameEn: 'Cooked white rice', nameBn: 'ভাত', aliases: ['bhat', 'bhaat', 'rice', 'chal', 'ভাত'],
    category: 'Staples', servingLabel: '1 plate (150 g)', servingG: 150, listBasisG: 100,
    kcal100: 130, protein100: 2.69, carb100: 28.17, fat100: 0.28,
    source: 'USDA FoodData Central, SR Legacy, NDB 20445',
    sourceUrl: 'https://www.ars.usda.gov/ARSUserFiles/80400535/Data/SR/SR28/reports/sr28fg20.pdf',
    note: 'Cooked long-grain white rice. Weigh cooked portions.',
  },
  {
    id: 'food-lentils', nameEn: 'Boiled lentils', nameBn: 'সেদ্ধ ডাল', aliases: ['dal', 'daal', 'dhal', 'masoor', 'ডাল'],
    category: 'Staples', servingLabel: '1 bowl (100 g)', servingG: 100, listBasisG: 100,
    kcal100: 116, protein100: 9.02, carb100: 20.13, fat100: 0.38,
    source: 'USDA FoodData Central, FDC 172421',
    sourceUrl: 'https://fdc.nal.usda.gov/food-details/172421/nutrients',
    note: 'Plain boiled lentils, not curry. Oil and seasoning change nutrition.',
  },
  {
    id: 'food-egg', nameEn: 'Hard-boiled egg', nameBn: 'সিদ্ধ ডিম', aliases: ['egg', 'dim', 'anda', 'ডিম'],
    category: 'Protein', servingLabel: '1 egg (50 g)', servingG: 50, listBasisG: 50,
    kcal100: 155, protein100: 12.58, carb100: 1.12, fat100: 10.61,
    source: 'USDA FoodData Central, FDC 173424',
    sourceUrl: 'https://fdc.nal.usda.gov/food-details/173424/nutrients',
    note: 'One egg is about 50 g.',
  },
  {
    id: 'food-banana', nameEn: 'Banana, raw', nameBn: 'কলা', aliases: ['banana', 'kola', 'kala', 'কলা'],
    category: 'Fruit', servingLabel: '1 medium (118 g)', servingG: 118, listBasisG: 100,
    kcal100: 89, protein100: 1.09, carb100: 22.84, fat100: 0.33,
    source: 'USDA FoodData Central, SR Legacy, NDB 09040',
    note: 'Raw banana.',
  },
];

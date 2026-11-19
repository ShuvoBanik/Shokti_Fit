// Owner: Shared (led by Mahbub Hasnain) | shell
import { en, Key } from './en';
import { bn } from './bn';
import type { Language } from '../lib/types';

export type { Key };
export type TFn = (key: Key, params?: Record<string, string | number>) => string;


/** Interpolates {name} params. Data values stay in 0–9 per the design's language rules; only static Bangla copy uses Bangla digits. */
export const makeT = (lang: Language): TFn => (key, params) => {
  const dict: Record<string, string> = lang === 'bn' ? bn : en;
  let s = dict[key] ?? en[key] ?? key;
  if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
  return s;
};

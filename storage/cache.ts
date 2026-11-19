// Owner: Shared (led by Mahbub Hasnain) | shell
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export async function writeJson(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* cache is best-effort */
  }
}
export const removeKey = (key: string) => AsyncStorage.removeItem(key).catch(() => {});
export const clearAllCache = () => AsyncStorage.clear().catch(() => {});

export const KEYS = {
  settings: 'sf.settings.v1',
  profile: 'sf.profile.v1',
  mockDb: 'sf.mockdb.v1',
  outbox: 'sf.outbox.v1',
  waterEntries: (date: string) => `sf.water.entries.${date}`,
};

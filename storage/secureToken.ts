// Owner: Shared (led by Mahbub Hasnain) | shell
import * as SecureStore from 'expo-secure-store';

const KEY = 'sf.device.token';
/** Device bearer token only (TRD 9.1). Never written to AsyncStorage or logs. */
export const secureToken = {
  get: () => SecureStore.getItemAsync(KEY).catch(() => null),
  set: (t: string) => SecureStore.setItemAsync(KEY, t).catch(() => {}),
  clear: () => SecureStore.deleteItemAsync(KEY).catch(() => {}),
};

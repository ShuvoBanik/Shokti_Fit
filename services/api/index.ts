// Owner: Shared (led by Mahbub Hasnain) | shell
import type { Api } from './types';
import { mockApi } from '../mock';
import { httpApi } from './http';

/** Flip EXPO_PUBLIC_USE_MOCK=false (final phase) to talk to the Express server. No screen code changes. */
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';
export const api: Api = USE_MOCK ? mockApi : httpApi;
export { ApiError } from './errors';

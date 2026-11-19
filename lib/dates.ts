// Owner: Shared (led by Mahbub Hasnain) | shell
import type { Language } from './types';

const pad = (n: number) => String(n).padStart(2, '0');
export const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayStr = () => toDateStr(new Date());
export const parseDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (s: string, n: number) => {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
};
export const daysBetween = (a: string, b: string) =>
  Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / 86400000);
/** Monday of the week containing s */
export const weekStart = (s: string) => {
  const d = parseDate(s);
  const dow = (d.getDay() + 6) % 7;
  return addDays(s, -dow);
};

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  bn: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
};
const WEEKDAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  bn: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'],
};
export const WEEKDAY_INITIALS = {
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  bn: ['সো', 'ম', 'বু', 'বৃ', 'শু', 'শ', 'র'],
};

export const monthName = (s: string, lang: Language, short = false) => {
  const full = MONTHS[lang][parseDate(s).getMonth()];
  return short && lang === 'en' ? full.slice(0, 3) : full;
};
export const formatDay = (s: string, lang: Language, short = true) => `${parseDate(s).getDate()} ${monthName(s, lang, short)}`;
export const formatLong = (s: string, lang: Language) => `${parseDate(s).getDate()} ${monthName(s, lang)} ${parseDate(s).getFullYear()}`;
export const formatWeekdayDate = (s: string, lang: Language) =>
  `${WEEKDAYS[lang][parseDate(s).getDay()]}, ${parseDate(s).getDate()} ${monthName(s, lang)}`;
export const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const formatClock = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
};
export const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

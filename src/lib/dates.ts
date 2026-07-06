/** 날짜 키는 항상 로컬 타임존 기준 'YYYY-MM-DD' */
export type DateKey = string;

export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): DateKey {
  return toDateKey(new Date());
}

/** month: 1~12 */
export function makeDateKey(year: number, month: number, day: number): DateKey {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** month: 1~12 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function isFutureDate(key: DateKey): boolean {
  return key > todayKey();
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** 'YYYY-MM-DD' → { year, month, day } */
export function parseDateKey(key: DateKey): { year: number; month: number; day: number } {
  const [y, m, d] = key.split('-').map(Number);
  return { year: y, month: m, day: d };
}

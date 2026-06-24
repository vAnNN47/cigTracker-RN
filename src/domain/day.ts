/**
 * Date helpers. A "day key" is local midnight of a date. We build it with the
 * local Date constructor (new Date(y, m, d)) so it never drifts across timezones.
 */

/** Local midnight of the given date — a stable day key. */
export function keyOf(dt: Date): Date {
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

/** Local "today" as a day key. */
export function today(): Date {
  return keyOf(new Date());
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Add (or subtract, with negative n) whole days to a day key. */
export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** Stable "YYYY-MM-DD" string for use as a Map key. */
export function dayKey(dt: Date): string {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Inclusive list of day keys between from and to. */
export function range(from: Date, to: Date): Date[] {
  const start = keyOf(from);
  const end = keyOf(to);
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    days.push(d);
  }
  return days;
}

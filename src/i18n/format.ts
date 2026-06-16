/** Date/time formatting helpers (replace Flutter's intl DateFormat). */

/** "Monday, 16 Jun" — matches DateFormat('EEEE, d MMM'). */
export function formatWeekdayDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(date);
}

/** "HH:mm" 24-hour — matches DateFormat('HH:mm'). */
export function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

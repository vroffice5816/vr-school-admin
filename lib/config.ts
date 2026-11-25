export const SCHOOL_NAME = 'Vedic Roots Montessori Academy';
export const SCHOOL_TIMEZONE = process.env.SCHOOL_TIMEZONE ?? 'America/Toronto';

/** School logo. Put the file in /public with this name (or change the path here). */
export const LOGO_SRC = '/vr-logo-black.png';

export function formatToday(): string {
  return new Date().toLocaleDateString('en-CA', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: SCHOOL_TIMEZONE,
  });
}

/** YYYY-MM-DD in the school's time zone (for file names). */
export function todayIsoDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: SCHOOL_TIMEZONE });
}

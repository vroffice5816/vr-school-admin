import type { FacetKey, Filters, MediaReleaseStatus, Student } from './types';

export type { MediaReleaseStatus } from './types';

export const EMPTY_FILTERS: Filters = { query: '', location: [], room: [], grade: [], media: [] };

export type Parent = { name: string; phone: string | null; email: string | null };

const clean = (v: string | null | undefined) => (v?.trim() ? v.trim() : null);

/** Both parent slots, always length 2, so print columns line up. `null` = slot is empty. */
export function getParentSlots(s: Student): [Parent | null, Parent | null] {
  const slot = (name: string | null, phone: string | null, email: string | null, i: number): Parent | null => {
    const n = clean(name);
    const p = clean(phone);
    const e = clean(email);
    return n || p || e ? { name: n ?? `Parent ${i}`, phone: p, email: e } : null;
  };
  return [
    slot(s.parent_1_name, s.parent_1_phone, s.parent_1_email, 1),
    slot(s.parent_2_name, s.parent_2_phone, s.parent_2_email, 2),
  ];
}

export function getParents(s: Student): Parent[] {
  return getParentSlots(s).filter((p): p is Parent => p !== null);
}

/** 4165550123 -> 416-555-0123 (anything unusual is shown as entered). */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const d = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : raw;
}

export function phoneHref(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `tel:+${digits}`;
  return `tel:${digits}`;
}

export function getEmails(s: Student): string[] {
  return getParents(s).flatMap((p) => (p.email ? [p.email] : []));
}

export function mediaReleaseStatus(s: Student): MediaReleaseStatus {
  const v = (s.media_release ?? '').trim().toLowerCase();
  if (!v) return 'missing';
  if (['yes', 'y', 'true'].includes(v)) return 'yes';
  if (['no', 'n', 'false'].includes(v)) return 'no';
  return 'other';
}

export function mediaReleaseLabel(s: Student): string {
  const status = mediaReleaseStatus(s);
  if (status === 'yes') return 'Yes';
  if (status === 'no') return 'No';
  if (status === 'missing') return 'Not on file';
  return s.media_release ?? '';
}

/** JK, SK, Grade 1 … Grade 8, then anything else alphabetically. */
export function gradeRank(grade: string): number {
  const g = grade.trim().toUpperCase();
  if (g === 'JK') return -2;
  if (g === 'SK') return -1;
  const n = g.match(/\d+/);
  return n ? Number(n[0]) : 100;
}

export function compareGrades(a: string, b: string): number {
  return gradeRank(a) - gradeRank(b) || a.localeCompare(b);
}

const lower = (v: string | null | undefined) => (v ?? '').trim().toLowerCase();

/** The value a student has for a filter group (media release uses its normalised status). */
export function facetValue(s: Student, key: FacetKey): string {
  return key === 'media' ? mediaReleaseStatus(s) : (s[key] ?? '');
}

function matchesQuery(s: Student, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const parents = getParents(s);
  const text = [s.full_legal_name, ...parents.map((p) => p.name), ...getEmails(s)].join(' ').toLowerCase();
  if (text.includes(q)) return true;
  // Phone search ignores formatting: "416 555" matches "4165550192".
  const qDigits = q.replace(/\D/g, '');
  return qDigits.length >= 3 && parents.some((p) => (p.phone ?? '').replace(/\D/g, '').includes(qDigits));
}

const FACETS: FacetKey[] = ['location', 'room', 'grade', 'media'];

/**
 * Apply every filter. Within a group any selected option matches (OR); groups combine (AND).
 * `ignore` skips one group, which is how option counts are worked out.
 */
export function filterStudents(students: Student[], f: Filters, ignore?: FacetKey): Student[] {
  const active = FACETS.filter((k) => k !== ignore && f[k].length > 0).map(
    (k) => [k, new Set((f[k] as string[]).map(lower))] as const,
  );
  return students.filter(
    (s) => active.every(([k, set]) => set.has(lower(facetValue(s, k)))) && matchesQuery(s, f.query),
  );
}

/** How many students each option of a group would show, given all the other filters. */
export function facetCounts(students: Student[], f: Filters, key: FacetKey): Map<string, number> {
  const counts = new Map<string, number>();
  for (const s of filterStudents(students, f, key)) {
    const v = lower(facetValue(s, key));
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return counts;
}

export function toggleFacet<K extends FacetKey>(f: Filters, key: K, value: Filters[K][number]): Filters {
  const list = f[key] as string[];
  const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  return { ...f, [key]: next };
}

export function isFiltered(f: Filters): boolean {
  return f.query.trim() !== '' || FACETS.some((k) => f[k].length > 0);
}

/** Unique parent emails of the given students of the given students (lower-cased, in list order). */
export function collectEmails(students: Student[]): string[] {
  return [...new Set(students.flatMap(getEmails).map((e) => e.toLowerCase()))];
}

export function uniqueValues(students: Student[], key: 'location' | 'room' | 'grade'): string[] {
  const values = [...new Set(students.map((s) => s[key]).filter((v): v is string => Boolean(v)))];
  return key === 'grade' ? values.sort(compareGrades) : values.sort((a, b) => a.localeCompare(b));
}

/** Sort by classroom, then student name. */
export function sortStudents(students: Student[]): Student[] {
  return [...students].sort(
    (a, b) =>
      (a.room ?? '￿').localeCompare(b.room ?? '￿') ||
      (a.full_legal_name ?? '').localeCompare(b.full_legal_name ?? ''),
  );
}

export type RoomGroup = { room: string; location: string | null; students: Student[] };

/** Students grouped by classroom (already sorted), so multi-room sheets get a heading per room. */
export function groupByRoom(students: Student[]): RoomGroup[] {
  const groups: RoomGroup[] = [];
  for (const s of sortStudents(students)) {
    const room = s.room ?? 'No classroom';
    const last = groups[groups.length - 1];
    if (last && last.room === room) last.students.push(s);
    else groups.push({ room, location: s.location, students: [s] });
  }
  return groups;
}

/** Classroom + campus labels shown at the top of the sheet. */
export function getSheetContextLabels(
  filtered: Student[],
  filters: Filters,
  divisionName: string,
): { classroomLabel: string; locationLabel: string } {
  const rooms = uniqueValues(filtered, 'room');
  const locations = uniqueValues(filtered, 'location');

  const classroomLabel =
    rooms.length === 1 ? (rooms[0] as string) : filters.room.length > 0 ? filters.room.join(', ') : divisionName;

  const locationLabel = locations.length > 0 ? locations.join(' & ') : 'All campuses';

  return { classroomLabel, locationLabel };
}

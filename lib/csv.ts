import { getParentSlots, mediaReleaseLabel, sortStudents } from './students';
import type { Student } from './types';

const HEADERS = [
  'Student Name',
  'Age',
  'Grade',
  'Classroom',
  'Campus',
  'Parent 1',
  'Parent 1 Phone',
  'Parent 1 Email',
  'Parent 2',
  'Parent 2 Phone',
  'Parent 2 Email',
  'Media Release',
];

/** Quote a cell and neutralise spreadsheet formula injection (=, +, -, @). */
export function csvCell(value: unknown): string {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function studentsToCsv(students: Student[]): string {
  const rows = sortStudents(students).map((s) => {
    const [p1, p2] = getParentSlots(s);
    return [
      s.full_legal_name,
      s.age,
      s.grade,
      s.room,
      s.location,
      p1?.name, p1?.phone, p1?.email,
      p2?.name, p2?.phone, p2?.email,
      mediaReleaseLabel(s),
    ];
  });
  // BOM so Excel reads UTF-8 names correctly.
  return '﻿' + [HEADERS, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
}

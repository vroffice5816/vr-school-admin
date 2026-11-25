import { describe, expect, it } from 'vitest';
import { csvCell, studentsToCsv } from '@/lib/csv';
import { DEMO_ACCESS, DEMO_STUDENTS, demoStudentsFor } from '@/lib/demo';
import {
  collectEmails,
  compareGrades,
  EMPTY_FILTERS,
  facetCounts,
  filterStudents,
  formatPhone,
  getEmails,
  getParentSlots,
  getSheetContextLabels,
  groupByRoom,
  isFiltered,
  mediaReleaseLabel,
  mediaReleaseStatus,
  phoneHref,
  toggleFacet,
  uniqueValues,
} from '@/lib/students';
import type { Student } from '@/lib/types';

const student = (patch: Partial<Student> = {}): Student => ({
  id: 's1',
  full_legal_name: 'Liam Alexander Chen',
  age: '4Y, 7M',
  grade: 'JK',
  location: 'Brookside Campus',
  room: 'Kindergarten 1',
  parent_1_name: 'Marcus Chen',
  parent_1_phone: '4165550192',
  parent_1_email: 'marcus@example.com',
  parent_2_name: 'Sarah Chen',
  parent_2_phone: '416-555-0193',
  parent_2_email: null,
  media_release: 'YES',
  ...patch,
});

describe('csv', () => {
  it('quotes and escapes cells', () => {
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
  });
  it('neutralises spreadsheet formula injection', () => {
    expect(csvCell('=HYPERLINK("x")').startsWith(`"'=`)).toBe(true);
    expect(csvCell('@cmd').startsWith(`"'@`)).toBe(true);
  });
  it('has separate parent columns including emails, one row per student', () => {
    const csv = studentsToCsv([student()]);
    const [header, row] = csv.replace('﻿', '').split('\r\n');
    expect(header).toContain('"Parent 1 Email"');
    expect(row).toBe(
      '"Liam Alexander Chen","4Y, 7M","JK","Kindergarten 1","Brookside Campus","Marcus Chen","4165550192","marcus@example.com","Sarah Chen","416-555-0193","","Yes"',
    );
    expect(studentsToCsv(DEMO_STUDENTS).split('\r\n')).toHaveLength(DEMO_STUDENTS.length + 1);
  });
});

describe('parents and phones', () => {
  it('keeps two parent slots so print columns line up', () => {
    const [p1, p2] = getParentSlots(student({ parent_1_name: null, parent_1_phone: null, parent_1_email: null }));
    expect(p1).toBeNull();
    expect(p2?.name).toBe('Sarah Chen');
  });
  it('names a parent with only a phone number', () => {
    expect(getParentSlots(student({ parent_2_name: ' ' }))[1]?.name).toBe('Parent 2');
  });
  it('formats phone numbers and call links', () => {
    expect(formatPhone('4165550123')).toBe('416-555-0123');
    expect(formatPhone('1-416-555-0123')).toBe('416-555-0123');
    expect(formatPhone('ext 12')).toBe('ext 12');
    expect(phoneHref('416-555-0123')).toBe('tel:+14165550123');
  });
  it('lists emails', () => {
    expect(getEmails(student())).toEqual(['marcus@example.com']);
  });
});

describe('media release', () => {
  it('reads common spellings', () => {
    expect(mediaReleaseStatus(student())).toBe('yes');
    expect(mediaReleaseStatus(student({ media_release: 'n' }))).toBe('no');
    expect(mediaReleaseStatus(student({ media_release: null }))).toBe('missing');
    expect(mediaReleaseLabel(student({ media_release: '' }))).toBe('Not on file');
  });
});

describe('filtering', () => {
  const list = [
    student(),
    student({ id: 's2', full_legal_name: 'Chloe Moreau', grade: 'SK', room: 'Kindergarten 2', location: 'Meadowvale Campus', media_release: 'NO', parent_1_phone: '647-555-0230', parent_1_email: 'jl@example.com' }),
    student({ id: 's3', full_legal_name: 'Rohan Kulkarni', grade: 'Grade 1', room: 'Lower Casa A', media_release: null, parent_1_email: 'vikram@example.com' }),
  ];

  it('filters by each group and by search text', () => {
    expect(filterStudents(list, { ...EMPTY_FILTERS, grade: ['jk'] })).toHaveLength(1);
    expect(filterStudents(list, { ...EMPTY_FILTERS, room: ['Kindergarten 2'] })).toHaveLength(1);
    expect(filterStudents(list, { ...EMPTY_FILTERS, media: ['no'] })[0]?.id).toBe('s2');
    expect(filterStudents(list, { ...EMPTY_FILTERS, query: 'moreau' })).toHaveLength(1);
    expect(filterStudents(list, { ...EMPTY_FILTERS, query: 'marcus@' })).toHaveLength(1);
    // Phone search ignores formatting.
    expect(filterStudents(list, { ...EMPTY_FILTERS, query: '647 555' })[0]?.id).toBe('s2');
  });
  it('mixes and matches: OR inside a group, AND across groups', () => {
    const twoGrades = { ...EMPTY_FILTERS, grade: ['JK', 'Grade 1'] };
    expect(filterStudents(list, twoGrades).map((s) => s.id)).toEqual(['s1', 's3']);
    expect(filterStudents(list, { ...twoGrades, media: ['missing', 'no'] }).map((s) => s.id)).toEqual(['s3']);
    expect(filterStudents(list, { ...twoGrades, location: ['Meadowvale Campus'] })).toHaveLength(0);
  });
  it('counts each option given the other filters', () => {
    const f = { ...EMPTY_FILTERS, location: ['Brookside Campus'], grade: ['JK'] };
    const grades = facetCounts(list, f, 'grade');
    expect(grades.get('jk')).toBe(1);
    expect(grades.get('grade 1')).toBe(1);
    expect(grades.get('sk')).toBeUndefined(); // SK is only at Meadowvale
  });
  it('toggles options on and off', () => {
    const on = toggleFacet(EMPTY_FILTERS, 'grade', 'JK');
    expect(on.grade).toEqual(['JK']);
    expect(toggleFacet(on, 'grade', 'JK').grade).toEqual([]);
  });
  it('knows when filters are active', () => {
    expect(isFiltered(EMPTY_FILTERS)).toBe(false);
    expect(isFiltered({ ...EMPTY_FILTERS, query: ' x ' })).toBe(true);
    expect(isFiltered({ ...EMPTY_FILTERS, media: ['yes'] })).toBe(true);
  });
  it('collects unique emails of the shown students only', () => {
    expect(collectEmails(list)).toEqual(['marcus@example.com', 'jl@example.com', 'vikram@example.com']);
    expect(collectEmails([student(), student({ id: 'x', parent_1_email: 'MARCUS@example.com' })])).toEqual(['marcus@example.com']);
    expect(collectEmails(filterStudents(list, { ...EMPTY_FILTERS, query: 'rohan' }))).toEqual(['vikram@example.com']);
  });
});

describe('grades, groups and labels', () => {
  it('sorts grades in school order', () => {
    expect(['Grade 10', 'Grade 2', 'SK', 'JK', 'Grade 1'].sort(compareGrades)).toEqual(['JK', 'SK', 'Grade 1', 'Grade 2', 'Grade 10']);
    expect(uniqueValues(DEMO_STUDENTS, 'grade')[0]).toBe('JK');
  });
  it('groups students by classroom, sorted by name', () => {
    const groups = groupByRoom([student({ id: 'b', full_legal_name: 'Zed' }), student({ id: 'a', full_legal_name: 'Amy' }), student({ id: 'c', room: 'Art' })]);
    expect(groups.map((g) => g.room)).toEqual(['Art', 'Kindergarten 1']);
    expect(groups[1]?.students.map((s) => s.id)).toEqual(['a', 'b']);
  });
  it('derives sheet labels', () => {
    const labels = getSheetContextLabels([student()], EMPTY_FILTERS, 'Kindergarten');
    expect(labels).toEqual({ classroomLabel: 'Kindergarten 1', locationLabel: 'Brookside Campus' });
    expect(getSheetContextLabels([student(), student({ room: 'Other' })], EMPTY_FILTERS, 'Kindergarten').classroomLabel).toBe('Kindergarten');
    expect(getSheetContextLabels([student(), student({ room: 'Other' })], { ...EMPTY_FILTERS, room: ['Kindergarten 1', 'Other'] }, 'Kindergarten').classroomLabel).toBe('Kindergarten 1, Other');
  });
});

describe('demo data', () => {
  it('uses the same grade names as the database and gives admins everyone', () => {
    const admin = DEMO_ACCESS.find((a) => a.role === 'admin')!;
    const kg = DEMO_ACCESS[0]!;
    expect(demoStudentsFor(admin)).toHaveLength(DEMO_STUDENTS.length);
    expect(demoStudentsFor(kg).every((s) => ['JK', 'SK'].includes(s.grade!))).toBe(true);
    expect(DEMO_STUDENTS.some((s) => s.grade === 'Grade 1')).toBe(true);
  });
});

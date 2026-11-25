import type { StaffAccess, Student } from './types';

// Grade values match the real database ('JK', 'SK', 'Grade 1' … 'Grade 8').
export const DEMO_ACCESS: StaffAccess[] = [
  { email: 'kg@example.com', division_name: 'Kindergarten', allowed_grades: ['JK', 'SK'], role: 'staff' },
  { email: 'lower@example.com', division_name: 'Lower Elementary', allowed_grades: ['Grade 1', 'Grade 2', 'Grade 3'], role: 'staff' },
  { email: 'upper@example.com', division_name: 'Upper Elementary', allowed_grades: ['Grade 4', 'Grade 5', 'Grade 6'], role: 'staff' },
  { email: 'middle@example.com', division_name: 'Middle School', allowed_grades: ['Grade 7', 'Grade 8'], role: 'staff' },
  { email: 'office@example.com', division_name: 'All Students', allowed_grades: [], role: 'admin' },
];

// [room, campus, grades in the room, how many students]
const ROOMS: [string, string, string[], number][] = [
  ['Kindergarten 1', 'Brookside Campus', ['JK', 'SK'], 24],
  ['Kindergarten 2', 'Meadowvale Campus', ['JK', 'SK'], 14],
  ['Lower Casa A', 'Brookside Campus', ['Grade 1', 'Grade 2', 'Grade 3'], 18],
  ['Lower Casa B', 'Meadowvale Campus', ['Grade 1', 'Grade 2', 'Grade 3'], 12],
  ['Upper Studio 1', 'Brookside Campus', ['Grade 4', 'Grade 5', 'Grade 6'], 16],
  ['Senior Seminar 1', 'Meadowvale Campus', ['Grade 7', 'Grade 8'], 12],
];

const FIRST = ['Liam', 'Maya', 'Rohan', 'Chloe', 'Aria', 'Zara', 'Noah', 'Isla', 'Arjun', 'Leah', 'Kabir', 'Sofia', 'Ethan', 'Anika', 'Omar', 'Ava', 'Dev', 'Mila', 'Ishaan', 'Nora', 'Lucas', 'Priya', 'Elias', 'Tara'];
const MIDDLE = ['Alexander', 'Fatima', 'Vikram', 'Elizabeth', 'Devika', 'Aminah', 'James', ''];
const LAST = ['Chen', 'Al-Mansoor', 'Kulkarni', 'Moreau', 'Nair', 'Siddiqui', 'Patel', 'Wright', 'Hernandez', 'Singh', 'Gallagher', 'Okafor', 'Rossi', 'Kim', 'Sharma', 'Dubois', 'Iyer', 'Haddad', 'Novak'];
const PARENT_1 = ['Marcus', 'Tariq', 'Vikram', 'Jean-Luc', 'Suresh', 'Bilal', 'Daniel', 'Ravi', 'Mateo', 'Thomas', 'Chidi', 'Marco'];
const PARENT_2 = ['Sarah', 'Nadia', 'Anjali', 'Claire', 'Kavita', 'Amina', 'Hannah', 'Meera', 'Sofia', 'Rachel', 'Ngozi', 'Giulia'];
const AREA = ['416', '647', '905'];
const RELEASES = ['YES', 'YES', 'YES', 'NO', 'YES', null, 'YES', 'YES', 'NO', 'YES'];

const pick = <T,>(list: T[], i: number) => list[i % list.length] as T;

export const DEMO_STUDENTS: Student[] = ROOMS.flatMap(([room, location, grades, count], r) =>
  Array.from({ length: count }, (_, k): Student => {
    const n = r * 31 + k;
    const last = pick(LAST, n * 7 + r);
    const grade = pick(grades, k);
    const baseAge = grade === 'JK' ? 4 : grade === 'SK' ? 5 : 5 + Number(grade.replace(/\D/g, ''));
    const p1 = `${pick(PARENT_1, n)} ${last}`;
    const p2 = `${pick(PARENT_2, n + 3)} ${last}`;
    const phone = (offset: number) => `${pick(AREA, n)}555${String(1000 + ((n * 37 + offset) % 9000)).padStart(4, '0')}`;
    const hasSecondParent = n % 9 !== 4;
    return {
      id: `demo-${r + 1}-${k + 1}`,
      full_legal_name: [pick(FIRST, n * 5 + r), pick(MIDDLE, n), last].filter(Boolean).join(' '),
      age: `${baseAge}Y, ${n % 12}M`,
      grade,
      location,
      room,
      parent_1_name: p1,
      parent_1_phone: phone(1),
      parent_1_email: `${p1.split(' ')[0]!.toLowerCase()}.${n}@example.com`,
      parent_2_name: hasSecondParent ? p2 : null,
      parent_2_phone: hasSecondParent ? phone(2) : null,
      parent_2_email: hasSecondParent && n % 3 !== 0 ? `${p2.split(' ')[0]!.toLowerCase()}.${n}@example.com` : null,
      media_release: pick(RELEASES, n),
    };
  }),
);

export function demoStudentsFor(access: StaffAccess): Student[] {
  if (access.role === 'admin') return DEMO_STUDENTS;
  return DEMO_STUDENTS.filter((s) => s.grade && access.allowed_grades.includes(s.grade));
}

export type Student = {
  id: string;
  full_legal_name: string | null;
  age: string | null;
  grade: string | null;
  location: string | null;
  room: string | null;
  parent_1_name: string | null;
  parent_1_phone: string | null;
  parent_1_email: string | null;
  parent_2_name: string | null;
  parent_2_phone: string | null;
  parent_2_email: string | null;
  media_release: string | null;
};

export type StaffRole = 'staff' | 'admin';

export type StaffAccess = {
  email: string;
  division_name: string;
  allowed_grades: string[];
  role: StaffRole;
};

export type MediaReleaseStatus = 'yes' | 'no' | 'missing' | 'other';

/**
 * Each group is a multi-select: an empty list means "all". Groups combine with AND,
 * options inside a group with OR (e.g. Campus A, Grade JK or SK, media release No).
 */
export type Filters = {
  query: string;
  location: string[];
  room: string[];
  grade: string[];
  media: MediaReleaseStatus[];
};

export type FacetKey = 'location' | 'room' | 'grade' | 'media';

/** Columns returned by the get_emergency_sheet() database function. */
export const STUDENT_COLUMNS =
  'id, full_legal_name, age, grade, location, room, parent_1_name, parent_1_phone, parent_1_email, parent_2_name, parent_2_phone, parent_2_email, media_release';

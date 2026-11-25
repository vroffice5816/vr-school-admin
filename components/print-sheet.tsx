import { BrandLogo } from './brand-logo';
import { SCHOOL_NAME } from '@/lib/config';
import { formatPhone, getParentSlots, groupByRoom, mediaReleaseStatus, type Parent } from '@/lib/students';
import type { Student } from '@/lib/types';

type Props = {
  students: Student[];
  classroomLabel: string;
  locationLabel: string;
  staffEmail: string;
  generatedOn: string;
};

function ParentCell({ parent }: { parent: Parent | null }) {
  if (!parent) return <td className="ps-muted">—</td>;
  return (
    <td>
      <span className="ps-parent">{parent.name}</span>
      {parent.phone && <span className="ps-phone">{formatPhone(parent.phone)}</span>}
    </td>
  );
}

function MediaCell({ student }: { student: Student }) {
  const status = mediaReleaseStatus(student);
  // Colour may not print, so "No" is also bold and boxed.
  if (status === 'yes') return <td className="ps-center">Yes</td>;
  if (status === 'no') return <td className="ps-center"><span className="ps-no">NO</span></td>;
  if (status === 'missing') return <td className="ps-center ps-muted">—</td>;
  return <td className="ps-center">{student.media_release}</td>;
}

/**
 * Compact print-only layout: one line per student, parents in their own columns,
 * classroom headings instead of a classroom column. About 40 students per page.
 */
export function PrintSheet({ students, classroomLabel, locationLabel, staffEmail, generatedOn }: Props) {
  const groups = groupByRoom(students);
  const showGroups = groups.length > 1;
  const noRelease = students.filter((s) => mediaReleaseStatus(s) !== 'yes').length;
  let n = 0;

  return (
    <div className="print-sheet">
      <header className="ps-header">
        <BrandLogo className="ps-logo" />
        <div className="ps-title">
          <div className="ps-school">{SCHOOL_NAME}</div>
          <div className="ps-heading">Emergency Contact Sheet — {classroomLabel}</div>
          <div className="ps-sub">{locationLabel}</div>
        </div>
        <div className="ps-meta">
          <div><b>{students.length}</b> students · <b>{noRelease}</b> without media release</div>
          <div>Printed {generatedOn} by {staffEmail}</div>
        </div>
      </header>

      <table className="ps-table">
        <colgroup>
          <col style={{ width: '3.5%' }} />
          <col style={{ width: '24%' }} />
          <col style={{ width: '7.5%' }} />
          <col style={{ width: '29%' }} />
          <col style={{ width: '29%' }} />
          <col style={{ width: '7%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>#</th>
            <th>Student</th>
            <th>Age</th>
            <th>Parent / Guardian 1</th>
            <th>Parent / Guardian 2</th>
            <th className="ps-center">Media</th>
          </tr>
        </thead>
        {students.length === 0 ? (
          <tbody>
            <tr><td colSpan={6} className="ps-center ps-muted">No students match the current filter.</td></tr>
          </tbody>
        ) : (
          groups.map((g) => (
            <tbody key={g.room}>
              {showGroups && (
                <tr className="ps-group">
                  <td colSpan={6}>
                    {g.room}
                    <span>{g.location ? ` · ${g.location}` : ''} · {g.students.length}</span>
                  </td>
                </tr>
              )}
              {g.students.map((s) => {
                const [p1, p2] = getParentSlots(s);
                n += 1;
                return (
                  <tr key={s.id}>
                    <td className="ps-muted">{n}</td>
                    <td className="ps-name">{s.full_legal_name || '—'}</td>
                    <td>{s.age || '—'}</td>
                    <ParentCell parent={p1} />
                    <ParentCell parent={p2} />
                    <MediaCell student={s} />
                  </tr>
                );
              })}
            </tbody>
          ))
        )}
      </table>

      <p className="ps-footer">Confidential: contains student and family contact information. Do not leave unattended.</p>
    </div>
  );
}

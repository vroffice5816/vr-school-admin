import { PhoneIcon } from './icons';
import { formatPhone, getParentSlots, groupByRoom, mediaReleaseLabel, mediaReleaseStatus, phoneHref, type Parent } from '@/lib/students';
import type { Student } from '@/lib/types';
import { ui } from '@/lib/ui';

const badgeStyles = {
  yes: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  no: 'bg-red-50 text-red-800 ring-red-600/20',
  missing: 'bg-amber-50 text-amber-900 ring-amber-600/30',
  other: 'bg-slate-100 text-slate-700 ring-slate-500/20',
};

function MediaBadge({ student }: { student: Student }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${badgeStyles[mediaReleaseStatus(student)]}`}>
      {mediaReleaseLabel(student)}
    </span>
  );
}

function ParentContact({ parent }: { parent: Parent | null }) {
  if (!parent) return <span className="text-slate-400">—</span>;
  return (
    <div className="min-w-0">
      <div className="truncate font-medium text-slate-800">{parent.name}</div>
      {parent.phone ? (
        <a href={phoneHref(parent.phone)} className="inline-flex items-center gap-1 tabular-nums text-emerald-800 hover:underline">
          <PhoneIcon className="h-3.5 w-3.5" />
          {formatPhone(parent.phone)}
        </a>
      ) : (
        <span className="text-xs text-slate-500">No phone on file</span>
      )}
    </div>
  );
}

export function StudentList({ students }: { students: Student[] }) {
  if (students.length === 0) {
    return (
      <div className={`${ui.card} px-6 py-14 text-center`}>
        <p className="font-semibold text-slate-900">No students match these filters</p>
        <p className="mt-1 text-sm text-slate-600">Try clearing the search or choosing a different classroom.</p>
      </div>
    );
  }

  const groups = groupByRoom(students);
  const showGroups = groups.length > 1;

  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <section key={g.room} aria-label={g.room}>
          {showGroups && (
            <h3 className="mb-2 flex items-baseline gap-2 px-1 text-sm font-semibold text-slate-900">
              {g.room}
              <span className="font-normal text-slate-500">
                {g.location ? `${g.location} · ` : ''}{g.students.length}
              </span>
            </h3>
          )}

          {/* Desktop / tablet: table */}
          <div className={`${ui.card} hidden overflow-hidden md:block`}>
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th scope="col" className="w-[28%] px-4 py-2.5">Student</th>
                  <th scope="col" className="w-[29%] px-4 py-2.5">Parent / Guardian 1</th>
                  <th scope="col" className="w-[29%] px-4 py-2.5">Parent / Guardian 2</th>
                  <th scope="col" className="w-[14%] px-4 py-2.5">Media release</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {g.students.map((s) => {
                  const [p1, p2] = getParentSlots(s);
                  return (
                    <tr key={s.id} className="align-top hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{s.full_legal_name || '—'}</div>
                        <div className="text-xs text-slate-600">{[s.age, s.grade].filter(Boolean).join(' · ')}</div>
                      </td>
                      <td className="px-4 py-3"><ParentContact parent={p1} /></td>
                      <td className="px-4 py-3"><ParentContact parent={p2} /></td>
                      <td className="px-4 py-3"><MediaBadge student={s} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Phone: cards with tap-to-call */}
          <ul className="space-y-2 md:hidden">
            {g.students.map((s) => {
              const [p1, p2] = getParentSlots(s);
              return (
                <li key={s.id} className={`${ui.card} p-3.5`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{s.full_legal_name || '—'}</div>
                      <div className="text-xs text-slate-600">{[s.age, s.grade].filter(Boolean).join(' · ')}</div>
                    </div>
                    <MediaBadge student={s} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm">
                    <ParentContact parent={p1} />
                    <ParentContact parent={p2} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

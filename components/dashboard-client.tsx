'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandLogo } from './brand-logo';
import { FiltersBar } from './filters-bar';
import { CopyIcon, DownloadIcon, LogoutIcon, PrinterIcon } from './icons';
import { PrintSheet } from './print-sheet';
import { StudentList } from './student-list';
import { SCHOOL_NAME } from '@/lib/config';
import { studentsToCsv } from '@/lib/csv';
import {
  collectEmails,
  EMPTY_FILTERS,
  filterStudents,
  getSheetContextLabels,
  mediaReleaseStatus,
  uniqueValues,
} from '@/lib/students';
import type { FacetKey, Filters, MediaReleaseStatus, StaffAccess, Student } from '@/lib/types';
import { ui } from '@/lib/ui';

type Props = {
  students: Student[];
  access: StaffAccess;
  email: string;
  mode: 'live' | 'demo';
  generatedOn: string;
  /** YYYY-MM-DD in the school's time zone, for the CSV file name. */
  generatedIso: string;
  demoAccounts?: StaffAccess[];
};

export function DashboardClient({ students, access, email, mode, generatedOn, generatedIso, demoAccounts = [] }: Props) {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const isAdmin = access.role === 'admin';

  const filtered = useMemo(() => filterStudents(students, filters), [students, filters]);

  const filterOptions = useMemo(() => {
    const plain = (values: string[]) => values.map((v) => ({ value: v, label: v }));
    const present = new Set(students.map(mediaReleaseStatus));
    const media: { value: MediaReleaseStatus; label: string }[] = [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'missing', label: 'Not on file' },
      { value: 'other', label: 'Other' },
    ];
    return {
      location: plain(uniqueValues(students, 'location')),
      room: plain(uniqueValues(students, 'room')),
      grade: plain(isAdmin ? uniqueValues(students, 'grade') : access.allowed_grades),
      media: media.filter((m) => present.has(m.value)),
    } satisfies Record<FacetKey, { value: string; label: string }[]>;
  }, [students, isAdmin, access.allowed_grades]);

  // ---- Copy the parent emails of exactly the students on screen
  const emails = useMemo(() => collectEmails(filtered), [filtered]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const showToast = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };
  const copyEmails = async () => {
    const text = emails.join(', ');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers / non-HTTPS: fall back to a hidden textarea.
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      if (!ok) return showToast('Could not copy. Use the CSV download instead.');
    }
    showToast(`Copied ${emails.length} email${emails.length === 1 ? '' : 's'}. Paste into Bcc to keep addresses private.`);
  };

  const labels = getSheetContextLabels(filtered, filters, access.division_name);
  const noReleaseCount = students.filter((s) => mediaReleaseStatus(s) !== 'yes').length;

  const downloadCsv = () => {
    const blob = new Blob([studentsToCsv(filtered)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = labels.classroomLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    a.download = `emergency-sheet_${slug}_${generatedIso}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const scopeText = isAdmin ? 'All grades' : access.allowed_grades.join(', ');

  return (
    <>
      <div className="no-print flex min-h-screen flex-col">
        {mode === 'demo' && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1">
              <span><b>Demo mode</b>: fake students, not real data.</span>
              <label className="flex items-center gap-2">
                <span>Viewing as</span>
                <select
                  value={email}
                  onChange={(e) => router.push(`/dashboard?as=${encodeURIComponent(e.target.value)}`)}
                  className="rounded-md border border-amber-300 bg-white px-2 py-1 text-sm"
                >
                  {demoAccounts.map((a) => (
                    <option key={a.email} value={a.email}>{a.division_name} ({a.email})</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo className="h-10 w-10 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{SCHOOL_NAME}</p>
                <p className="truncate text-xs text-slate-600">Emergency contact sheets</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <span className="hidden max-w-[16rem] truncate text-sm text-slate-600 md:inline" title={email}>{email}</span>
              <form action="/auth/signout" method="post">
                <button type="submit" className={ui.btnGhost}>
                  <LogoutIcon /> <span className="hidden sm:inline">Sign out</span>
                  <span className="sr-only sm:hidden">Sign out</span>
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{access.division_name}</h1>
                {isAdmin && (
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">Admin</span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                {students.length} students · {scopeText}
                {noReleaseCount > 0 && <> · <span className="text-amber-800">{noReleaseCount} without media release</span></>}
                {' · '}{generatedOn}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => window.print()} disabled={filtered.length === 0} className={ui.btnPrimary}>
                <PrinterIcon /> Print sheet
              </button>
              <button
                type="button"
                onClick={copyEmails}
                disabled={emails.length === 0}
                title="Copy the parent emails of the students shown below"
                className={ui.btnSecondary}
              >
                <CopyIcon /> Copy emails
                <span className="rounded bg-slate-100 px-1.5 text-xs tabular-nums text-slate-600">{emails.length}</span>
              </button>
              <button type="button" onClick={downloadCsv} disabled={filtered.length === 0} className={ui.btnSecondary}>
                <DownloadIcon /> CSV
              </button>
            </div>
          </div>

          <FiltersBar
            students={students}
            filters={filters}
            onChange={setFilters}
            shown={filtered.length}
            options={filterOptions}
          />

          <StudentList students={filtered} />
        </main>

        <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
          {toast && (
            <div role="status" className="pointer-events-auto rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
              {toast}
            </div>
          )}
        </div>
      </div>

      {/* Only visible when printing: the compact one-line-per-student sheet. */}
      <div id="print-root">
        <PrintSheet students={filtered} {...labels} staffEmail={email} generatedOn={generatedOn} />
      </div>
    </>
  );
}

'use client';

import { SearchIcon, XIcon } from './icons';
import { EMPTY_FILTERS, facetCounts, isFiltered, toggleFacet } from '@/lib/students';
import type { FacetKey, Filters, Student } from '@/lib/types';
import { ui } from '@/lib/ui';

type Option = { value: string; label: string };

type Props = {
  students: Student[];
  filters: Filters;
  onChange: (next: Filters) => void;
  shown: number;
  /** Options per group, already in display order. Groups with one option or fewer are hidden. */
  options: Record<FacetKey, Option[]>;
};

const GROUPS: { key: FacetKey; label: string }[] = [
  { key: 'location', label: 'Campus' },
  { key: 'room', label: 'Classroom' },
  { key: 'grade', label: 'Grade' },
  { key: 'media', label: 'Media release' },
];

function Chip({
  selected,
  disabled,
  onClick,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? 'border-emerald-800 bg-emerald-800 text-white'
          : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-600 hover:text-emerald-900 disabled:hover:border-slate-300 disabled:hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

export function FiltersBar({ students, filters, onChange, shown, options }: Props) {
  const total = students.length;
  const active = isFiltered(filters);

  return (
    <section aria-label="Filters" className={`${ui.card} p-3 sm:p-4`}>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          aria-label="Search students"
          placeholder="Search student, parent, email or phone…"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          className={`${ui.input} py-2.5 pl-11 text-base sm:text-sm`}
        />
      </div>

      <div className="mt-3 space-y-2.5">
        {GROUPS.map(({ key, label }) => {
          const opts = options[key];
          if (opts.length <= 1) return null;
          const selected = filters[key] as string[];
          // Counts reflect every other active filter, so you can see what each choice would show.
          const counts = facetCounts(students, filters, key);
          return (
            <div key={key} role="group" aria-label={label} className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
              <span className="shrink-0 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:w-28">{label}</span>
              <div className="flex flex-wrap gap-1.5">
                <Chip selected={selected.length === 0} onClick={() => onChange({ ...filters, [key]: [] })}>
                  All
                </Chip>
                {opts.map((o) => {
                  const isOn = selected.includes(o.value);
                  const count = counts.get(o.value.toLowerCase()) ?? 0;
                  return (
                    <Chip
                      key={o.value}
                      selected={isOn}
                      disabled={!isOn && count === 0}
                      onClick={() => onChange(toggleFacet(filters, key, o.value))}
                    >
                      {o.label}
                      <span className={`text-xs tabular-nums ${isOn ? 'text-emerald-100' : 'text-slate-500'}`}>{count}</span>
                    </Chip>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-600">
        <p aria-live="polite">
          Showing <span className="font-semibold text-slate-900">{shown}</span>
          {shown !== total && <> of {total}</>} {total === 1 ? 'student' : 'students'}
        </p>
        {active && (
          <button type="button" onClick={() => onChange(EMPTY_FILTERS)}
            className="inline-flex items-center gap-1 font-medium text-emerald-800 hover:text-emerald-950">
            <XIcon className="h-3.5 w-3.5" /> Clear all filters
          </button>
        )}
      </div>
    </section>
  );
}

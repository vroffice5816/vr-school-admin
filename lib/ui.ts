/** Shared Tailwind class strings, so buttons and cards look the same everywhere. */
const btn =
  'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:opacity-60';

export const ui = {
  btnPrimary: `${btn} bg-emerald-800 text-white shadow-sm hover:bg-emerald-900`,
  btnSecondary: `${btn} border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50`,
  btnGhost: `${btn} text-slate-600 hover:bg-slate-100 hover:text-slate-900`,
  card: 'rounded-xl border border-slate-200 bg-white shadow-sm',
  centeredCard: 'w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm',
  input:
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30',
} as const;

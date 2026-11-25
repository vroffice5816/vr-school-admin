'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">Couldn&apos;t load the emergency sheets</h1>
        <p className="mt-2 text-sm text-slate-600">
          This is not an empty list — the data failed to load. Please retry, and if it keeps
          happening contact your administrator before relying on any printed sheet.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

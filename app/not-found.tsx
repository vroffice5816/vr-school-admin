import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900">Page not found</h1>
        <Link href="/dashboard" className="mt-3 inline-block text-sm font-semibold text-emerald-800 underline">
          Back to the portal
        </Link>
      </div>
    </div>
  );
}

import { BrandLogo } from './brand-logo';
import { ui } from '@/lib/ui';

export function NotConfigured() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className={`${ui.centeredCard} max-w-lg`}>
        <BrandLogo className="mb-4 h-14 w-14" />
        <h1 className="text-xl font-bold text-slate-900">Supabase is not configured</h1>
        <p className="mt-2 text-sm text-slate-600">
          Set <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your
          environment (Vercel → Project Settings → Environment Variables), then redeploy. Demo
          data is intentionally disabled in production so fake students can never appear on a
          real emergency sheet.
        </p>
      </div>
    </div>
  );
}

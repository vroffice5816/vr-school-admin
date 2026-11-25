import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { NotConfigured } from '@/components/not-configured';
import { SCHOOL_NAME } from '@/lib/config';
import { DEMO_ACCESS } from '@/lib/demo';
import { isDemoEnabled, isSupabaseConfigured } from '@/lib/env';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  if (!isSupabaseConfigured && !isDemoEnabled) return <NotConfigured />;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <BrandLogo className="mx-auto mb-4 h-20 w-20" />
          <h1 className="text-xl font-bold text-slate-900">Emergency Contact Sheets</h1>
          <p className="mt-1 text-sm text-slate-600">{SCHOOL_NAME} staff portal</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {isSupabaseConfigured ? (
            <LoginForm />
          ) : (
            <div>
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <b>Demo mode</b>: Supabase isn&apos;t connected, so these accounts show fake students.
              </p>
              <ul className="space-y-2">
                {DEMO_ACCESS.map((a) => (
                  <li key={a.email}>
                    <Link href={`/dashboard?as=${encodeURIComponent(a.email)}`}
                      className="block rounded-lg border border-slate-200 px-3 py-2.5 transition hover:border-emerald-600 hover:bg-emerald-50/50">
                      <div className="text-sm font-semibold text-slate-900">{a.division_name}</div>
                      <div className="text-xs text-slate-600">
                        {a.email} · {a.role === 'admin' ? 'all grades' : a.allowed_grades.join(', ')}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">Trouble signing in? Contact the school office.</p>
      </div>
    </div>
  );
}

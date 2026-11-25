import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard-client';
import { NoAccess } from '@/components/no-access';
import { NotConfigured } from '@/components/not-configured';
import { formatToday, todayIsoDate } from '@/lib/config';
import { DEMO_ACCESS, demoStudentsFor } from '@/lib/demo';
import { isDemoEnabled, isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import { STUDENT_COLUMNS, type StaffAccess, type Student } from '@/lib/types';

export const metadata: Metadata = { title: 'Emergency Sheets' };

type SearchParams = Promise<{ as?: string }>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const dates = { generatedOn: formatToday(), generatedIso: todayIsoDate() };

  // ---- Demo mode (only when Supabase isn't configured; never in production by default)
  if (!isSupabaseConfigured) {
    if (!isDemoEnabled) return <NotConfigured />;
    const { as } = await searchParams;
    const access = DEMO_ACCESS.find((a) => a.email === as) ?? (DEMO_ACCESS[0] as StaffAccess);
    return (
      <DashboardClient mode="demo" students={demoStudentsFor(access)} access={access} email={access.email}
        {...dates} demoAccounts={DEMO_ACCESS} />
    );
  }

  // ---- Live mode: the database decides what each login may see
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect('/login');
  const email = user.email.toLowerCase();

  const { data: access, error: accessError } = await supabase
    .from('staff_division_access')
    .select('email, division_name, allowed_grades, role')
    .eq('email', email)
    .maybeSingle<StaffAccess>();
  if (accessError) {
    // Server log only: the real reason (e.g. a migration not yet run). The browser gets a generic message.
    console.error('[dashboard] staff_division_access query failed:', accessError.code, accessError.message, accessError.hint ?? '');
    throw new Error('Could not load staff access.');
  }
  if (!access) return <NoAccess email={email} />;

  // get_emergency_sheet() only returns the caller's grades (all grades for admins).
  // Staff queries also filter here, as a second check.
  const query = supabase.rpc('get_emergency_sheet').select(STUDENT_COLUMNS);
  const { data, error } = await (access.role === 'admin' ? query : query.in('grade', access.allowed_grades));
  // Throw (-> error.tsx) rather than showing an empty sheet that looks like "no students".
  if (error) {
    console.error('[dashboard] get_emergency_sheet() failed:', error.code, error.message, error.hint ?? '');
    throw new Error('Could not load students.');
  }

  const students = (data ?? []) as unknown as Student[];

  return <DashboardClient mode="live" students={students} access={access} email={email} {...dates} />;
}

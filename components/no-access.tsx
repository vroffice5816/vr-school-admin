import { BrandLogo } from './brand-logo';
import { ui } from '@/lib/ui';

/** Signed in, but no row in staff_division_access for this email. */
export function NoAccess({ email }: { email: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className={`${ui.centeredCard} text-center`}>
        <BrandLogo className="mx-auto mb-4 h-14 w-14" />
        <h1 className="text-lg font-bold text-slate-900">No access assigned yet</h1>
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{email}</span> isn&apos;t linked to a division.
          Please ask the school office to add it.
        </p>
        <form action="/auth/signout" method="post" className="mt-5">
          <button type="submit" className={ui.btnSecondary}>Sign out</button>
        </form>
      </div>
    </div>
  );
}

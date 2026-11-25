'use client';

import { useActionState } from 'react';
import { signIn, type LoginState } from './actions';
import { ui } from '@/lib/ui';

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, null);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">School email</label>
        <input id="email" name="email" type="email" required autoComplete="username" placeholder="name@vedicroots.ca" className={ui.input} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={ui.input} />
      </div>
      <button type="submit" disabled={pending} className={`${ui.btnPrimary} w-full py-2.5`}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

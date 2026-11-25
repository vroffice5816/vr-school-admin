'use server';

import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';

export type LoginState = { error: string } | null;

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured) return { error: 'Supabase is not configured.' };

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password || email.length > 254 || password.length > 256) {
    return { error: 'Enter your school email and password.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Deliberately generic: don't reveal whether the email exists.
  if (error) return { error: 'Invalid email or password.' };

  redirect('/dashboard');
}

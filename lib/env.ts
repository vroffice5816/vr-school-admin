// NEXT_PUBLIC_* values must be referenced literally so Next.js can inline them.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && key && url.startsWith('http'));

export const supabaseEnv = { url: url ?? '', key: key ?? '' };

/**
 * Demo mode shows FAKE students. For an emergency sheet that is dangerous if it
 * ever appears by accident, so it only runs when Supabase is not configured AND
 * we're not in production (unless ALLOW_DEMO_MODE=true is set deliberately).
 */
export const isDemoEnabled =
  !isSupabaseConfigured &&
  (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_MODE === 'true');

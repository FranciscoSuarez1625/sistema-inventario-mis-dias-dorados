import type { CookieOptionsWithName } from '@supabase/ssr'

// The v0 preview renders the app inside a cross-site iframe; the session cookie
// must be SameSite=None + Secure there or the browser drops it on every rewrite.
export const supabaseCookieOptions: CookieOptionsWithName =
  process.env.NODE_ENV === 'production'
    ? { secure: true, sameSite: 'lax', path: '/' }
    : { secure: true, sameSite: 'none', path: '/' }

export function withSessionCookieOptions<T extends object>(options: T) {
  return { ...options, ...supabaseCookieOptions }
}

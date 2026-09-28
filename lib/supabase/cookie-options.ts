import type { CookieOptionsWithName } from '@supabase/ssr'

// The v0 preview renders the app inside a cross-site iframe, where SameSite=Lax
// cookies are never sent. Development needs SameSite=None; Secure to keep the session.
export const supabaseCookieOptions: CookieOptionsWithName =
  process.env.NODE_ENV === 'production'
    ? { secure: true, sameSite: 'lax' }
    : { secure: true, sameSite: 'none' }

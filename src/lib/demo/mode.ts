// ─────────────────────────────────────────────────────────────
// PaySimple — Demo mode
//
// Demo mode swaps every data source for the fixtures in ./data.ts so the
// whole product can be explored without an account or a database. It is a
// shipped product feature (unlike a dev-only flag), so it is designed to be
// obvious: a persistent banner, and writes that never leave the browser.
// ─────────────────────────────────────────────────────────────

import type { User } from '@supabase/supabase-js'

export const DEMO_COOKIE = 'paysimple-demo'
export const DEMO_USER_ID = '00000000-0000-4000-8000-0000000000de'

/** Reads the flag. Safe to call during SSR — returns false on the server. */
export function isDemoActive(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie
    .split(';')
    .some((part) => part.trim() === `${DEMO_COOKIE}=1`)
}

/** Parses a raw Cookie header (for middleware / server components). */
export function hasDemoCookie(cookieString: string | undefined | null): boolean {
  if (!cookieString) return false
  return cookieString.split(';').some((part) => part.trim() === `${DEMO_COOKIE}=1`)
}

export function enableDemo(): void {
  // Session cookie — the demo ends when the browser closes.
  document.cookie = `${DEMO_COOKIE}=1; path=/; SameSite=Lax`
}

export function disableDemo(): void {
  document.cookie = `${DEMO_COOKIE}=; path=/; Max-Age=0; SameSite=Lax`
}

/** Stand-in user so screens that key off `user.id` behave normally. */
export function demoUser(): User {
  const now = new Date().toISOString()
  return {
    id: DEMO_USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    email: 'dana@meridianbuilders.example',
    app_metadata: { provider: 'demo', providers: ['demo'] },
    user_metadata: { name: 'Dana Whitfield', company: 'Meridian Builders' },
    created_at: now,
    updated_at: now,
  } as User
}

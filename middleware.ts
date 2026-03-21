import { supabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { data: { session } } = await supabase.auth.getSession()
  
  // Redirect to login if accessing protected routes without session
  if (!session && (request.nextUrl.pathname.startsWith('/projects') || request.nextUrl.pathname.startsWith('/dashboard'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Redirect to dashboard if accessing auth routes with session
  if (session && (request.nextUrl.pathname === '/auth/login' || request.nextUrl.pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/projects/:path*', '/dashboard', '/dashboard/:path*', '/auth/login', '/auth/signup']
}

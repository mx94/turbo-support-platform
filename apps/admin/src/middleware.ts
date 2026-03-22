import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { updateSession } from '@repo/database'

const PROTECTED_ROUTES = ['/dashboard', '/support', '/settings']
const AUTH_PAGES = ['/auth/login']

export async function middleware(request: NextRequest): Promise<NextResponse | undefined> {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/auth/callback') || pathname.startsWith('/auth/confirm')) {
    return NextResponse.next()
  }

  const { supabaseResponse, user } = await updateSession(request)

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    return NextResponse.redirect(redirectUrl)
  }

  const isAuthPage = AUTH_PAGES.some((route) => pathname === route)
  if (isAuthPage && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

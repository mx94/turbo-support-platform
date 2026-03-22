import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { updateSession } from '@repo/database'

// 需要登录才能访问的路由前缀
const PROTECTED_ROUTES = ['/dashboard']

// 已登录用户不需要访问的认证页面
const AUTH_PAGES = ['/auth/login']

export async function middleware(request: NextRequest): Promise<NextResponse | undefined> {
  const { pathname } = request.nextUrl

  // OAuth / 邮件验证回调路由不经过 updateSession，
  // 避免 getUser() 消费掉 PKCE code verifier cookie
  if (pathname.startsWith('/auth/callback') || pathname.startsWith('/auth/confirm')) {
    return NextResponse.next()
  }

  const { supabaseResponse, user } = await updateSession(request)

  // 受保护路由：未登录用户重定向到登录页
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    return NextResponse.redirect(redirectUrl)
  }

  // 已登录用户访问认证页面时重定向到 Dashboard
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

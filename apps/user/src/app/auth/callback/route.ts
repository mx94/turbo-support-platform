import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@repo/database/types'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  let next = searchParams.get('next') ?? '/dashboard'
  if (!next.startsWith('/')) {
    next = '/dashboard'
  }

  if (code) {
    const cookieStore = cookies()
    // 为解决 Next.js Server Components 中不能主动写 Cookie 导致其被 try/catch 吞掉的坑，
    // 这里我们必须准备一个将要返回的响应对象，让 Supabase SSR 能够直接绑定 Cookie 到真正的 Headers 上。
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    
    let redirectUrl = `${origin}${next}`;
    if (!isLocalEnv && forwardedHost) {
      redirectUrl = `https://${forwardedHost}${next}`;
    }
    const response = NextResponse.redirect(redirectUrl)

    // 定制在这个生命周期内的专属 Server Client，将产生的 Auth 凭据真正挂到 redirect Response 里！
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch {}
            response.cookies.set({
              name,
              value,
              ...options,
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV !== 'development',
            })
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.delete({ name, ...options })
            } catch {}
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return response
    } else {
      console.error("[OAuth Callback] exchangeCodeForSession 失败:", error)
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?error=NoCodeProvided`)
}

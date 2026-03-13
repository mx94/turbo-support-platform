import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

/**
 * 服务端 Supabase 客户端（用于 Server Components / Route Handlers / Server Actions）
 * 环境变量在此集中读取，调用方无需传参
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name)
          return cookie ? cookie.value : undefined
        },
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                path: '/',
                sameSite: 'lax',
              })
            )
          } catch {
            // `setAll` 在 Server Component 中被调用时会抛出异常。
            // 如果中间件已配置 session 刷新机制，可安全忽略此错误。
          }
        },
      },
    }
  )
}

/**
 * 服务端最高权限管理员 Supabase 客户端（用于绕开 RLS 创建受保护记录）
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

/**
 * 浏览器端 Supabase 客户端（用于 Client Components）
 * 环境变量在此集中读取，调用方无需传参
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined;
          const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
          return v ? decodeURIComponent(v[2]) : undefined;
        },
        set(name: string, value: string, options: any) {
          if (typeof document === 'undefined') return;
          const encoded = encodeURIComponent(value);
          // 显式指定 path=/ 使其在所有路由中可用，并在 localhost 关闭 secure 以避免被丢弃
          document.cookie = `${name}=${encoded}; path=/; max-age=${options?.maxAge ?? 3600}; SameSite=Lax`;
        },
        remove(name: string, options: any) {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        },
      },
    }
  )
}

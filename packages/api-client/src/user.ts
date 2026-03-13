import { createBrowserSupabaseClient } from '@repo/database'
import { createClient } from '@repo/database/server'

/**
 * 服务端获取用户 Profile（用于 Server Components / Route Handlers）
 */
export async function getServerUserProfile() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

/**
 * 客户端获取用户 Profile（用于 Client Components）
 */
export async function getClientUserProfile() {
  const supabase = createBrowserSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

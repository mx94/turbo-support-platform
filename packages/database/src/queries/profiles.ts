import { createClient } from '../server'
import type { UserRole, Profile } from '../database.types'

/* ─── 用户资料查询 ─────────────────────────────────────────── */

/** 获取用户资料 */
export async function getProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single() as any)

  return { data: data as Profile | null, error }
}

/** 更新用户资料 */
export async function updateProfile(userId: string, params: {
  fullName?: string
  avatarUrl?: string
}) {
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('profiles')
    // @ts-expect-error Supabase SDK generic mismatch
    .update({
      ...(params.fullName !== undefined && { full_name: params.fullName }),
      ...(params.avatarUrl !== undefined && { avatar_url: params.avatarUrl }),
    } as any)
    .eq('id', userId)
    .select()
    .single() as any)

  return { data: data as Profile | null, error }
}

/** 获取所有用户列表（管理员用） */
export async function getAllProfiles(params?: {
  search?: string
  role?: UserRole
  page?: number
  pageSize?: number
}) {
  const supabase = createClient()
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' }) as any

  if (params?.role) query = query.eq('role', params.role)
  if (params?.search) {
    query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  return { data: (data ?? []) as Profile[], total: (count ?? 0) as number, error }
}

/** 更新用户角色（管理员用） */
export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('profiles')
    // @ts-expect-error Supabase SDK generic mismatch
    .update({ role } as any)
    .eq('id', userId)
    .select()
    .single() as any)

  return { data: data as Profile | null, error }
}

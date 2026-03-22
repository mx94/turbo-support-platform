import { createClient } from '../server'
import type { ActivityLogEntry } from '../database.types'

/* ─── 活动日志 ─────────────────────────────────────────────── */

/** 记录用户活动 */
export async function logActivity(params: {
  userId: string
  action: string
  resourceType: string
  resourceId?: string
  metadata?: Record<string, unknown>
}) {
  const supabase = createClient()
  const { error } = await (supabase
    .from('activity_log')
    .insert({
      user_id: params.userId,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      metadata: params.metadata ?? {},
    } as any) as any)

  return { error }
}

/** 获取用户最近活动 */
export async function getRecentActivity(userId?: string, limit = 10) {
  const supabase = createClient()
  let query = supabase
    .from('activity_log')
    .select('*') as any

  if (userId) query = query.eq('user_id', userId)

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: (data ?? []) as ActivityLogEntry[], error }
}

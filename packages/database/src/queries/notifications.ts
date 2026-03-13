import { createClient, createAdminClient } from '../server'
import type { NotificationType, Notification } from '../database.types'

/* ─── 通知查询 ─────────────────────────────────────────────── */

/** 获取用户的通知列表 */
export async function getUserNotifications(userId: string, page = 1, pageSize = 20) {
  const supabase = createClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await (supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to) as any)

  return { data: (data ?? []) as Notification[], total: (count ?? 0) as number, error }
}

/** 获取未读通知数量 */
export async function getUnreadNotificationCount(userId: string) {
  const supabase = createClient()
  const { count, error } = await (supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false) as any)

  return { count: (count ?? 0) as number, error }
}

/** 标记通知为已读 */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient()
  const { error } = await (supabase
    .from('notifications')
    // @ts-expect-error Supabase SDK generic mismatch
    .update({ is_read: true } as any)
    .eq('id', notificationId) as any)

  return { error }
}

/** 标记所有通知为已读 */
export async function markAllNotificationsAsRead(userId: string) {
  const supabase = createClient()
  const { error } = await (supabase
    .from('notifications')
    // @ts-expect-error Supabase SDK generic mismatch
    .update({ is_read: true } as any)
    .eq('user_id', userId)
    .eq('is_read', false) as any)

  return { error }
}

/** 创建通知 */
export async function createNotification(params: {
  userId: string
  type: NotificationType
  title: string
  message?: string
  metadata?: Record<string, unknown>
}) {
  const adminClient = createAdminClient()
  const { data, error } = await (adminClient
    .from('notifications')
    .insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: params.metadata ?? {},
    } as any)
    .select()
    .single() as any)

  return { data: data as Notification | null, error }
}

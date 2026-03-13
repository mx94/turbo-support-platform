import { createClient, createAdminClient } from '../server'
import type { TicketStatus, TicketPriority, Ticket } from '../database.types'

/* ─── 查询参数类型 ─────────────────────────────────────────── */
export interface TicketFilters {
  status?: TicketStatus
  priority?: TicketPriority
  category?: string
  userId?: string
  assignedAdminId?: string
}

export interface TicketStats {
  total: number
  open: number
  in_progress: number
  resolved: number
  closed: number
}

/* ─── 工单查询 ─────────────────────────────────────────────── */

/** 获取工单列表（支持筛选 + 分页） */
export async function getTickets(filters?: TicketFilters, page = 1, pageSize = 20) {
  const supabase = createClient()
  let query = supabase
    .from('tickets')
    .select('*', { count: 'exact' }) as any

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.priority) query = query.eq('priority', filters.priority)
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.userId) query = query.eq('user_id', filters.userId)
  if (filters?.assignedAdminId) query = query.eq('assigned_admin_id', filters.assignedAdminId)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  return { data: (data ?? []) as Ticket[], total: (count ?? 0) as number, error }
}

/** 获取单个工单 */
export async function getTicketById(ticketId: string) {
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .single() as any)

  return { data: data as Ticket | null, error }
}

/** 创建工单 */
export async function createTicket(params: {
  userId: string
  title: string
  description?: string
  priority?: TicketPriority
  category?: string
  streamChannelId?: string
}) {
  const adminClient = createAdminClient()
  const { data, error } = await (adminClient
    .from('tickets')
    .insert({
      user_id: params.userId,
      title: params.title,
      description: params.description,
      priority: params.priority ?? 'medium',
      category: params.category ?? 'general',
      stream_channel_id: params.streamChannelId,
    } as any)
    .select()
    .single() as any)

  return { data: data as Ticket | null, error }
}

/** 更新工单状态 */
export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  const supabase = createClient()
  const updates: Record<string, unknown> = { status }
  if (status === 'resolved') updates.resolved_at = new Date().toISOString()

  const { data, error } = await (supabase
    .from('tickets')
    // @ts-expect-error Supabase SDK generic mismatch with Database types
    .update(updates as any)
    .eq('id', ticketId)
    .select()
    .single() as any)

  return { data: data as Ticket | null, error }
}

/** 分配工单给管理员 */
export async function assignTicket(ticketId: string, adminId: string) {
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('tickets')
    // @ts-expect-error Supabase SDK generic mismatch with Database types
    .update({ assigned_admin_id: adminId, status: 'in_progress' } as any)
    .eq('id', ticketId)
    .select()
    .single() as any)

  return { data: data as Ticket | null, error }
}

/** 提交工单评价 */
export async function rateTicket(ticketId: string, rating: number, comment?: string) {
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('tickets')
    // @ts-expect-error Supabase SDK generic mismatch with Database types
    .update({ rating, rating_comment: comment } as any)
    .eq('id', ticketId)
    .select()
    .single() as any)

  return { data: data as Ticket | null, error }
}

/** 获取用户工单统计 */
export async function getTicketStats(userId?: string): Promise<TicketStats> {
  const supabase = createClient()
  let query = supabase.from('tickets').select('status') as any
  if (userId) query = query.eq('user_id', userId)

  const { data } = await query
  const tickets = (data ?? []) as Array<{ status: TicketStatus }>

  return {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  }
}

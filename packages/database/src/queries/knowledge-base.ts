import { createClient } from '../server'
import type { KnowledgeBaseArticle } from '../database.types'

/* ─── 知识库查询 ───────────────────────────────────────────── */

/** 获取已发布文章列表（支持分类过滤 + 搜索） */
export async function getPublishedArticles(params?: {
  category?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  const supabase = createClient()
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 12
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('knowledge_base')
    .select('*', { count: 'exact' })
    .eq('is_published', true) as any

  if (params?.category && params.category !== 'all') {
    query = query.eq('category', params.category)
  }

  if (params?.search) {
    query = query.or(`title.ilike.%${params.search}%,content.ilike.%${params.search}%`)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  return { data: (data ?? []) as KnowledgeBaseArticle[], total: (count ?? 0) as number, error }
}

/** 获取所有文章（管理员用） */
export async function getAllArticles(page = 1, pageSize = 20) {
  const supabase = createClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await (supabase
    .from('knowledge_base')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, to) as any)

  return { data: (data ?? []) as KnowledgeBaseArticle[], total: (count ?? 0) as number, error }
}

/** 获取单篇文章 */
export async function getArticleById(articleId: string) {
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('knowledge_base')
    .select('*')
    .eq('id', articleId)
    .single() as any)

  return { data: data as KnowledgeBaseArticle | null, error }
}

/** 创建文章 */
export async function createArticle(params: {
  title: string
  content: string
  category?: string
  tags?: string[]
  authorId: string
  isPublished?: boolean
}) {
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('knowledge_base')
    .insert({
      title: params.title,
      content: params.content,
      category: params.category ?? 'general',
      tags: params.tags ?? [],
      author_id: params.authorId,
      is_published: params.isPublished ?? false,
    } as any)
    .select()
    .single() as any)

  return { data: data as KnowledgeBaseArticle | null, error }
}

/** 更新文章 */
export async function updateArticle(articleId: string, params: {
  title?: string
  content?: string
  category?: string
  tags?: string[]
  isPublished?: boolean
}) {
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('knowledge_base')
    // @ts-expect-error Supabase SDK generic mismatch
    .update({
      ...(params.title && { title: params.title }),
      ...(params.content && { content: params.content }),
      ...(params.category && { category: params.category }),
      ...(params.tags && { tags: params.tags }),
      ...(params.isPublished !== undefined && { is_published: params.isPublished }),
    } as any)
    .eq('id', articleId)
    .select()
    .single() as any)

  return { data: data as KnowledgeBaseArticle | null, error }
}

/** 删除文章 */
export async function deleteArticle(articleId: string) {
  const supabase = createClient()
  const { error } = await (supabase
    .from('knowledge_base')
    .delete()
    .eq('id', articleId) as any)

  return { error }
}

/** 增加文章阅读量 */
export async function incrementArticleViews(articleId: string) {
  const supabase = createClient()
  const { data: article } = await (supabase
    .from('knowledge_base')
    .select('view_count')
    .eq('id', articleId)
    .single() as any) as { data: { view_count: number } | null }

  if (article) {
    await (supabase
      .from('knowledge_base')
      // @ts-expect-error Supabase SDK generic mismatch
      .update({ view_count: article.view_count + 1 } as any)
      .eq('id', articleId) as any)
  }
}

/** 获取文章分类列表 */
export async function getArticleCategories() {
  const supabase = createClient()
  const { data } = await (supabase
    .from('knowledge_base')
    .select('category')
    .eq('is_published', true) as any) as { data: Array<{ category: string }> | null }

  const categories = Array.from(new Set((data ?? []).map(d => d.category)))
  return categories
}

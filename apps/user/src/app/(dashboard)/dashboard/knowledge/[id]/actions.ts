"use server";

import { createAdminClient } from "@repo/database/server";

export async function incrementViewCount(articleId: string) {
  try {
    const supabaseAdmin = createAdminClient();
    
    // 执行原生 RPC 函数 increment_article_view 
    // 若不存在此函数，可退化为先查询再 update。这里采用先查询再 update 保证兼容性
    const { data: article } = await supabaseAdmin
      .from("knowledge_base")
      .select("view_count")
      .eq("id", articleId)
      .single();

    if (article) {
      await supabaseAdmin
        .from("knowledge_base")
        .update({ view_count: (article.view_count || 0) + 1 })
        .eq("id", articleId);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Failed to increment view count:", error);
    return { success: false };
  }
}

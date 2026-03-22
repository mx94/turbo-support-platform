import { type ReactElement } from "react";
import { createClient } from "@repo/database/server";
import { notFound } from "next/navigation";
import { KnowledgeArticleViewer } from "./components/KnowledgeArticleViewer";

// 强制 VSCode 刷新类型缓存

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({ params }: { params: { id: string } }): Promise<ReactElement> {
  const supabase = createClient();
  
  const { data: article } = await supabase
    .from("knowledge_base")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!article) {
    notFound();
  }

  return <KnowledgeArticleViewer article={article} />;
}

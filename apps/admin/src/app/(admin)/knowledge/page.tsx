import { type ReactElement } from "react";
import { createClient } from "@repo/database/server";
import { redirect } from "next/navigation";
import { AdminKnowledgeClient } from "./components/AdminKnowledgeClient";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default async function AdminKnowledgePage(): Promise<ReactElement> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: articles, count } = await supabase
    .from("knowledge_base").select("*", { count: "exact" })
    .order("updated_at", { ascending: false });

  const list = articles ?? [];
  const statData = [
    { label: "全部文章", value: count ?? 0, color: "text-foreground" },
    { label: "已发布", value: list.filter((a: any) => a.is_published).length, color: "text-emerald-600" },
    { label: "草稿", value: list.filter((a: any) => !a.is_published).length, color: "text-amber-600" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <AdminKnowledgeClient list={list} adminUserId={user.id} />
    </div>
  );
}

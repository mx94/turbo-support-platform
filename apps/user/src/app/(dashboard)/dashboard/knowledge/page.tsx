import { type ReactElement } from "react";
import { createClient } from "@repo/database/server";
import { redirect } from "next/navigation";

import { UserKnowledgeClient } from "./components/UserKnowledgeClient";

export const dynamic = "force-dynamic";

export default async function KnowledgePage(): Promise<ReactElement> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: articles } = await supabase
    .from("knowledge_base").select("*").eq("is_published", true)
    .order("created_at", { ascending: false });

  const categories = [
    "all",
    ...Array.from(new Set((articles ?? []).map((a: any) => a.category))),
  ];

  return <UserKnowledgeClient articles={articles ?? []} categories={categories} />;
}

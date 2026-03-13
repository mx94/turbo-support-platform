import { type ReactElement } from "react";
import { createClient } from "@repo/database/server";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { TicketsListClient } from "./components/TicketsListClient";

export const dynamic = "force-dynamic";


export default async function TicketsPage(): Promise<ReactElement> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: tickets } = await supabase
    .from("tickets").select("*").eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = tickets ?? [];
  const statData = [
    { label: "全部工单", value: list.length, color: "text-foreground" },
    { label: "待处理", value: list.filter((t: any) => t.status === "open").length, color: "text-amber-600" },
    { label: "处理中", value: list.filter((t: any) => t.status === "in_progress").length, color: "text-blue-600" },
    { label: "已解决", value: list.filter((t: any) => t.status === "resolved" || t.status === "closed").length, color: "text-emerald-600" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* ── 头部 ── */}
      <div className="page-header animate-fade-in-up">
        <div className="page-badge">
          <FileText className="w-3 h-3" />
          <span>工单记录</span>
        </div>
        <h1 className="page-title">我的工单</h1>
        <p className="page-subtitle">查看和追踪您所有的客服支持工单。</p>
      </div>

      {/* ── 统计 ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statData.map((s, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="stat-card-label">{s.label}</span>
            <span className={`stat-card-value ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── 列表交互组件 ── */}
      <TicketsListClient list={list} />
    </div>
  );
}

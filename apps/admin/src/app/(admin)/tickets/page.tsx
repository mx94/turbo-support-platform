import { type ReactElement } from "react";
import { createClient, createAdminClient } from "@repo/database/server";
import { redirect } from "next/navigation";
import { FileText, Search, Filter } from "lucide-react";
import { AdminTicketsClient } from "./components/AdminTicketsClient";

export const dynamic = "force-dynamic";


export default async function AdminTicketsPage(): Promise<ReactElement> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const supabaseAdmin = createAdminClient();
  const { data: ticketsData, count } = await supabaseAdmin
    .from("tickets")
    .select("*, profiles!tickets_user_profile_fkey(full_name, email, avatar_url)", { count: "exact" })
    .order("created_at", { ascending: false });

  let list = ticketsData ?? [];
  const total = count ?? 0;
  const statData = [
    { label: "全部", value: total, color: "text-foreground" },
    { label: "待处理", value: list.filter((t: any) => t.status === "open").length, color: "text-amber-600" },
    { label: "处理中", value: list.filter((t: any) => t.status === "in_progress").length, color: "text-blue-600" },
    { label: "已解决", value: list.filter((t: any) => t.status === "resolved" || t.status === "closed").length, color: "text-emerald-600" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── 头部 ── */}
      <div className="page-header animate-fade-in-up">
        <div className="page-badge">
          <FileText className="w-3 h-3" />
          <span>工单管理</span>
        </div>
        <h1 className="page-title">全部工单</h1>
        <p className="page-subtitle">管理和处理客户提交的所有支持工单。</p>
      </div>

      {/* ── 统计 ── */}
      <div className="grid grid-cols-4 gap-3">
        {statData.map((s, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="stat-card-label">{s.label}</span>
            <span className={`stat-card-value ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── 搜索/过滤 ── */}
      <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: "280ms" }}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索工单标题..."
            className="w-full h-10 pl-11 pr-4 glass-card rounded-xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <button className="h-10 px-4 glass-card rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-all flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" />
          筛选
        </button>
      </div>

      {/* ── 列表交互组件 ── */}
      <AdminTicketsClient list={list} />
    </div>
  );
}

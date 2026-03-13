import { type ReactElement } from "react";
import { createClient } from "@repo/database/server";
import { redirect } from "next/navigation";
import {
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";

export const dynamic = "force-dynamic";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  return `${Math.floor(h / 24)} 天前`;
}

export default async function AdminDashboardPage(): Promise<ReactElement> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { data: allTickets } = await supabase.from("tickets").select("status, priority, created_at");
  const tickets = allTickets ?? [];
  const activeTickets = tickets.filter((t: any) => t.status === "open" || t.status === "in_progress").length;
  const urgentTickets = tickets.filter((t: any) => t.priority === "urgent" && t.status !== "closed").length;
  const resolvedTickets = tickets.filter((t: any) => t.status === "resolved" || t.status === "closed").length;
  const { count: articleCount } = await supabase.from("knowledge_base").select("*", { count: "exact", head: true }).eq("is_published", true);

  const { data: recentTickets } = await supabase
    .from("tickets").select("*, profiles!tickets_user_id_fkey(full_name, email)")
    .order("created_at", { ascending: false }).limit(5);

  const { data: recentActivity } = await supabase
    .from("activity_log").select("*")
    .order("created_at", { ascending: false }).limit(5);

  const STATUS: Record<string, { label: string; class: string }> = {
    open: { label: "待处理", class: "status-open" },
    in_progress: { label: "处理中", class: "status-in-progress" },
    resolved: { label: "已解决", class: "status-resolved" },
    closed: { label: "已关闭", class: "status-closed" },
  };

  const stats = [
    { label: "注册用户", value: totalUsers ?? 0, icon: Users, color: "text-foreground" },
    { label: "活跃工单", value: activeTickets, icon: FileText, color: "text-amber-600", extra: urgentTickets > 0 ? `${urgentTickets} 个紧急` : null },
    { label: "已解决", value: resolvedTickets, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "知识库文章", value: articleCount ?? 0, icon: BookOpen, color: "text-primary" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── 头部 ── */}
      <div className="page-header animate-fade-in-up">
        <div className="page-badge">
          <LayoutDashboard className="w-3 h-3" />
          <span>管理后台</span>
        </div>
        <h1 className="page-title text-3xl">数据概览</h1>
        <p className="page-subtitle">Turbo Platform 实时运行数据</p>
      </div>

      {/* ── 核心指标 ── */}
      <div className="grid gap-3 md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="stat-card-label">
              <s.icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </div>
            <div className={`stat-card-value ${s.color}`}>{s.value}</div>
            {s.extra && (
              <p className="flex items-center gap-1 text-[11px] text-destructive font-medium mt-0.5">
                <AlertCircle className="w-3 h-3" />
                {s.extra}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── 最近工单 + 系统活动 ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "280ms" }}>
          <div className="px-5 py-3.5 border-b border-border/30 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">最新工单</h3>
            <span className="text-[11px] text-muted-foreground">{tickets.length} 条</span>
          </div>
          {(recentTickets ?? []).length > 0 ? (
            (recentTickets ?? []).map((ticket: any, i: number) => {
              const st = STATUS[ticket.status] ?? STATUS.open;
              return (
                <div
                  key={ticket.id}
                  className={`flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer ${
                    i !== (recentTickets?.length ?? 0) - 1 ? "border-b border-border/20" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {ticket.profiles?.full_name ?? "未知"} · {timeAgo(ticket.created_at)}
                    </p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${st.class}`}>
                    {st.label}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="empty-state py-10">
              <div className="empty-state-icon">
                <FileText className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <p className="empty-state-title text-sm">暂无工单</p>
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "340ms" }}>
          <div className="px-5 py-3.5 border-b border-border/30">
            <h3 className="text-sm font-semibold text-foreground">系统活动</h3>
          </div>
          {(recentActivity ?? []).length > 0 ? (
            (recentActivity ?? []).map((act: any, i: number) => (
              <div
                key={act.id}
                className={`flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors ${
                  i !== (recentActivity?.length ?? 0) - 1 ? "border-b border-border/20" : ""
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{act.action}</p>
                  <p className="text-[11px] text-muted-foreground">{timeAgo(act.created_at)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state py-10">
              <div className="empty-state-icon">
                <TrendingUp className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <p className="empty-state-title text-sm">暂无活动</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

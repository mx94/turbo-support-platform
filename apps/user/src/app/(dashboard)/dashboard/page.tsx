import { type ReactElement } from "react";
import { createClient } from "@repo/database/server";
import { redirect } from "next/navigation";
import {
  MessageCircle,
  Bot,
  ArrowRight,
  FileText,
  BookOpen,
  Bell,
  CheckCircle2,
  AlertCircle,
  Zap,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";


const ACTIVITY_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  "ticket.created": { icon: FileText, color: "text-primary", bg: "bg-primary/10" },
  "ticket.resolved": { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  "ticket.updated": { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
  "knowledge.viewed": { icon: BookOpen, color: "text-amber-500", bg: "bg-amber-500/10" },
  default: { icon: MessageCircle, color: "text-muted-foreground", bg: "bg-muted" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(dateStr).toLocaleDateString("zh-CN");
}


const QUICK_ACTIONS = [
  {
    title: "人工服务",
    desc: "与专业客服人员实时对话",
    icon: MessageCircle,
    href: "/dashboard/support",
    iconClass: "text-primary bg-primary/10",
  },
  {
    title: "知识库",
    desc: "浏览帮助文章与常见解答",
    icon: BookOpen,
    href: "/dashboard/knowledge",
    iconClass: "text-blue-500 bg-blue-500/10",
  },
  {
    title: "工单记录",
    desc: "查看和追踪所有客服工单",
    icon: FileText,
    href: "/dashboard/tickets",
    iconClass: "text-amber-500 bg-amber-500/10",
  },
  {
    title: "AI 智能助手",
    desc: "获取即时帮助与智能建议",
    icon: Bot,
    href: "/dashboard/ai-chat",
    iconClass: "text-emerald-500 bg-emerald-500/10",
  },
];

export default async function DashboardPage(): Promise<ReactElement> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await (supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as any) as { data: { full_name: string | null } | null };

  const displayName = profile?.full_name ?? user.email?.split("@")[0] ?? "用户";

  const { data: tickets } = await supabase
    .from("tickets")
    .select("status, created_at")
    .eq("user_id", user.id);

  const ticketList = tickets ?? [];
  const totalTickets = ticketList.length;
  const openTickets = ticketList.filter((t: any) => t.status === "open" || t.status === "in_progress").length;
  const resolvedTickets = ticketList.filter((t: any) => t.status === "resolved" || t.status === "closed").length;

  const { count: unreadNotifs } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  const { data: activities } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const activityList = activities ?? [];


  const stats = [
    { label: "工单总数", value: totalTickets, icon: FileText, color: "text-foreground" },
    { label: "处理中", value: openTickets, icon: AlertCircle, color: "text-amber-600" },
    { label: "已解决", value: resolvedTickets, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "未读通知", value: unreadNotifs ?? 0, icon: Bell, color: "text-primary" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* ── 欢迎头部 ── */}
      <div className="page-header animate-fade-in-up">
        <div className="page-badge">
          <Zap className="w-3 h-3" />
          <span>个人中心</span>
        </div>
        <h1 className="page-title text-3xl">
          你好，
          <span className="text-gradient-brand">{displayName}</span>
        </h1>
        <p className="page-subtitle">
          欢迎回来！
        </p>
      </div>

      {/* ── 统计卡片 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="stat-card-label">
              <s.icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </div>
            <div className={`stat-card-value ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── 快速操作 ── */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((a, i) => (
            <Link
              key={a.href}
              href={a.href}
              className="group glass-card rounded-2xl p-5 cursor-pointer hover-lift animate-fade-in-up"
              style={{ animationDelay: `${(i + 4) * 80}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl ${a.iconClass} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}>
                  <a.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground mb-0.5 group-hover:text-primary transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 最近活动 ── */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">最近活动</h2>
        <div className="glass-card rounded-2xl overflow-hidden">
          {activityList.length > 0 ? (
            activityList.map((activity: any, i: number) => {
              const conf = ACTIVITY_ICONS[activity.action] ?? ACTIVITY_ICONS.default;
              const Icon = conf.icon;
              return (
                <div
                  key={activity.id}
                  className={`flex items-center gap-3 px-5 py-3.5 ${
                    i !== activityList.length - 1 ? "border-b border-border/30" : ""
                  } hover:bg-muted/30 transition-colors`}
                >
                  <div className={`w-8 h-8 rounded-lg ${conf.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${conf.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.action.replace(".", " — ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(activity.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state py-12">
              <div className="empty-state-icon">
                <MessageCircle className="w-6 h-6 text-muted-foreground/60" />
              </div>
              <p className="empty-state-title">暂无最近活动</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

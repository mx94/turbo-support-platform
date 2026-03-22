import { type ReactElement } from "react";
import { createClient } from "@repo/database/server";
import { redirect } from "next/navigation";
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  Mail,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default async function UsersPage(): Promise<ReactElement> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: adminProfile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if ((adminProfile as any)?.role !== "admin") redirect("/dashboard");

  const { data: profiles, count } = await supabase
    .from("profiles").select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const list = profiles ?? [];
  const statData = [
    { label: "总用户数", value: count ?? 0, color: "text-foreground" },
    { label: "管理员", value: list.filter((u: any) => u.role === "admin").length, color: "text-primary" },
    { label: "普通用户", value: list.filter((u: any) => u.role === "user").length, color: "text-blue-600" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* ── 头部 ── */}
      <div className="page-header animate-fade-in-up">
        <div className="page-badge">
          <Users className="w-3 h-3" />
          <span>用户管理</span>
        </div>
        <h1 className="page-title">用户列表</h1>
        <p className="page-subtitle">管理平台上注册的所有用户及其角色。</p>
      </div>

      {/* ── 统计 ── */}
      <div className="grid grid-cols-3 gap-3">
        {statData.map((s, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="stat-card-label">{s.label}</span>
            <span className={`stat-card-value ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── 搜索 ── */}
      <div className="relative animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索用户姓名或邮箱..."
          className="w-full h-10 pl-11 pr-4 glass-card rounded-xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* ── 用户表格 ── */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "260ms" }}>
        <div className="grid grid-cols-12 gap-4 px-5 py-2.5 border-b border-border/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-4">用户</div>
          <div className="col-span-3">邮箱</div>
          <div className="col-span-2">角色</div>
          <div className="col-span-2">注册时间</div>
          <div className="col-span-1">操作</div>
        </div>

        {list.map((p: any, i: number) => (
          <div
            key={p.id}
            className={`grid grid-cols-12 gap-4 px-5 py-3 items-center hover:bg-muted/30 transition-colors cursor-pointer ${
              i !== list.length - 1 ? "border-b border-border/20" : ""
            }`}
          >
            <div className="col-span-4 flex items-center gap-2.5">
              {p.avatar_url ? (
                <img src={p.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-border/40" />
              ) : (
                <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white text-[10px] font-bold">
                  {(p.full_name?.[0] ?? p.email?.[0] ?? "U").toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{p.full_name ?? "未设置"}</p>
                <p className="text-[10px] text-muted-foreground/50 font-mono">{p.id.substring(0, 8)}</p>
              </div>
            </div>
            <div className="col-span-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{p.email ?? "—"}</span>
            </div>
            <div className="col-span-2">
              {p.role === "admin" ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="w-3 h-3" />管理员
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  <Shield className="w-3 h-3" />用户
                </span>
              )}
            </div>
            <div className="col-span-2 text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(p.created_at)}
            </div>
            <div className="col-span-1">
              <button className="text-[11px] text-primary hover:underline font-medium cursor-pointer">详情</button>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <div className="empty-state py-10">
            <div className="empty-state-icon"><Users className="w-5 h-5 text-muted-foreground/50" /></div>
            <p className="empty-state-title text-sm">暂无注册用户</p>
          </div>
        )}
      </div>
    </div>
  );
}

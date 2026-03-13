import { type ReactElement } from "react";
import { createClient } from "@repo/database/server";
import { redirect } from "next/navigation";
import { Settings, Building2, Shield } from "lucide-react";
import { AdminSettingsForm } from "./AdminSettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage(): Promise<ReactElement> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await (supabase
    .from("profiles").select("*").eq("id", user.id)
    .single() as any) as { data: { full_name: string | null } | null };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* ── 头部 ── */}
      <div className="page-header animate-fade-in-up">
        <div className="page-badge">
          <Settings className="w-3 h-3" />
          <span>系统设置</span>
        </div>
        <h1 className="page-title">系统设置</h1>
        <p className="page-subtitle">管理你的组织架构和全平台通用配置。</p>
      </div>

      {/* ── 管理员资料 ── */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        <div className="px-6 py-4 border-b border-border/30 flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">管理员资料</h3>
        </div>
        <div className="p-6">
          <AdminSettingsForm
            userId={user.id}
            email={user.email ?? ""}
            initialFullName={profile?.full_name ?? ""}
          />
        </div>
      </div>

      {/* ── 平台配置 ── */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "160ms" }}>
        <div className="px-6 py-4 border-b border-border/30 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">平台配置</h3>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "组织名称", placeholder: "", defaultVal: "", type: "text" },
            { label: "客服联络邮箱", placeholder: "", type: "email" },
            { label: "平台 URL", placeholder: "", type: "url" },
          ].map((field, i) => (
            <div key={i} className="grid gap-1.5">
              <label className="text-xs font-medium text-foreground">{field.label}</label>
              <input
                className="flex h-10 w-full rounded-xl border border-border/40 bg-background/50 px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                placeholder={field.placeholder}
                type={field.type}
                defaultValue={field.defaultVal}
              />
            </div>
          ))}
          <div className="pt-4 border-t border-border/30">
            <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-xs font-medium text-primary-foreground cursor-pointer hover:bg-primary/90 shadow-sm transition-all">
              保存修改
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

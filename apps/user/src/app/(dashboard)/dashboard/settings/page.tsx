import { type ReactElement } from "react";
import { createClient } from "@repo/database/server";
import { redirect } from "next/navigation";
import { Mail, Shield, Key, Settings } from "lucide-react";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage(): Promise<ReactElement> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await (supabase
    .from("profiles").select("*").eq("id", user.id)
    .single() as any) as { data: { full_name: string | null; avatar_url: string | null } | null };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* ── 头部 ── */}
      <div className="page-header animate-fade-in-up">
        <div className="page-badge">
          <Settings className="w-3 h-3" />
          <span>账户设置</span>
        </div>
        <h1 className="page-title">账户设置</h1>
        <p className="page-subtitle">管理您的个人信息和安全设置。</p>
      </div>

      {/* ── 个人信息 ── */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        <div className="px-6 py-4 border-b border-border/30">
          <h2 className="text-sm font-semibold text-foreground">个人信息</h2>
        </div>
        <div className="p-6">
          <SettingsForm
            userId={user.id}
            email={user.email ?? ""}
            initialFullName={profile?.full_name ?? ""}
            initialAvatarUrl={profile?.avatar_url ?? ""}
          />
        </div>
      </div>

      {/* ── 安全信息 ── */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "160ms" }}>
        <div className="px-6 py-4 border-b border-border/30">
          <h2 className="text-sm font-semibold text-foreground">安全信息</h2>
        </div>
        <div className="p-6 space-y-3">
          {[
            { icon: Mail, label: "邮箱地址", value: user.email },
            { icon: Key, label: "用户 ID", value: user.id, mono: true },
            {
              icon: Shield, label: "认证方式",
              value: user.app_metadata?.provider === "google"
                ? "Google OAuth"
                : user.app_metadata?.provider === "github"
                ? "GitHub OAuth"
                : "Magic Link",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30">
              <item.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className={`text-sm text-foreground truncate ${item.mono ? "font-mono text-xs" : ""}`}>
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

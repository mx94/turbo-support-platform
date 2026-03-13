"use client";

import React, { useState, useTransition } from "react";
import { User, Save, Loader2, CheckCircle2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@repo/database";
import { toast } from "@repo/ui/components/ui/toast";

interface SettingsFormProps {
  userId: string;
  email: string;
  initialFullName: string;
  initialAvatarUrl: string;
}

export function SettingsForm({
  userId,
  email,
  initialFullName,
  initialAvatarUrl,
}: SettingsFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await (supabase
        .from("profiles")
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
        } as never)
        .eq("id", userId) as any);

      if (error) throw error;
      setSaved(true);
      toast({ title: "保存成功", description: "个人信息已更新", variant: "success" });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("保存失败:", err);
      toast({ title: "保存失败", description: "请检查网络连接后重试", variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = fullName !== initialFullName || avatarUrl !== initialAvatarUrl;

  return (
    <div className="space-y-6">
      {/* 头像预览 */}
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="头像"
            className="w-16 h-16 rounded-2xl object-cover border border-border/60"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-violet-700 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
        )}
        <div>
          <p className="text-base font-medium text-foreground">
            {fullName || email.split("@")[0]}
          </p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      {/* 表单字段 */}
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground">
            显示名称
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="输入您的显示名称"
            className="flex h-11 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 focus-visible:border-secondary/40 transition-all"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground">
            头像 URL
          </label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="flex h-11 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 focus-visible:border-secondary/40 transition-all"
          />
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex items-center gap-3 pt-4 border-t border-border/50">
        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "保存中..." : saved ? "已保存" : "保存修改"}
        </button>
        {saved && (
          <span className="text-sm text-emerald-600 font-medium">
            ✓ 个人信息已更新
          </span>
        )}
      </div>
    </div>
  );
}

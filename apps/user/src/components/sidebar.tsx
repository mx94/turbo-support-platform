"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  Bot,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  FileText,
  Bell,
  Zap,
} from "lucide-react";
import { useAuth } from "@repo/auth";
import { createBrowserSupabaseClient } from "@repo/database";
import { actGetUnreadCount } from "../app/(dashboard)/dashboard/notifications/actions";


const NAV_ITEMS = [
  { label: "个人中心", href: "/dashboard", icon: LayoutDashboard },
  { label: "人工服务", href: "/dashboard/support", icon: MessageCircle },
  { label: "工单记录", href: "/dashboard/tickets", icon: FileText },
  { label: "知识库", href: "/dashboard/knowledge", icon: BookOpen },
  { label: "AI 助手", href: "/dashboard/ai-chat", icon: Bot },
  { label: "通知中心", href: "/dashboard/notifications", icon: Bell },
  { label: "账户设置", href: "/dashboard/settings", icon: User },
];

export function Sidebar(): React.ReactElement {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadListCount, setUnreadListCount] = useState(0);
  const channelRef = React.useRef<any>(null);


  React.useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    const fetchUnread = async (uid: string) => {
      try {
        const res = await actGetUnreadCount(uid);
        if (res.success) setUnreadListCount(res.count ?? 0);
      } catch (e) {
        // ignore
      }
    };

    const setupRealtime = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) return;
        

        void fetchUnread(user.id);


        const channel = supabase
          .channel(`sidebar-notif-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              void fetchUnread(user.id);
            }
          )
          .subscribe();
          
        channelRef.current = channel;
      } catch (e) {
        // ignore
      }
    };
    
    void setupRealtime();

    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [pathname]);

  const handleSignOut = async (): Promise<void> => {

    if (channelRef.current) {
      const supabase = createBrowserSupabaseClient();
      void supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    await signOut();
    window.location.href = "/auth/login";
  };

  return (
    <aside
      className={`relative flex flex-col border-r border-border/40 bg-card/80 backdrop-blur-xl transition-all duration-300 flex-shrink-0 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 h-16 px-4 border-b border-border/40">
        <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0 shadow-sm">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-[15px] font-bold tracking-tight text-gradient-brand truncate">
            Turbo Platform
          </span>
        )}
      </div>

      {/* ── 导航 ── */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.href === "/dashboard/notifications" && unreadListCount > 0 && (
                <div className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unreadListCount > 99 ? "99+" : unreadListCount}
                </div>
              )}
              {isActive && !collapsed && item.href !== "/dashboard/notifications" && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              {collapsed && item.href === "/dashboard/notifications" && unreadListCount > 0 && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive border border-card" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── 底部 ── */}
      <div className="px-2 pb-3">
        <button
          type="button"
          onClick={() => { void handleSignOut(); }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-all duration-200 w-full"
          title={collapsed ? "退出登录" : undefined}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>退出登录</span>}
        </button>
      </div>

      {/* ── 折叠 ── */}
      <button
        type="button"
        onClick={() => { setCollapsed((c) => !c); }}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-border/60 bg-card shadow-sm flex items-center justify-center hover:bg-muted cursor-pointer transition-all duration-200 z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}

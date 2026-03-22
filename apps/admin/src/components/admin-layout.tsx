"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  LogOut,
  Users,
  FileText,
  BookOpen,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@repo/auth";
import { useState } from "react";
import { ToastProvider } from "@repo/ui/components/ui/toast";
import { ErrorBoundary } from "@repo/ui/components/ui/error-boundary";

interface AdminLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "数据仪表盘", icon: LayoutDashboard },
  { href: "/support", label: "客服工作台", icon: MessageSquare },
  { href: "/tickets", label: "工单管理", icon: FileText },
  { href: "/users", label: "用户管理", icon: Users },
  { href: "/knowledge", label: "知识库管理", icon: BookOpen },
  { href: "/settings", label: "系统设置", icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/auth/login";
  };

  return (
    <ToastProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* ── 侧边栏 ── */}
        <aside
          className={`relative flex flex-col border-r border-border/40 bg-card/80 backdrop-blur-xl transition-all duration-300 flex-shrink-0 ${
            collapsed ? "w-[68px]" : "w-[240px]"
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 h-16 px-4 border-b border-border/40">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0 shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="text-[15px] font-bold tracking-tight text-gradient-brand truncate">
                Turbo Admin
              </span>
            )}
          </div>

          {/* 导航 */}
          <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
            {!collapsed && (
              <div className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase">
                菜单
              </div>
            )}
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
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
                  <Icon
                    className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 底部 */}
          <div className="px-2 pb-3">
            <button
              onClick={() => { void handleSignOut(); }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-all duration-200 w-full"
              title={collapsed ? "退出登录" : undefined}
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>退出登录</span>}
            </button>
          </div>

          {/* 折叠 */}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-border/60 bg-card shadow-sm flex items-center justify-center hover:bg-muted cursor-pointer transition-all duration-200 z-10"
          >
            {collapsed ? (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        </aside>

        {/* ── 主内容 ── */}
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </ToastProvider>
  );
}

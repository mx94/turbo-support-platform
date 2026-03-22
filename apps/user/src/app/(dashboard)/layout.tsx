"use client";

import React from "react";
import { Sidebar } from "../../components/sidebar";
import { ToastProvider } from "@repo/ui/components/ui/toast";
import { ErrorBoundary } from "@repo/ui/components/ui/error-boundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <ToastProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* 侧边栏导航 */}
        <Sidebar />

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </ToastProvider>
  );
}

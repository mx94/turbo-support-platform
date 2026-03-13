"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { actMarkAllAsRead, actMarkAsRead } from "../actions";
import { useToast } from "@repo/ui/components/ui/toast";
import {
  MessageCircle,
  AlertCircle,
  UserPlus,
  Settings,
  BellOff,
  CheckCircle2
} from "lucide-react";


const NOTIF_TYPE: Record<string, { icon: any; color: string; bg: string }> = {
  ticket_update: { icon: MessageCircle, color: "text-blue-600", bg: "bg-blue-50" },
  system: { icon: Settings, color: "text-slate-600", bg: "bg-slate-50" },
  feedback_request: { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
  assignment: { icon: UserPlus, color: "text-primary", bg: "bg-primary/10" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} 天前`;
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

export function NotificationsClient({
  list,
  unread,
  userId,
}: {
  list: any[];
  unread: number;
  userId: string;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleMarkAll = () => {
    startTransition(async () => {
      const res = await actMarkAllAsRead(userId);
      if (!res.success) {
        addToast({
          title: "操作失败",
          description: res.error,
          variant: "error",
        });
      }
    });
  };

  const handleNotificationClick = (n: any) => {
    // 若未读则静默先标为已读
    if (!n.is_read) {
      startTransition(async () => {
        await actMarkAsRead(n.id);
      });
    }
    // 跳转到关联工单
    if (n.metadata?.ticket_id) {
      router.push(`/dashboard/support?ticketId=${n.metadata.ticket_id}`);
    } else {
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex items-start justify-between animate-fade-in-up">
        <div className="page-header">
          <div className="flex items-center gap-2">
            <div className="page-badge">
              <span className="text-xs">🔔</span>
              <span>通知中心</span>
            </div>
            {unread > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                {unread}
              </span>
            )}
          </div>
          <h1 className="page-title">通知</h1>
          <p className="page-subtitle">查看系统消息和工单更新。</p>
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={isPending}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer mt-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            全部已读
          </button>
        )}
      </div>

      {/* ── 列表 ── */}
      {list.length > 0 ? (
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          {list.map((n: any, i: number) => {
            const cfg = NOTIF_TYPE[n.type] ?? NOTIF_TYPE.system;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-start gap-3.5 px-5 py-4 transition-colors cursor-pointer ${
                  !n.is_read ? "bg-primary/[0.03]" : "hover:bg-muted/30"
                } ${i !== list.length - 1 ? "border-b border-border/30" : ""}`}
              >
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold truncate ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                      {n.title}
                    </h3>
                    {!n.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  {n.message && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                  )}
                  <span className="text-[11px] text-muted-foreground/50 mt-1 block">
                    {timeAgo(n.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <div className="empty-state">
            <div className="empty-state-icon">
              <BellOff className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="empty-state-title">暂无通知</p>
            <p className="empty-state-desc">
              目前还没有新的消息，有更新时我们会第一时间通知您。
            </p>
          </div>
        </div>
      )}
    </>
  );
}

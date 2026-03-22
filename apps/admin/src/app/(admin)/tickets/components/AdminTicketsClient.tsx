"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, XCircle, Clock, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { useToast } from "@repo/ui/components/ui/toast";
import { changeTicketStatus } from "../actions";

const STATUS: Record<string, { label: string; icon: any; class: string }> = {
  open: { label: "待处理", icon: AlertCircle, class: "status-open" },
  in_progress: { label: "处理中", icon: Loader2, class: "status-in-progress" },
  resolved: { label: "已解决", icon: CheckCircle2, class: "status-resolved" },
  closed: { label: "已关闭", icon: XCircle, class: "status-closed" },
};

const PRIORITY: Record<string, { label: string; class: string }> = {
  low: { label: "低", class: "priority-low" },
  medium: { label: "中", class: "priority-medium" },
  high: { label: "高", class: "priority-high" },
  urgent: { label: "紧急", class: "priority-urgent" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function AdminTicketsClient({ list }: { list: any[] }) {
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleUpdateStatus = async (status: "open" | "in_progress" | "resolved" | "closed") => {
    if (!selectedTicket) return;
    
    setIsSubmitting(true);
    const res = await changeTicketStatus(selectedTicket.id, status);
    setIsSubmitting(false);

    if (res.success) {
      addToast({ title: "状态已更新", description: `工单已变更为: ${STATUS[status].label}`, variant: "success" });
      setSelectedTicket(null);
    } else {
      addToast({ title: "更新失败", description: res.error || "请稍后重试", variant: "error" });
    }
  };

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "340ms" }}>
        <div className="grid grid-cols-12 gap-4 px-5 py-2.5 border-b border-border/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-4">工单</div>
          <div className="col-span-2">提交人</div>
          <div className="col-span-1">优先级</div>
          <div className="col-span-2">状态</div>
          <div className="col-span-2">创建时间</div>
          <div className="col-span-1">操作</div>
        </div>

        {list.map((ticket: any, i: number) => {
          const st = STATUS[ticket.status] ?? STATUS.open;
          const pr = PRIORITY[ticket.priority] ?? PRIORITY.medium;
          const StIcon = st.icon;
          const p = ticket.profiles;

          return (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-muted/30 transition-colors cursor-pointer ${
                i !== list.length - 1 ? "border-b border-border/20" : ""
              }`}
            >
              <div className="col-span-4 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
                <p className="text-[10px] text-muted-foreground/50 font-mono">#{ticket.id.substring(0, 8)}</p>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg gradient-brand flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                  {(p?.full_name?.[0] ?? p?.email?.[0] ?? "U").toUpperCase()}
                </div>
                <span className="text-xs text-muted-foreground truncate">
                  {p?.full_name ?? p?.email?.split("@")[0] ?? "未知"}
                </span>
              </div>
              <div className="col-span-1">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${pr.class}`}>{pr.label}</span>
              </div>
              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${st.class}`}>
                  <StIcon className="w-3 h-3" />
                  {st.label}
                </span>
              </div>
              <div className="col-span-2 text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(ticket.created_at)}
              </div>
              <div className="col-span-1">
                <button className="text-[11px] text-primary hover:underline font-medium cursor-pointer">管理</button>
              </div>
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="empty-state py-10">
            <div className="empty-state-icon"><FileText className="w-5 h-5 text-muted-foreground/50" /></div>
            <p className="empty-state-title text-sm">暂无工单</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && !isSubmitting && setSelectedTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>管理工单</DialogTitle>
            <DialogDescription>
              当前处理的工单：<span className="font-semibold text-foreground"> {selectedTicket?.title} </span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col gap-4">
            <p className="text-sm text-foreground">{selectedTicket?.description || "没有具体描述"}</p>
            <div className="border border-border/50 rounded-lg p-4 bg-muted/20">
              <h4 className="text-xs font-semibold text-muted-foreground mb-3 tracking-widest uppercase">更改状态</h4>
              <div className="flex flex-wrap gap-2">
                <Button variant={selectedTicket?.status === "in_progress" ? "default" : "outline"} size="sm" onClick={() => handleUpdateStatus("in_progress")} disabled={isSubmitting}>
                  转为 处理中
                </Button>
                <Button variant={selectedTicket?.status === "resolved" ? "default" : "outline"} size="sm" onClick={() => handleUpdateStatus("resolved")} disabled={isSubmitting}>
                  转为 已解决
                </Button>
                <Button variant={selectedTicket?.status === "closed" ? "default" : "outline"} size="sm" onClick={() => handleUpdateStatus("closed")} disabled={isSubmitting}>
                  转为 已关闭
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTicket(null)} disabled={isSubmitting}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

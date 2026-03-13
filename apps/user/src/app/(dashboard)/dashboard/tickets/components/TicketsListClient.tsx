"use client";

import { useState } from "react";
import { FileText, Clock, CheckCircle2, AlertCircle, Loader2, XCircle, Star } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { useToast } from "@repo/ui/components/ui/toast";
import { submitTicketRating } from "../actions";

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

export function TicketsListClient({ list }: { list: any[] }) {
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleTicketClick = (ticket: any) => {
    // 仅当工单已解决或已关闭，且且尚未评分时，才允许弹出评分对话框
    if ((ticket.status === "resolved" || ticket.status === "closed") && !ticket.rating) {
      setSelectedTicket(ticket);
      setRating(0);
      setComment("");
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedTicket || rating === 0) {
      addToast({ title: "提示", description: "请至少选择一个星级", variant: "warning" });
      return;
    }
    
    setIsSubmitting(true);
    const res = await submitTicketRating(selectedTicket.id, rating, comment);
    setIsSubmitting(false);

    if (res.success) {
      addToast({ title: "评价成功", description: "感谢您的反馈，我们会继续努力！", variant: "success" });
      setSelectedTicket(null);
    } else {
      addToast({ title: "评价失败", description: res.error || "请稍后重试", variant: "error" });
    }
  };

  if (list.length === 0) {
    return (
      <div className="glass-card rounded-2xl">
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileText className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="empty-state-title">暂无工单</p>
          <p className="empty-state-desc">
            您还没有提交过任何支持工单，前往人工服务创建一个吧。
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        {list.map((ticket: any, i: number) => {
          const st = STATUS[ticket.status] ?? STATUS.open;
          const pr = PRIORITY[ticket.priority] ?? PRIORITY.medium;
          const StIcon = st.icon;
          
          const isRateable = (ticket.status === "resolved" || ticket.status === "closed") && !ticket.rating;

          return (
            <div
              key={ticket.id}
              onClick={() => handleTicketClick(ticket)}
              className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                isRateable ? "hover:bg-muted/30 cursor-pointer" : ""
              } ${i !== list.length - 1 ? "border-b border-border/30" : ""}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${st.class} border`}>
                <StIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate">{ticket.title}</h3>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${pr.class}`}>{pr.label}</span>
                </div>
                {ticket.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{ticket.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground/70">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(ticket.created_at)}</span>
                  <span className="opacity-40">#{ticket.id.substring(0, 8)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {ticket.rating ? (
                  <div className="flex gap-0.5">
                    {Array.from({ length: ticket.rating }).map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                ) : isRateable ? (
                  <span className="text-[11px] text-primary font-medium hover:underline">点击评价</span>
                ) : null}
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${st.class}`}>
                  {st.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && !isSubmitting && setSelectedTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>评价本次客户服务</DialogTitle>
            <DialogDescription>
              您的工单「{selectedTicket?.title}」已处理完毕。请为我们的服务质量打分。
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      rating >= star ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground transition-colors"
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <div className="w-full mt-2">
              <label htmlFor="comment" className="text-sm font-medium mb-1 block text-left">附加评论 (选填)</label>
              <textarea
                id="comment"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="告诉我们更多关于您体验的具体细节..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTicket(null)} disabled={isSubmitting}>
              暂不评价
            </Button>
            <Button onClick={handleSubmitRating} disabled={isSubmitting || rating === 0}>
              {isSubmitting ? "提交中..." : "提交评价"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

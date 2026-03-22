"use client";

import React, { useEffect, useState } from "react";
import { useChannelStateContext, useChatContext } from "stream-chat-react";
import { User, Clock, FileText, CheckCircle2, Save, Loader2, AlertCircle } from "lucide-react";
import { fetchTicketAndUserDetails, updateTicketNotes } from "../actions";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Button } from "@repo/ui/components/ui/button";
import { useToast } from "@repo/ui/components/ui/toast";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function TicketDetailsSidebar() {
  const { channel } = useChannelStateContext();
  const { client } = useChatContext();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  const channelData = channel?.data as Record<string, any> | undefined;
  const ticketId = (channelData?.ticket_id as string | undefined) || channel?.id?.replace("ticket-", "");
  const customerUserId = React.useMemo(() => {
    // 1. 优先尝试从 channelData 取出我们注入的 created_by_id
    if (channelData?.created_by_id) {
      return channelData.created_by_id as string;
    }
    
    // 2. 如果因为某些原因缺失，则从当前频道成员中遍历找出非 admin 的角色
    if (channel?.state?.members) {
      const members = Object.values(channel.state.members);
      // 找出系统里角色不为 superadmin 或者是当前登录管理员以外的那个人
      const otherMember = members.find(m => m.user_id !== client.userID && m.user_id !== 'superadmin' && m.user?.id !== 'superadmin');
      if (otherMember?.user_id) {
         return otherMember.user_id;
      }
      if (otherMember?.user?.id) {
         return otherMember.user.id;
      }
    }
    
    // 3. Fallback
    return undefined;
  }, [channel?.state?.members, client.userID, channelData?.created_by_id]);

  useEffect(() => {
    let validUserId = customerUserId || null;
    let validTicketId = ticketId || undefined;

    if (validUserId === "undefined" || validUserId === "$undefined") validUserId = null;
    if (validTicketId === "undefined" || validTicketId === "$undefined") validTicketId = undefined;



    if (!validUserId) {
      setData(null);
      return;
    }

    if (validUserId === "$undefined") return;

    let isMounted = true;
    const loadDetails = async () => {
      setLoading(true);
      try {
        const result = await fetchTicketAndUserDetails(validTicketId, validUserId);
        if (isMounted) {
          setData(result);
          // @ts-ignore - Supabase type does not include internal_notes until generated
          setNotes(result.currentTicket?.internal_notes || "");
        }
      } catch (err) {
        console.error("Failed to load details", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadDetails();

    return () => { isMounted = false; };
  }, [ticketId, customerUserId, channel?.id]);

  const handleSaveNotes = async () => {
    if (!ticketId) return;
    setIsSaving(true);
    const res = await updateTicketNotes(ticketId, notes);
    setIsSaving(false);

    if (res.success) {
      addToast({ title: "已保存", description: "工单内部备注更新成功", variant: "success" });
    } else {
      addToast({ title: "保存失败", description: res.error || "发生了未知错误", variant: "error" });
    }
  };

  if (!channel) return null;

  if (loading) {
    return (
      <div className="w-80 min-w-80 max-w-80 border-l border-border bg-slate-50/30 flex items-center justify-center h-full shrink-0">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-80 min-w-80 max-w-80 border-l border-border bg-slate-50/30 flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground shrink-0">
        <AlertCircle className="w-8 h-8 opacity-20 mb-4" />
        <p className="text-sm">暂无关联的账户及工单信息</p>
      </div>
    );
  }

  const { profile, tickets, currentTicket } = data;

  return (
    <div className="w-80 min-w-80 max-w-80 border-l border-border bg-slate-50/30 flex flex-col h-full overflow-hidden shrink-0">
      <div className="px-5 py-6 border-b border-border/50 bg-white">
        <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          工单及客户资料
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto w-full">
        {/* 用户信息卡片 */}
        <div className="p-4 border-b border-border/50 bg-white m-3 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold shrink-0">
              {(profile?.full_name?.[0] || profile?.email?.[0] || "U").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate text-foreground">{profile?.full_name || "未知用户 (无此账号档案)"}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email || "无邮箱信息"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-slate-100 p-2 rounded-lg">
            <User className="w-3.5 h-3.5" />
            <span>注册用户 • ID: {profile?.id?.substring(0, 8) || "无关联 UID"}</span>
          </div>
        </div>

        {/* 内部备注区块 */}
        {ticketId && (
          <div className="px-5 py-4 border-b border-border/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">内部工单备注</h4>
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
              ) : (
                <Save className="w-3.5 h-3.5 text-muted-foreground opacity-50" />
              )}
            </div>
            <Textarea 
              placeholder="填写仅管理员可见的内部备忘信息..."
              className="text-sm min-h-[100px] resize-none focus-visible:ring-1 focus-visible:ring-primary/40 bg-white border-muted"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <Button 
                size="sm" 
                variant="secondary" 
                className="h-7 text-[11px]" 
                onClick={handleSaveNotes}
                // @ts-ignore
                disabled={isSaving || notes === currentTicket?.internal_notes}
              >
                保存备注
              </Button>
            </div>
          </div>
        )}

        {/* 历史工单追踪 */}
        <div className="px-5 py-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">历史记录 ({tickets.length})</h4>
          <div className="space-y-3">
            {tickets.map((t: any) => (
              <div key={t.id} className={`p-3 rounded-lg border text-sm transition-colors ${t.id === ticketId ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-white'}`}>
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <span className="font-medium text-foreground truncate">{t.title}</span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap -mt-0.5">
                    {t.status === 'resolved' || t.status === 'closed' ? '已结毕' : '处理中'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(t.created_at)}</span>
                  </div>
                  {t.rating && (
                    <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      ★ {t.rating} 分
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

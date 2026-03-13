"use client";

import React, { useState, useCallback } from "react";
import { StreamChatProvider } from "@repo/support";
import type { ChatUser } from "@repo/support";
import { CustomerChannelList } from "@repo/support";
import { Channel, Window, MessageList, useChatContext } from "stream-chat-react";
import { ConditionalMessageInput, CustomMessageActions, CustomSystemMessage, CustomEmptyStateIndicator, CustomChannelHeader, CustomMessage } from "@repo/support";
import { useSupportStore } from "@repo/support";
import { useToast } from "@repo/ui/components/ui/toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";

const ChannelWrapper = () => {
  const { channel } = useChatContext();
  
  if (!channel) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50 border-gray-200">
        <CustomEmptyStateIndicator variant="customer" />
      </div>
    );
  }

  return (
    <Channel Message={CustomMessage} MessageSystem={CustomSystemMessage} MessageActions={CustomMessageActions}>
      <Window>
        <CustomChannelHeader variant="customer" />
        <div className="flex flex-1 flex-col min-h-0 bg-slate-50/50">
          <MessageList />
        </div>
        <ConditionalMessageInput />
      </Window>
    </Channel>
  );
};

export function SupportWorkspace({ user }: { user: ChatUser }) {
  const { streamClient } = useSupportStore();
  const [isCreating, setIsCreating] = useState(false);
  const { addToast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");

  const fetchStreamToken = useCallback(async (u: ChatUser) => {
    const res = await fetch("/api/stream/token", {
      method: "POST",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch token: ${res.statusText}`);
    }
    const data = await res.json();
    return data.token;
  }, []);

  // 展开配置工单弹窗
  const handleOpenTicketForm = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const handleSubmitTicket = async () => {
    if (!ticketTitle.trim()) {
      addToast({ title: "工单标题必填", description: "请至少输入一个问题的摘要标题", variant: "warning" });
      return;
    }
    if (isCreating) return;
    if (!streamClient) {
      addToast({ title: "请稍候", description: "聊天服务正在连接中，请稍后再试", variant: "warning" });
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/stream/channel", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: ticketTitle, description: ticketDesc })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || `创建失败 (${res.status})`);
      }
      const { channelId, channelType } = await res.json();

      const channel = streamClient.channel(channelType, channelId);
      await channel.watch();

      addToast({ title: "工单已创建", description: "客服代表将很快加入对话", variant: "success" });
      
      // Reset form
      setIsDialogOpen(false);
      setTicketTitle("");
      setTicketDesc("");
    } catch (error) {
      console.error("创建工单失败:", error);
      addToast({ 
        title: "创建失败", 
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "error" 
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <StreamChatProvider 
        user={user} 
        fetchToken={fetchStreamToken}
        loadingRenderer={() => (
          <div className="flex flex-1 overflow-hidden rounded-2xl border border-border bg-white shadow-lg min-h-[600px] w-full transition-all duration-300">
            <CustomerChannelList 
               streamClient={null} 
               userId={user.id} 
               handleOpenTicketForm={handleOpenTicketForm}
            />
            <div className="flex flex-1 flex-col bg-background relative w-full h-full items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-sm text-muted-foreground">正在连接客服通讯引擎...</p>
            </div>
          </div>
        )}
      >
        <div className="flex flex-1 overflow-hidden rounded-2xl border border-border bg-white shadow-lg min-h-[600px] w-full transition-all duration-300">
          <CustomerChannelList 
             streamClient={streamClient} 
             userId={user.id} 
             handleOpenTicketForm={handleOpenTicketForm}
          />

          <div className="flex flex-1 flex-col bg-background relative w-full h-full">
            <ChannelWrapper />
          </div>
        </div>
      </StreamChatProvider>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建工单</DialogTitle>
            <DialogDescription>
              请简要描述您遇到的问题，提交后我们的客服团队将尽快为您解答。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">标题 *</label>
              <Input
                id="title"
                placeholder="例如：请问怎么获取您的联系方式？"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="desc" className="text-sm font-medium">详细诉求内容 (选填)</label>
              <textarea
                id="desc"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="请提供关于您的问题的更多细节内容..."
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>取消</Button>
            <Button onClick={handleSubmitTicket} disabled={isCreating || !ticketTitle.trim()}>
              {isCreating ? "创建中..." : "提交工单并开始对话"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import React, { useMemo, useCallback } from "react";
import { StreamChatProvider } from "@repo/support";
import type { ChatUser } from "@repo/support";
import { AdminChannelList } from "@repo/support";
import { Channel, Window, MessageList, useChatContext } from "stream-chat-react";
import { ConditionalMessageInput, CustomMessageActions, CustomSystemMessage, CustomEmptyStateIndicator, CustomChannelHeader, CustomMessage } from "@repo/support";
import { useSupportStore } from "@repo/support";
import { changeTicketStatus } from "../tickets/actions";
import { useToast } from "@repo/ui/components/ui/toast";
import { TicketDetailsSidebar } from "./components/TicketDetailsSidebar";

const ChannelWrapper = () => {
  const { channel } = useChatContext();
  const { addToast } = useToast();
  const [isClosingTicket, setIsClosingTicket] = React.useState(false);
  
  if (!channel) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50 border-gray-200">
        <CustomEmptyStateIndicator variant="admin" />
      </div>
    );
  }

  const handleCloseTicket = async () => {
    // 兼容取法：优先从 channel data 自定义属性拿，拿不到的话从频道的 ID（固定格式 ticket-xxx）里截取出来
    const rawDataId = (channel.data as Record<string, any>)?.ticket_id;
    const ticketId = rawDataId || (channel.id?.startsWith("ticket-") ? channel.id.replace("ticket-", "") : undefined);
    
    if (!ticketId) {
      addToast({ title: "操作无效", description: "当前聊天频道未关联有效的工单 ID，无法执行关单", variant: "error" });
      return;
    }

    setIsClosingTicket(true);
    try {
      const res = await changeTicketStatus(ticketId as string, "closed");
      if (res.error) {
        addToast({ title: "状态更新失败", description: res.error, variant: "error" });
      } else {
        addToast({ title: "工单已完毕", description: "当前聊天频道对应的工单已被正式关闭", variant: "success" });
        // 为了更新界面状态，可以在局部记录状态：
        if (channel.data) {
           // @ts-ignore - Stream chat custom data allows arbitrary fields
           channel.data.status = "closed";
        }
      }
    } catch (e: any) {
      addToast({ title: "操作发生异常", description: e.message || "请求服务器失败", variant: "error" });
    } finally {
      setIsClosingTicket(false);
    }
  };

  return (
    <Channel Message={CustomMessage} MessageSystem={CustomSystemMessage} MessageActions={CustomMessageActions}>
      <div className="flex flex-1 w-full h-full overflow-hidden">
        <Window>
          <CustomChannelHeader 
            variant="admin" 
            isClosingTicket={isClosingTicket}
            onCloseTicket={handleCloseTicket}
          />
          <div className="flex flex-1 flex-col min-h-0 bg-slate-50/50">
            <MessageList />
          </div>
          <ConditionalMessageInput />
        </Window>
        <TicketDetailsSidebar />
      </div>
    </Channel>
  );
};

export function SupportWorkspace({ user }: { user: ChatUser }) {
  const { streamClient } = useSupportStore();

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

  return (
    <StreamChatProvider user={user} fetchToken={fetchStreamToken}>
      <div className="flex flex-1 overflow-hidden rounded-2xl border border-border bg-white shadow-lg min-h-[600px] w-full transition-all duration-300">
        <AdminChannelList streamClient={streamClient} userId={user.id} />

        <div className="flex flex-1 flex-col bg-background relative w-full h-full">
          <ChannelWrapper />
        </div>
      </div>
    </StreamChatProvider>
  );
}

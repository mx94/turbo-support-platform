"use server";

import { updateTicketStatus, createNotification } from "@repo/database/queries";
import { revalidatePath } from "next/cache";
import type { TicketStatus } from "@repo/database/types";
import { StreamChat } from "stream-chat";

const STATUS_zhCN: Record<TicketStatus, string> = {
  open: "等待处理",
  in_progress: "处理中",
  resolved: "已解决",
  closed: "已关闭"
};

export async function changeTicketStatus(ticketId: string, status: TicketStatus) {
  try {
    const { data: updatedTicket, error } = await updateTicketStatus(ticketId, status);
    if (error || !updatedTicket) throw new Error(error?.message || "Failed to update ticket status");
    
    // 发放通知给对应用户
    try {
      if (updatedTicket.user_id) {

        const notifResult = await createNotification({
          userId: updatedTicket.user_id,
          type: 'ticket_update',
          title: `工单状态更新：${STATUS_zhCN[status] || status}`,
          message: `您的工单「${updatedTicket.title}」状态已变更为 ${STATUS_zhCN[status] || status}。`,
          metadata: { ticket_id: ticketId, new_status: status }
        });

      } else {

      }
    } catch (notifErr) {
      console.error("[NotificationTrigger] Exception caught:", notifErr);
    }

    // 如果状态变为 closed/resolved 彻底结束，则同步冻结 Stream Chat 的关联频道
    try {
      const apiKey = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY;
      const apiSecret = process.env.STREAM_CHAT_API_SECRET;
      if (apiKey && apiSecret) {
        const streamClient = StreamChat.getInstance(apiKey, apiSecret);
        
        // 频道的 ID 虽然在创建时被定制成了 ticket-xxxx，但我们直接根据这个 ID 获取实例
        const channelId = `ticket-${ticketId}`;
        const filter = { id: channelId } as any;
        const sort = [{ last_message_at: -1 as const }];
        const result = await streamClient.queryChannels(filter, sort, { limit: 1 });
        
        if (result.length > 0) {
          const channel = result[0];
          // 如果新状态是已关闭或者已解决，冻结频道，不再允许输入新消息
          if (status === 'closed' || status === 'resolved') {
             await channel.updatePartial({ set: { frozen: true, status: status } as any });
          } else {
             // 如果恢复为 in_progress 或 open，我们帮它解冻
             await channel.updatePartial({ set: { frozen: false, status: status } as any });
          }
        }
      }
    } catch (streamError) {
      console.error("Failed to sync stream channel frozen state:", streamError);
      // 非致命错误，不阻断前台
    }

    // 重新验证页面缓存，让最新数据生效
    revalidatePath("/tickets");
    revalidatePath("/");
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

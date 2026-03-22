import { NextResponse } from "next/server";
import { StreamChat } from "stream-chat";
import { createClient } from "@repo/database/server";
import { createTicket } from "@repo/database/queries";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title = body.title?.trim();
    const description = body.description?.trim();

    if (!title) {
      return NextResponse.json({ error: "Title is required for ticket creation" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY;
    const apiSecret = process.env.STREAM_CHAT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }

    // 1. 创建 Ticket 记录 (此时还没有 Stream Channel ID，暂时传空或不传)
    const { data: ticket, error: ticketError } = await createTicket({
      userId: user.id,
      title,
      description,
      priority: "medium",
      category: "general",
    });

    if (ticketError || !ticket) {
      console.error("创建工单失败:", ticketError);
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }

    // 2. 查出所有的系统管理员
    const { data: adminData } = await supabase.rpc("get_admin_ids");
    const adminIds = (adminData as unknown as any[])?.map((row: any) => row.admin_id) || [];
    
    // 频道成员 = 用户自己 + 所有管理员
    const memberIds = Array.from(new Set([user.id, ...adminIds]));

    const serverClient = StreamChat.getInstance(apiKey, apiSecret);

    const channelId = `ticket-${ticket.id}`;
    
    // 3. 创建 Stream 频道
    const channel = serverClient.channel("messaging", channelId, {
      name: title, // 用户的工单标题
      members: memberIds,
      created_by_id: user.id,
      ticket_id: ticket.id,
    } as Record<string, unknown>);
    
    await channel.create();

    // 4. 更新刚才新建的 Ticket 绑定对应的 Channel ID
    await (supabase.from("tickets") as any)
      .update({ stream_channel_id: channelId })
      .eq("id", ticket.id);

    // 5. 如果用户填了 description，作为用户的首条请求发送，否则发一条纯系统提示
    const displayDescription = description ? `诉求内容：\n${description}` : "";
    await channel.sendMessage({
      text: `${displayDescription}`,
      user_id: user.id, // 用用户的身份发送
    });

    return NextResponse.json({ channelId, channelType: "messaging", ticket });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("创建频道/工单失败:", message);
    return NextResponse.json(
      { error: "Failed to create ticket channel", detail: message },
      { status: 500 }
    );
  }
}

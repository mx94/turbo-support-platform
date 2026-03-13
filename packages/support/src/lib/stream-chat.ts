"use client";

import { StreamChat, type User } from "stream-chat";

export interface ChatUser {
  id: string;
  name: string;
  image?: string;
  role?: string;
  [key: string]: any;
}

/**
 * 连接到 Stream Chat
 * 注意：通常情况下，普通用户从自己的后端接口获取 token，
 * 管理员或许有管理员身份的 token。
 */
export const connectStreamChat = async (user: ChatUser, token: string) => {
  if (!process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY) {
    console.warn("NEXT_PUBLIC_STREAM_CHAT_API_KEY 未配置");
  }

  // 每次连接创建独立的客户端实例，避免全局单例串号
  const client = new StreamChat(process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY || '');

  try {
    // 如已连接其他账户（尽管是新实例），进行安全清理
    if (client.user) {
      await client.disconnectUser();
    }

    // 执行连接
    await client.connectUser(
      {
        ...user,
        id: user.id,
        name: user.name,
        image: user.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`,
      } as User,
      token
    );

    return client;
  } catch (error) {
    console.error("Stream Chat 连接失败:", error);
    throw error;
  }
};

/**
 * 此时传入具体的 client 从外部断开其连接并销毁实例
 */
export const disconnectStreamChat = async (client: StreamChat | null) => {
  try {
    if (client && client.user) {
      await client.disconnectUser();
    }
  } catch (error) {
    console.error("Stream Chat 断开连接失败:", error);
    throw error;
  }
};



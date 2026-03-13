"use client";

import React, { useEffect, useState } from "react";
import { Chat, Streami18n } from "stream-chat-react";
import { Loader2 } from "lucide-react";
import { connectStreamChat, disconnectStreamChat, type ChatUser } from "../../lib/stream-chat";
import { useSupportStore } from "../../store/support";

// 导入 Stream Chat 基础样式
import "stream-chat-react/dist/css/v2/index.css";

// 导入国际化资源与日期配置
import Dayjs from "dayjs";
import "dayjs/locale/zh-cn";

// 可以在此处直接引入 stream-chat-react 里的中文 JSON（如果有需要合并自定义话术）
// import zhTranslation from "stream-chat-react/i18n/zh.json";

// 初始化中文国际化实例（配合 Dayjs 实现自由排版）
const i18nInstance = new Streami18n({ 
  language: "zh",
  DateTimeParser: Dayjs,
  translationsForLanguage: {
    "timestamp/DateSeparator": "{{ timestamp | timestampFormatter(format: 'YYYY-MM-DD') }}",
    "timestamp/MessageTimestamp": "{{ timestamp | timestampFormatter(format: 'YYYY-MM-DD HH:mm:ss') }}",
    "Type your message": "输入消息...",
    "Edit Message": "编辑消息",
    "Delete": "删除",
    "Cancel": "取消",
    "Send": "发送",
    "Reply": "回复",
    "Quote": "引用",
    "Thread": "话题讨论"
  }
});

export interface StreamChatProviderProps {
  user: ChatUser | null;
  /**
   * 获取/生成指定用户的 Stream Token 的函数。
   * 通常通过调用 `/api/stream/token` 接口实现。
   */
  fetchToken: (user: ChatUser) => Promise<string>;
  children: React.ReactNode;
  loadingRenderer?: () => React.ReactNode;
}

export const StreamChatProvider = ({
  user,
  fetchToken,
  children,
  loadingRenderer,
}: StreamChatProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    streamClient,
    setStreamClient,
    setConnected,
    setCurrentUser,
  } = useSupportStore();

  useEffect(() => {
    if (!user) {
      // 无用户时不建立聊天连接
      setIsLoading(false);
      return;
    }

    let isSubscribed = true;

    let activeClient: any = null;

    const initChat = async () => {
      try {
        setIsLoading(true);
        const token = await fetchToken(user);
        const client = await connectStreamChat(user, token);
        activeClient = client;

        if (isSubscribed) {
          setStreamClient(client);
          // 状态库保存以便子组件直接消费
          setCurrentUser(user as any);
          setConnected(true);
          setError(null);
        } else {
          // 如果组件在连接过程中被卸载，立即断开
          disconnectStreamChat(client);
        }
      } catch (err: any) {
        if (isSubscribed) {
          console.error("StreamChatProvider init error:", err);
          setError(err.message || "连接对话服务失败");
        }
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    };

    initChat();

    // 清理连接
    return () => {
      isSubscribed = false;
      if (activeClient) {
        disconnectStreamChat(activeClient).then(() => {
          setStreamClient(null);
          setConnected(false);
        });
      }
    };
  }, [user?.id, fetchToken]);

  if (isLoading) {
    return loadingRenderer ? (
      loadingRenderer()
    ) : (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !streamClient) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 rounded-lg bg-red-50 text-red-600 border border-red-200">
        {error || "未连接或已断开"}
      </div>
    );
  }

  return (
    <Chat client={streamClient} theme="str-chat__theme-light" i18nInstance={i18nInstance}>
      {children}
    </Chat>
  );
};

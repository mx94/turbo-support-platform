"use client";

import React, { useMemo } from "react";
import {
  useChannelStateContext,
  useChatContext,
} from "stream-chat-react";
import { Hash, Users, Circle, Clock, Shield, CheckCircle2 } from "lucide-react";

/**
 * 自定义频道头部组件 — TurboPlatform Design System
 *
 * 替换 Stream Chat 默认的 ChannelHeader，提供更符合设计规范的 UI。
 * 支持 customer & admin 两种变体。
 */
export const CustomChannelHeader = ({
  variant = "customer",
  onCloseTicket,
  isClosingTicket = false
}: {
  variant?: "customer" | "admin";
  onCloseTicket?: () => void;
  isClosingTicket?: boolean;
}) => {
  const { channel, channelCapabilities } = useChannelStateContext();
  const { client } = useChatContext();

  // 频道基本信息
  const channelData = channel?.data as Record<string, any> | undefined;
  const channelName = channelData?.name || "支持对话";
  const memberCount = channelData?.member_count ?? 0;

  // 在线成员数量
  const onlineCount = useMemo(() => {
    if (!channel?.state?.members) return 0;
    return Object.values(channel.state.members).filter(
      (m: any) => m.user?.online
    ).length;
  }, [channel?.state?.members]);

  // 频道创建时间
  const createdAt = useMemo(() => {
    const date = channel?.data?.created_at;
    if (!date) return "";
    const d = new Date(date as string);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 0) return "今天创建";
    if (diffDays === 1) return "昨天创建";
    if (diffDays < 7) return `${diffDays}天前创建`;
    return d.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    }) + "创建";
  }, [channel?.data?.created_at]);

  // 频道头像首字母
  const avatarInitial = useMemo(() => {
    const name = channelName;
    if (name.startsWith("Support Request")) return "S";
    return name.charAt(0).toUpperCase();
  }, [channelName]);

  return (
    <div className="channel-header">
      {/* 左侧：头像 + 频道信息 */}
      <div className="channel-header__left">
        <div className="channel-header__avatar">
          <span className="channel-header__avatar-text">{avatarInitial}</span>
          {onlineCount > 0 && (
            <span className="channel-header__avatar-status" />
          )}
        </div>

        <div className="channel-header__info">
          <div className="channel-header__title-row">
            <h3 className="channel-header__title">{channelName}</h3>
            {variant === "admin" && (
              <span className="channel-header__badge channel-header__badge--admin">
                <Shield className="w-3 h-3" />
                客服
              </span>
            )}
          </div>

          <div className="channel-header__meta">
            <span className="channel-header__meta-item">
              <Users className="w-3.5 h-3.5" />
              {memberCount} 位成员
            </span>
            {onlineCount > 0 && (
              <span className="channel-header__meta-item channel-header__meta-item--online">
                <Circle className="w-2.5 h-2.5 fill-current" />
                {onlineCount} 在线
              </span>
            )}
            {createdAt && (
              <span className="channel-header__meta-item">
                <Clock className="w-3.5 h-3.5" />
                {createdAt}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 右侧：频道类型标识 & 操作按钮 */}
      <div className="channel-header__right flex items-center gap-3">
        <div className="channel-header__type-badge">
          <Hash className="w-3.5 h-3.5" />
          {(channel?.type || "messaging") === "messaging" ? "即时通讯" : channel?.type}
        </div>
        {variant === "admin" && onCloseTicket && 
         // 如果该频道有 'send-message' 权限并且 status 没有被标记为 closed / resolved 才允许显示关单按钮
         channelCapabilities['send-message'] && 
         channelData?.status !== 'closed' && 
         channelData?.status !== 'resolved' && (
          <button
            disabled={isClosingTicket}
            onClick={onCloseTicket}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="将所关联的工单标记为已关闭"
          >
            {isClosingTicket ? (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            {isClosingTicket ? "关闭中..." : "结束对话并关单"}
          </button>
        )}
      </div>
    </div>
  );
};

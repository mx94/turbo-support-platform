"use client";

import React, { useMemo } from "react";
import type { ChannelPreviewUIComponentProps } from "stream-chat-react";
import { MessageCircle, Clock } from "lucide-react";

/**
 * 自定义频道预览组件
 * 遵循 ui-ux-pro-max 设计规范:
 * - Flat Design 风格 (无过度阴影/渐变)
 * - 紫色品牌色系 (primary/secondary)
 * - 清爽的 hover/active 过渡 (200ms)
 * - cursor-pointer + 明确的视觉反馈
 */
export const CustomChannelPreview = (
  props: ChannelPreviewUIComponentProps
) => {
  const {
    channel,
    activeChannel,
    displayTitle,
    latestMessagePreview,
    setActiveChannel,
    unread,
  } = props;

  const isSelected = channel?.id === activeChannel?.id;
  const latestMessageAt = channel?.state?.last_message_at;

  const timestamp = useMemo(() => {
    if (!latestMessageAt) return "";
    const now = new Date();
    const msgDate = new Date(latestMessageAt);
    const diffMs = now.getTime() - msgDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return msgDate.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  }, [latestMessageAt]);

  const handleClick = () => {
    setActiveChannel?.(channel);
  };

  // 获取频道首字母作为头像替代
  const avatarLetter = (displayTitle || "S").charAt(0).toUpperCase();

  return (
    <button
      className={`
        group w-full text-left px-3 py-2.5
        rounded-xl border transition-all duration-200 cursor-pointer
        flex items-center gap-3 overflow-hidden
        ${isSelected
          ? "bg-primary/10 border-primary/20"
          : "border-transparent hover:bg-muted/60"
        }
      `}
      onClick={handleClick}
      aria-selected={isSelected}
      role="option"
    >
      {/* 头像 */}
      <div
        className={`
          relative flex-shrink-0 w-10 h-10 rounded-xl
          flex items-center justify-center text-sm font-semibold
          transition-colors duration-200
          ${isSelected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary"
          }
        `}
      >
        {avatarLetter}
        {/* 未读指示器 */}
        {!!unread && !isSelected && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-sm">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </div>

      {/* 内容区 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`
              text-[13.5px] font-semibold truncate
              ${isSelected ? "text-primary" : "text-foreground"}
            `}
          >
            {displayTitle || "未命名对话"}
          </span>
          {timestamp && (
            <span className="text-[11px] text-muted-foreground flex-shrink-0 tabular-nums">
              {timestamp}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div
            className={`
              text-[12.5px] truncate leading-relaxed
              ${unread && !isSelected
                ? "text-foreground font-medium"
                : "text-muted-foreground"
              }
            `}
          >
            {latestMessagePreview || "暂无消息"}
          </div>
        </div>
      </div>
    </button>
  );
};

"use client";

import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import {
  MessageInput,
  useChannelStateContext,
  useMessageContext,
  MessageSimple,
  MessageTimestamp,
  MessageStatus,
} from 'stream-chat-react';
import type { EventComponentProps } from 'stream-chat-react';
import {
  MessageActions,
  defaultMessageActionSet,
} from 'stream-chat-react/experimental';
import { MessageCircle, Lock } from 'lucide-react';

import { Sparkles, MessageSquarePlus } from 'lucide-react';
export { CustomChannelHeader } from './CustomChannelHeader';

export const CustomEmptyStateIndicator = ({
  variant = 'customer'
}: {
  variant?: 'customer' | 'admin'
}) => (
  <div className="flex flex-col items-center justify-center w-full h-full text-center p-8 bg-white">
    <div className="flex items-center justify-center w-16 h-16 rounded-[1.25rem] bg-gray-50/80 border border-gray-100 shadow-sm mb-6">
      <MessageCircle className="w-7 h-7 text-gray-400" />
    </div>
    
    <h3 className="text-[17px] font-semibold text-gray-900 mb-1.5">
      {variant === 'admin' ? '暂无选中对话' : ''}
    </h3>
    <p className="text-[14px] text-gray-500 max-w-sm">
      {variant === 'admin'
        ? '请从左侧列表中选择一个对话。'
        : '选择已有对话或发起新对话。'}
    </p>
  </div>
);

export const ChannelListEmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
    {/* <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
      <MessageSquarePlus className="w-5 h-5 text-gray-400" />
    </div> */}
    <h4 className="text-[14.5px] font-medium text-gray-900">暂无对话</h4>
    <p className="text-[13px] text-gray-500 mt-1 max-w-[200px]">
      发起新对话后将显示在这里。
    </p>
  </div>
);

export const CustomSystemMessage = (props: EventComponentProps) => {
  const { message } = props;
  const { created_at = '', text } = message;
  const date = created_at.toString();

  return (
    <div className="flex justify-center mt-2 mb-6 w-full">
      <div className="bg-black bg-opacity-50 text-white text-xs p-2 max-w-full rounded-md">
        <strong dangerouslySetInnerHTML={{ __html: text?.trim() || '' }}></strong>
        {date && (
          <div className="opacity-75 mt-2">
            {dayjs(date).format('YYYY-MM-DD HH:mm:ss')}
          </div>
        )}
      </div>
    </div>
  );
};

export const CustomMessage = (props: any) => {
  return <MessageSimple {...props} />;
};

export const CustomMessageActions = () => {
  const customMessageActionSet = useMemo(() => {
    return defaultMessageActionSet.filter((action: any) => {
      return ['quote', 'edit', 'delete'].includes(action.type);
    });
  }, []);

  return <MessageActions messageActionSet={customMessageActionSet} />;
};

export const ConditionalMessageInput = () => {
  const { channelCapabilities, channel } = useChannelStateContext();

  if (!channel) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  const channelData = channel.data as Record<string, any> | undefined;
  const isChannelClosed = 
    !channelCapabilities['send-message'] || 
    channelData?.status === 'closed' || 
    channelData?.status === 'resolved';

  if (isChannelClosed) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 border-t border-border/50">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-[13px] font-medium text-foreground">
          对话已结束
        </p>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          工单已关闭，当前不再允许发送新消息
        </p>
      </div>
    );
  }

  return <MessageInput />;
};

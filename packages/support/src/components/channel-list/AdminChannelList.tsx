"use client";

import React from 'react';
import { ChannelList } from 'stream-chat-react';
import { ChannelListEmptyState } from '../chat/ChatComponents';
import { CustomChannelPreview } from './CustomChannelPreview';

export interface AdminChannelListProps {
  streamClient: any;
  userId: string;
}

export const AdminChannelList = ({
  streamClient,
  userId
}: AdminChannelListProps) => {
  const customOnAddedToChannel = async (setChannels: any, event: any) => {
    const eventChannel = event.channel;
    if (!eventChannel?.id || !(['messaging'].includes(eventChannel.type))) {
      return;
    }
    try {
      const newChannel = streamClient.channel(eventChannel.type, eventChannel.id);
      await newChannel.watch();
      setChannels((channels: any) => [newChannel, ...channels]);
    } catch (error) {
      console.error('Failed to add channel:', error);
    }
  };

  return (
    <div className="w-[320px] flex flex-col h-full shrink-0 relative z-10 border-r border-border/40 overflow-hidden">
      {/* 标题区 */}
      <div className="px-5 py-6 border-b border-border/30">
        <h3 className="text-[14px] font-semibold text-foreground">对话列表</h3>
      </div>

      {/* 频道列表 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pt-2">
        {streamClient && (
          <ChannelList
            filters={{
              type: 'messaging',
              members: { $in: [userId] },
            }}
            sort={{ last_message_at: -1 }}
            EmptyStateIndicator={ChannelListEmptyState}
            Preview={CustomChannelPreview}
            options={{
              state: true,
              watch: true,
              presence: true,
            }}
            allowNewMessagesFromUnfilteredChannels={false}
            onAddedToChannel={customOnAddedToChannel}
          />
        )}
      </div>
    </div>
  );
};

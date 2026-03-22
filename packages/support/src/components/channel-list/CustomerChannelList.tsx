"use client";

import React from 'react';
import { ChannelList } from 'stream-chat-react';
import { Plus } from 'lucide-react';
import { ChannelListEmptyState } from '../chat/ChatComponents';
import { CustomChannelPreview } from './CustomChannelPreview';
import { Button } from '@repo/ui/components/ui/button';
import type { ChannelType } from '../../types';

export interface CustomerChannelListProps {
  streamClient: any;
  handleOpenTicketForm?: () => void;
  userId: string;
  channelType?: ChannelType;
}

export const CustomerChannelList = ({
  streamClient,
  handleOpenTicketForm,
  userId,
  channelType = 'messaging',
}: CustomerChannelListProps) => (
  <div className="w-[320px] flex flex-col h-full shrink-0 relative z-[15] border-r border-border/40 overflow-hidden">
    {/* 顶部操作区 */}
    <div className="p-4 pb-2">
      {handleOpenTicketForm && (
        <Button 
          onClick={handleOpenTicketForm} 
          className="w-full h-10 rounded-xl text-[13.5px] font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          发起新对话
        </Button>
      )}
    </div>

    {/* 频道列表 */}
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-2">
      {streamClient && (
        <ChannelList
          filters={{
            type: channelType,
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
        />
      )}
    </div>
  </div>
);

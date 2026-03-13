"use client";

import React, { useEffect, useRef } from 'react';
import { useChatContext } from 'stream-chat-react';

export const ChannelWatcher = ({
  onChannelIdChange
}: {
  onChannelIdChange: (channelId: string | null) => void
}) => {
  const { channel } = useChatContext();
  const lastChannelIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!channel) return;

    const id = channel.id || '';

    if (lastChannelIdRef.current !== id) {
      lastChannelIdRef.current = id;
      onChannelIdChange(id);
    }
  }, [channel, onChannelIdChange]);

  return null;
};

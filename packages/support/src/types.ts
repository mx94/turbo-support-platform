/**
 * @repo/support 类型定义
 * 客服支持与 AI 聊天相关类型
 */

export type ChannelType = 'messaging' | 'ai-chat';

export interface BaseChannelData {
  name: string;
  topic?: string;
  type: ChannelType;
}

// 模拟 User 或是 AI Agent 的通用特征
export interface ChatActor {
  id: string;
  name: string;
  role: 'user' | 'admin' | 'ai-agent';
}

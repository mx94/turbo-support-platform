import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StreamChat } from "stream-chat";
import type { StoreApi, UseBoundStore } from "zustand";

interface IUser {
  id?: string;
  name: string;
  email?: string;
  isAdmin?: boolean;
}

interface SupportState {
  // Stream Chat 连接状态
  streamClient: StreamChat | null;
  isConnected: boolean;

  // 用户与认证
  currentUser: IUser | null;

  // 操作方法
  setStreamClient: (client: StreamChat | null) => void;
  setConnected: (connected: boolean) => void;
  setCurrentUser: (user: IUser | null) => void;
}

export const useSupportStore: UseBoundStore<StoreApi<SupportState>> = create<SupportState>()(
  persist(
    (set) => ({
      // 初始状态
      streamClient: null,
      isConnected: false,
      currentUser: null,

      // Stream 客户端操作
      setStreamClient: (client) => set({ streamClient: client }),
      setConnected: (connected) => set({ isConnected: connected }),
      setCurrentUser: (user) => set({ currentUser: user }),
    }),
    {
      name: "showcase-support-store",
      partialize: (state) => ({
        // 只持久化必要的数据
        currentUser: state.currentUser,
      }),
    }
  )
);

// 选择器，用于提升性能（避免不必要的重渲染）
export const useStreamClient = () =>
  useSupportStore((state) => state.streamClient);
export const useIsConnected = () =>
  useSupportStore((state) => state.isConnected);
export const useCurrentUser = () =>
  useSupportStore((state) => state.currentUser);

"use client";

import { createBrowserSupabaseClient } from "@repo/database";
import { useState } from "react";
import type { Provider } from "@supabase/supabase-js";

/**
 * 统一认证 Hook
 * 支持 Google / GitHub 社交登录 + 邮箱密码登录
 */
export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserSupabaseClient();

  /** 社交登录（Google / GitHub） */
  const signInWithOAuth = async (provider: Provider): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // 恢复为 PKCE 后端跳转模式
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "社交登录失败");
    } finally {
      setIsLoading(false);
    }
  };

  /** 邮箱 + 密码登录 */
  const signInWithPassword = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "登录失败，请检查账号和密码");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /** 邮箱 + 密码注册 */
  const signUpWithPassword = async (email: string, password: string, fullName?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (signUpError) throw signUpError;
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "注册失败，请检查邮箱格式或稍后重试");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /** 退出登录 */
  const signOut = async (): Promise<void> => {
    try {
      // 深度清理：主动移除遗留的聊天身份状态跟本地存储，避免退登后发生活跃度串号的情况
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem("showcase-support-store");
        // 如果有 stream sdk 默认留下的持久化数据，一并扫除
        const keysToRemove = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && (key.includes("stream") || key.toLowerCase().includes("chat"))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => window.localStorage.removeItem(k));
      }
    } catch (e) {
      console.warn("清理缓存失败 (可能环境受限):", e);
    }
    
    await supabase.auth.signOut();
  };

  return {
    signInWithOAuth,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    isLoading,
    error,
  };
}


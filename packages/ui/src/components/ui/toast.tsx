"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

/* ─── Toast 类型定义 ─── */
export interface ToastData {
  id: string
  title: string
  description?: string
  variant?: "default" | "success" | "error" | "warning"
  duration?: number
}

interface ToastContextValue {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}

/* ─── 快捷 toast 函数 ─── */
export function toast(props: Omit<ToastData, "id">) {
  // 通过自定义事件触发
  const event = new CustomEvent("toast", { detail: props })
  window.dispatchEvent(event)
}

/* ─── Toast Provider ─── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const addToast = React.useCallback((t: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastData = { ...t, id }
    setToasts((prev) => [...prev, newToast])

    // 自动移除
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, t.duration ?? 4000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  // 监听全局 toast 事件
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      addToast(detail)
    }
    window.addEventListener("toast", handler)
    return () => window.removeEventListener("toast", handler)
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

/* ─── 变体样式 ─── */
const variantStyles: Record<string, string> = {
  default: "border-border/60 bg-card text-foreground",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
}

/* ─── Toast 容器 ─── */
function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastData[]
  onRemove: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[999] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "relative rounded-xl border p-4 pr-10 shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom-5 fade-in duration-300",
            variantStyles[t.variant ?? "default"]
          )}
          role="alert"
        >
          <button
            onClick={() => onRemove(t.id)}
            className="absolute top-3 right-3 w-5 h-5 rounded-md flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="text-sm font-semibold">{t.title}</p>
          {t.description && (
            <p className="text-xs mt-0.5 opacity-80">{t.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}

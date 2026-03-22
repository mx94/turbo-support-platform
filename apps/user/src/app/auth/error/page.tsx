import { type ReactElement } from "react";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}): ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 -m-32 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -m-32 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md p-8 bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-destructive/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="relative z-10 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground">认证出错</h2>
          <p className="text-sm text-muted-foreground">
            {searchParams.error ?? "发生了未知错误，请重试。"}
          </p>
          <a
            href="/auth/login"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/90 transition-all"
          >
            返回登录
          </a>
        </div>
      </div>
    </div>
  );
}

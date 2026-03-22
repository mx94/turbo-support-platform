import { type ReactElement } from "react";
import { LoginForm } from "@repo/auth";

export default function LoginPage(): ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 -m-32 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -m-32 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <LoginForm />
    </div>
  );
}

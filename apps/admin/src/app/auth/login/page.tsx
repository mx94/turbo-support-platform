import { AdminLoginForm } from "@repo/auth";
import { type ReactElement } from "react";

export default function AdminLoginPage(): ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <AdminLoginForm redirectTo="/dashboard" />
    </div>
  );
}

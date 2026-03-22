import { type ReactElement } from "react";
import { createClient } from "@repo/database/server";
import { redirect } from "next/navigation";
import { NotificationsClient } from "./components/NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage(): Promise<ReactElement> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: notifications } = await supabase
    .from("notifications").select("*").eq("user_id", user.id)
    .order("created_at", { ascending: false }).limit(50);

  const list = notifications ?? [];
  const unread = list.filter((n: any) => !n.is_read).length;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <NotificationsClient 
        list={list} 
        unread={unread} 
        userId={user.id} 
      />
    </div>
  );
}

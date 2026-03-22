import { type ReactElement } from "react";
import { createClient } from "@repo/database/server";
import { redirect } from "next/navigation";
import { SupportWorkspace } from "./SupportWorkspace";

export default async function SupportPage(): Promise<ReactElement> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const chatUser = {
    id: user.id,
    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
    image: user.user_metadata?.avatar_url,
    role: "user",
  };

  return (
    <div className="flex h-full w-full p-4">
      <SupportWorkspace user={chatUser} />
    </div>
  );
}

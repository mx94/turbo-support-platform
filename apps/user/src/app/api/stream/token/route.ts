import { NextResponse } from "next/server";
import { StreamChat } from "stream-chat";
import { createClient } from "@repo/database/server";

export async function POST(_req: Request): Promise<NextResponse> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError ?? !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY;
    const apiSecret = process.env.STREAM_CHAT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    const token = serverClient.createToken(user.id);

    return NextResponse.json({ token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error", detail: message },
      { status: 500 }
    );
  }
}

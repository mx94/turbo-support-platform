"use server";

import { createAdminClient } from "@repo/database/server";

export async function fetchTicketAndUserDetails(ticketId: string | undefined, userId: string) {
  const supabase = createAdminClient();

  if (!userId) {
    return { profile: null, tickets: [], currentTicket: null };
  }

  // 1. 获取用户信息
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, role")
    .eq("id", userId)
    .maybeSingle();

  if (profileErr) console.error("fetchTicketAndUserDetails - profile error:", profileErr);

  // 2. 获取该用户的所有历史工单
  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, title, status, created_at, rating")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // 3. 获取当前工单的信息 (用于备注等)
  let currentTicket = null;
  if (ticketId && ticketId !== "undefined" && ticketId !== "$undefined") {
    const { data, error: ticketErr } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .maybeSingle();
      
    if (ticketErr) console.error("fetchTicketAndUserDetails - ticket error:", ticketErr);
    currentTicket = data;
  }

  return {
    profile,
    tickets: tickets || [],
    currentTicket,
  };
}

export async function updateTicketNotes(ticketId: string, notes: string) {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from("tickets")
    .update({ internal_notes: notes })
    .eq("id", ticketId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

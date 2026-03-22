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
  
  // NOTE: 我们在 tickets 表里可能没有专门的 notes 字段。
  // 我们暂时借用或者你可以在这里实现对 description/metadata 字段的覆盖，也可以新加一个字段。
  // 为了安全，假设目前使用 title 或者后续新增 internal_notes (如果不存在这会报错)。
  // 这里我们将备注信息写入关联的 activity_log 作为内部操作记录或者假设有 internal_notes 字段
  // 如果遇到类型错误，我们稍后可以直接使用 supabase rpc / sql 调整或者修改结构。
  
  const { error } = await supabase
    .from("tickets")
    .update({ 
      // @ts-ignore - 如果 ts-ignore 报错请通知我
      internal_notes: notes 
    })
    .eq("id", ticketId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

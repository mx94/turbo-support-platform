"use server";

import { rateTicket } from "@repo/database/queries";
import { revalidatePath } from "next/cache";

export async function submitTicketRating(ticketId: string, rating: number, comment?: string) {
  try {
    const { error } = await rateTicket(ticketId, rating, comment);
    if (error) throw new Error(error.message || "Failed to submit rating");
    
    // 重新验证页面缓存，让最新数据生效
    revalidatePath("/dashboard/tickets");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

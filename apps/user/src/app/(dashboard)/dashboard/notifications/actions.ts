"use server";

import { markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationCount } from "@repo/database/queries";
import { revalidatePath } from "next/cache";

export async function actGetUnreadCount(userId: string) {
  try {
    const { count, error } = await getUnreadNotificationCount(userId);
    if (error) throw new Error(error.message);
    return { success: true, count };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message };
  }
}

export async function actMarkAsRead(notificationId: string) {
  try {
    const { error } = await markNotificationAsRead(notificationId);
    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function actMarkAllAsRead(userId: string) {
  try {
    const { error } = await markAllNotificationsAsRead(userId);
    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

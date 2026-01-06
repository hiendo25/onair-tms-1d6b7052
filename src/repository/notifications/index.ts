import { createClient } from "@/services";

import { CreateNotificationPayload } from "./type";

const createNotification = async (payload: CreateNotificationPayload) => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("notifications").insert(payload).select("*");

    if (error || !data) {
      throw new Error(error?.message);
    }

    return data;
  } catch (err: any) {
    throw new Error(`Failed to create notification: ${err?.message}`);
  }
};

export { createNotification };

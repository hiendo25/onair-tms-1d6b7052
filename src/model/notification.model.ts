import { Tables } from "@/types/supabase.types";

export type Notifications = Tables<"notifications">;

export type NotificationType = Notifications["type"];

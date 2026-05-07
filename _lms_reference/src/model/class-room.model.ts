import { Enums, Tables } from "@/types/supabase.types";

export type ClassRoom = Tables<"class_rooms">;

export type ClassRoomStatus = Tables<"class_rooms">["status"];
export type ClassRoomType = Tables<"class_rooms">["room_type"];

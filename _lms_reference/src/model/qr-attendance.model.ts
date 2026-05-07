import { Tables } from "@/types/supabase.types";

export type ClassQRCode = Tables<"class_qr_codes">;
export type ClassAttendance = Tables<"class_attendances">;

export type QRCodeStatus = "inactive" | "active" | "expired" | "disabled";
export type AttendanceStatus = "present" | "late" | "absent" | "rejected";

export interface QRCodeWithRelations extends ClassQRCode {
  class_rooms?: {
    id: string;
    title: string;
    start_at: string;
    end_at: string;
  } | null;
  class_sessions?: {
    id: string;
    title: string;
    start_at: string;
    end_at: string;
  } | null;
}

export interface AttendanceWithRelations extends ClassAttendance {
  employees?: {
    id: string;
    employee_code: string;
    user_id: string;
  } | null;
  class_rooms?: {
    id: string;
    title: string;
  } | null;
  class_sessions?: {
    id: string;
    title: string;
  } | null;
  class_qr_codes?: {
    id: string;
    title: string;
    qr_code: string;
  } | null;
}

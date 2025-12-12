import { AttendanceStatus, ClassQRCode } from "@/model/qr-attendance.model";

export type CreateQRCodePayload = Pick<
  ClassQRCode,
  | "title"
  | "description"
  | "checkin_start_time"
  | "checkin_end_time"
  | "created_by"
  | "class_session_id"
  | "class_room_id"
>;

export interface QRCodeValidationResult {
  is_valid: boolean;
  qr_code_id?: string;
  message: string;
}

export interface AttendanceCheckInPayload {
  qr_code: string;
  employee_id: string;
  device_info?: Record<string, any>;
}

export interface AttendanceCheckInResult {
  success: boolean;
  message: string;
  attendance?: {
    id: string;
    qr_code_id: string;
    employee_id: string;
    class_room_id: string | null;
    class_session_id: string | null;
    attendance_status: AttendanceStatus | null;
    attended_at: string | null;
    created_at: string | null;
    device_info?: Record<string, any> | null;
    rejection_reason?: string | null;
  };
  rejection_reason?: string;
}

export interface UpdateQRCodePayload {
  title?: string;
  description?: string;
  checkin_start_time?: string | null;
  checkin_end_time?: string | null;
}

export type UpSertQrCodePayload =
  | {
      action: "create";
      payload: CreateQRCodePayload;
    }
  | { action: "update"; payload: UpdateQRCodePayload & { id: string } };

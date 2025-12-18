import type { AttendanceWithRelations, QRCodeStatus, QRCodeWithRelations } from "@/model/qr-attendance.model";
import { supabase } from "@/services";

import {
  AttendanceCheckInPayload,
  AttendanceCheckInResult,
  CreateQRCodePayload,
  QRCodeValidationResult,
  UpdateQRCodePayload,
  UpSertQrCodePayload,
} from "./type";

export * from "./type";

const generateQRCode = (): { qrCode: string; qrSecret: string } => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  const qrCode = `QR-${timestamp}-${randomStr}`;
  const qrSecret = `${Math.random().toString(36)}${Math.random().toString(36)}`.substring(2);
  return { qrCode, qrSecret };
};

const createClassQRCode = async (payload: CreateQRCodePayload) => {
  try {
    if (!payload.class_room_id || !payload.class_session_id) {
      throw new Error("Phải cung cấp class_room_id và class_session_id");
    }
    const { qrCode, qrSecret } = generateQRCode();

    const insertPayload = {
      ...payload,
      qr_code: qrCode,
      qr_secret: qrSecret,
      status: "active" as QRCodeStatus,
      is_enabled: true,
      allowed_radius_meters: 200,
    };
    return await supabase.from("class_qr_codes").insert(insertPayload).select().single();
  } catch (err: any) {
    console.error("Error creating QR code:", err);
    return { data: null, error: err.message || "Lỗi khi tạo QR code" };
  }
};

const getQRCodeById = async (qrCodeId: string) => {
  try {
    const { data, error } = await supabase
      .from("class_qr_codes")
      .select(
        `
        *,
        class_rooms (id, title, start_at, end_at),
        class_sessions (id, title, start_at, end_at)
      `,
      )
      .eq("id", qrCodeId)
      .single();

    if (error) throw error;
    return { data: data as QRCodeWithRelations, error: null };
  } catch (err: any) {
    console.error("Error getting QR code:", err);
    return { data: null, error: err.message };
  }
};

const getQRCodesByClassRoom = async (classRoomId: string) => {
  try {
    const { data, error } = await supabase
      .from("class_qr_codes")
      .select(
        `
        *,
        class_rooms (id, title, start_at, end_at)
      `,
      )
      .eq("class_room_id", classRoomId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: (data as QRCodeWithRelations[]) || [], error: null };
  } catch (err: any) {
    console.error("Error getting QR codes by class room:", err);
    return { data: [], error: err.message };
  }
};

const getQRCodesBySession = async (sessionId: string) => {
  try {
    const { data, error } = await supabase
      .from("class_qr_codes")
      .select(
        `
        *,
        class_sessions (id, title, start_at, end_at)
      `,
      )
      .eq("class_session_id", sessionId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: (data as QRCodeWithRelations[]) || [], error: null };
  } catch (err: any) {
    console.error("Error getting QR codes by session:", err);
    return { data: [], error: err.message };
  }
};

const activateQRCode = async (qrCodeId: string) => {
  try {
    const { data, error } = await supabase
      .from("class_qr_codes")
      .update({
        status: "active" as QRCodeStatus,
        is_enabled: true,
      })
      .eq("id", qrCodeId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error("Error activating QR code:", err);
    return { data: null, error: err.message || "Lỗi khi kích hoạt QR code" };
  }
};

const deactivateQRCode = async (qrCodeId: string) => {
  try {
    const { data, error } = await supabase
      .from("class_qr_codes")
      .update({
        status: "disabled" as QRCodeStatus,
        is_enabled: false,
      })
      .eq("id", qrCodeId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error("Error deactivating QR code:", err);
    return { data: null, error: err.message || "Lỗi khi vô hiệu hóa QR code" };
  }
};

const validateQRCode = async (qrCode: string): Promise<QRCodeValidationResult> => {
  try {
    const { data: qrCodeData, error: qrError } = await supabase
      .from("class_qr_codes")
      .select("*")
      .eq("qr_code", qrCode)
      .single();

    if (qrError || !qrCodeData) {
      return { is_valid: false, message: "QR code không tồn tại" };
    }

    // Check if disabled
    if (qrCodeData.status === "disabled" || !qrCodeData.is_enabled) {
      return { is_valid: false, message: "QR code đã bị vô hiệu hóa" };
    }

    // Check if expired
    if (qrCodeData.status === "expired") {
      return { is_valid: false, message: "QR code đã hết hạn" };
    }

    // Check if active
    if (qrCodeData.status !== "active") {
      return { is_valid: false, message: "QR code chưa được kích hoạt" };
    }

    // Check if within checkin time (if specified)
    if (qrCodeData.checkin_start_time && qrCodeData.checkin_end_time) {
      const now = new Date();
      const start = new Date(qrCodeData.checkin_start_time);
      const end = new Date(qrCodeData.checkin_end_time);

      if (now < start) {
        return { is_valid: false, message: "Chưa đến giờ check-in" };
      }

      if (now > end) {
        return { is_valid: false, message: "Đã hết giờ check-in" };
      }
    }

    return {
      is_valid: true,
      qr_code_id: qrCodeData.id,
      message: "QR code hợp lệ",
    };
  } catch (err: any) {
    console.error("Error validating QR code:", err);
    return { is_valid: false, message: err.message || "Lỗi khi kiểm tra QR code" };
  }
};

const checkInWithQR = async (payload: AttendanceCheckInPayload): Promise<AttendanceCheckInResult> => {
  try {
    // 1. Validate QR code
    const validation = await validateQRCode(payload.qr_code);
    if (!validation.is_valid) {
      return {
        success: false,
        message: validation.message,
        rejection_reason: validation.message,
      };
    }

    // 2. Lấy thông tin QR code
    const { data: qrCode, error: qrError } = await supabase
      .from("class_qr_codes")
      .select(
        `
        *,
        class_rooms (id),
        class_sessions (id)
      `,
      )
      .eq("qr_code", payload.qr_code)
      .single();

    if (qrError || !qrCode) {
      return {
        success: false,
        message: "Không tìm thấy QR code",
        rejection_reason: "QR code không tồn tại",
      };
    }

    // 3. Lấy class_room_id từ qrCode hoặc từ session
    let classRoomId = qrCode.class_room_id;

    if (!classRoomId && qrCode.class_session_id) {
      // Nếu là session, lấy class_room_id từ session
      const { data: session } = await supabase
        .from("class_sessions")
        .select("class_room_id")
        .eq("id", qrCode.class_session_id)
        .single();

      classRoomId = session?.class_room_id || null;
    }

    if (!classRoomId) {
      return {
        success: false,
        message: "Không xác định được lớp học",
        rejection_reason: "Lỗi dữ liệu",
      };
    }

    // 4. Kiểm tra học viên có trong danh sách lớp không
    const { data: enrollment, error: enrollError } = await supabase
      .from("class_room_employee")
      .select("*")
      .eq("class_room_id", classRoomId)
      .eq("employee_id", payload.employee_id)
      .single();

    if (enrollError || !enrollment) {
      return {
        success: false,
        message: "Bạn không có trong danh sách lớp học này",
        rejection_reason: "Không có trong danh sách",
      };
    }

    // 5. Kiểm tra đã điểm danh chưa
    const { data: existingAttendance } = await supabase
      .from("class_attendances")
      .select("*")
      .eq("qr_code_id", qrCode.id)
      .eq("employee_id", payload.employee_id)
      .maybeSingle();

    if (existingAttendance) {
      return {
        success: false,
        message: "Bạn đã điểm danh rồi",
        rejection_reason: "Đã điểm danh",
      };
    }

    // 6. Tạo bản ghi điểm danh
    const attendancePayload = {
      qr_code_id: qrCode.id,
      employee_id: payload.employee_id,
      class_room_id: qrCode.class_room_id,
      class_session_id: qrCode.class_session_id,
      attendance_status: "present" as const,
      device_info: payload.device_info,
    };

    const { data: attendance, error: attendanceError } = await supabase
      .from("class_attendances")
      .insert(attendancePayload)
      .select()
      .single();

    if (attendanceError) throw attendanceError;

    return {
      success: true,
      message: "Điểm danh thành công",
      attendance: attendance as any,
    };
  } catch (err: any) {
    console.error("Error checking in with QR:", err);
    return {
      success: false,
      message: "Có lỗi xảy ra khi điểm danh",
      rejection_reason: err.message,
    };
  }
};

const getAttendancesByClassRoom = async (classRoomId: string) => {
  try {
    const { data, error } = await supabase
      .from("class_attendances")
      .select(
        `
        *,
        employees (id, employee_code, user_id),
        class_qr_codes (id, title, qr_code)
      `,
      )
      .eq("class_room_id", classRoomId)
      .order("attended_at", { ascending: false });

    if (error) throw error;
    return { data: (data as unknown as AttendanceWithRelations[]) || [], error: null };
  } catch (err: any) {
    console.error("Error getting attendances by class room:", err);
    return { data: [], error: err.message };
  }
};

const getAttendancesBySession = async (sessionId: string) => {
  try {
    const { data, error } = await supabase
      .from("class_attendances")
      .select(
        `
        *,
        employees (id, employee_code, user_id),
        class_qr_codes (id, title, qr_code)
      `,
      )
      .eq("class_session_id", sessionId)
      .order("attended_at", { ascending: false });

    if (error) throw error;
    return { data: (data as unknown as AttendanceWithRelations[]) || [], error: null };
  } catch (err: any) {
    console.error("Error getting attendances by session:", err);
    return { data: [], error: err.message };
  }
};

const getAttendancesByEmployee = async (employeeId: string) => {
  try {
    const { data, error } = await supabase
      .from("class_attendances")
      .select(
        `
        *,
        class_rooms (id, title),
        class_sessions (id, title),
        class_qr_codes (id, title)
      `,
      )
      .eq("employee_id", employeeId)
      .order("attended_at", { ascending: false });

    if (error) throw error;
    return { data: (data as unknown as AttendanceWithRelations[]) || [], error: null };
  } catch (err: any) {
    console.error("Error getting attendances by employee:", err);
    return { data: [], error: err.message };
  }
};

const updateQRCode = async (qrCodeId: string, updates: UpdateQRCodePayload) => {
  try {
    const { data, error } = await supabase.from("class_qr_codes").update(updates).eq("id", qrCodeId).select().single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error("Error updating QR code:", err);
    return { data: null, error: err.message || "Lỗi khi cập nhật QR code" };
  }
};

const deleteQRCode = async (qrCodeId: string) => {
  try {
    const { error } = await supabase.from("class_qr_codes").delete().eq("id", qrCodeId);

    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    console.error("Error deleting QR code:", err);
    return { error: err.message || "Lỗi khi xóa QR code" };
  }
};

const getAttendanceStatsByQRCode = async (qrCodeId: string) => {
  try {
    const { data, error } = await supabase
      .from("class_attendances")
      .select("attendance_status")
      .eq("qr_code_id", qrCodeId);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      present: data?.filter((a) => a.attendance_status === "present").length || 0,
      late: data?.filter((a) => a.attendance_status === "late").length || 0,
      absent: data?.filter((a) => a.attendance_status === "absent").length || 0,
      rejected: data?.filter((a) => a.attendance_status === "rejected").length || 0,
    };

    return { data: stats, error: null };
  } catch (err: any) {
    console.error("Error getting attendance stats:", err);
    return {
      data: { total: 0, present: 0, late: 0, absent: 0, rejected: 0 },
      error: err.message,
    };
  }
};

const upsertQRCode = async (upSertPayload: UpSertQrCodePayload) => {
  try {
    const { qrCode, qrSecret } = generateQRCode();

    return await supabase
      .from("class_qr_codes")
      .upsert({
        ...upSertPayload.payload,
        title: upSertPayload.payload.title || "",
        qr_code: qrCode,
        qr_secret: qrSecret,
        status: "active" as QRCodeStatus,
        is_enabled: false,
        allowed_radius_meters: 200,
      })
      .select()
      .single();
  } catch (err: any) {
    console.error("Error creating QR code:", err);
    return { data: null, error: err.message || "Lỗi khi tạo QR code" };
  }
};

const deleteAttendancesByEmployeeId = async (employeeId: string) => {
  try {
    const { error } = await supabase
      .from("class_attendances")
      .delete()
      .eq("employee_id", employeeId);

    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    console.error("Error deleting attendances by employee:", err);
    return { error: err.message };
  }
};

const deleteQRCodesByEmployeeId = async (employeeId: string) => {
  try {
    const { error } = await supabase
      .from("class_qr_codes")
      .delete()
      .eq("created_by", employeeId);

    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    console.error("Error deleting QR codes by employee:", err);
    return { error: err.message };
  }
};

export {
  generateQRCode,
  createClassQRCode,
  getQRCodeById,
  getQRCodesByClassRoom,
  getQRCodesBySession,
  activateQRCode,
  deactivateQRCode,
  validateQRCode,
  checkInWithQR,
  getAttendancesByClassRoom,
  getAttendancesBySession,
  getAttendancesByEmployee,
  updateQRCode,
  deleteQRCode,
  getAttendanceStatsByQRCode,
  upsertQRCode,
  deleteAttendancesByEmployeeId,
  deleteQRCodesByEmployeeId,
};

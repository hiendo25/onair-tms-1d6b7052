import dayjs from "dayjs";
import { userAgent } from "next/server";

import { DomainError } from "@/lib/errors/DomainError";
import { ClassQRCode } from "@/model/qr-attendance.model";
import { classQRCodeRepository, classRoomRepository } from "@/repository";
import { EmployeeClassRoomAttendancePayload } from "@/repository/class-room";
import {
  StudentClassRoomCheckedInReturnDto,
  StudentClassRoomCheckInDto,
} from "@/types/dto/classRooms/student-check-in-classroom.dto";

type UserAgent = ReturnType<typeof userAgent>;

export class ClassRoomCheckInService {
  private userAgent: UserAgent;
  constructor(userAgent: UserAgent) {
    this.userAgent = userAgent;
  }
  async execute(input: StudentClassRoomCheckInDto): Promise<StudentClassRoomCheckedInReturnDto | null> {
    const { qrCode, classRoomId, classSessionId, employeeId } = input;

    const { data: dataQrCode, error } = await classQRCodeRepository.getClassQRCodeDetail({
      classRoomId,
      classSessionId,
      qrCode,
    });

    if (error) {
      // Infra layer error => donot using Domain Error
      throw new Error(error.message);
    }
    if (!dataQrCode) {
      throw new DomainError("Mã QR không tồn tại hoặc không hợp lệ", "QR_CODE_NOT_FOUND", 404);
    }

    if (!dataQrCode.is_enabled) {
      throw new DomainError("QrCode chưa được kích hoạt", "QR_CODE_NOT_ENABLED", 410);
    }

    this.checkValidStatusQrCode(dataQrCode.status);

    this.checkValidTimeQrCode(dataQrCode.checkin_start_time, dataQrCode.checkin_end_time);

    const isStudentExistsInClassRoom = await classRoomRepository.isEmployeeAssignedToClassRoom(employeeId, classRoomId);

    if (!isStudentExistsInClassRoom) {
      throw new DomainError("Học viên không tồn tại trong lớp học.", "STUDENT_IS_NOT_EXISTS", 404);
    }

    const { data: dataEmployeeAttendance, error: errorAttendance } = await classRoomRepository.getEmployeeAttendance(
      dataQrCode.id,
      employeeId,
    );

    if (errorAttendance) {
      throw new Error(errorAttendance.message);
    }

    if (dataEmployeeAttendance) {
      throw new DomainError("Học viên đã điểm danh.", "STUDENT_ALREADY_CHECKED_IN", 409);
    }

    /**
     * Do checkin
     */

    const employeeClassRoomAttendancePayload: EmployeeClassRoomAttendancePayload = this.getCheckInPayload({
      classRoomId,
      classSessionId,
      userAgent: this.userAgent,
      qrCodeId: dataQrCode.id,
      employeeId,
    });

    const { data, error: errorCheckIn } = await classRoomRepository.createEmployeeAttendance(
      employeeClassRoomAttendancePayload,
    );

    if (errorCheckIn) {
      throw new Error(errorCheckIn.message);
    }

    return data
      ? {
          classRoomId: data.class_room_id || "",
          employeeCode: data.employees.employee_code,
          classSessionId: data.class_session_id || "",
          checkedInAt: data.attended_at || "",
          fullName: data.employees.profiles?.full_name || "",
          qrCodeId: data.qr_code_id || "",
        }
      : null;
  }

  private getCheckInPayload = (params: {
    classRoomId: string;
    classSessionId: string;
    qrCodeId: string;
    employeeId: string;
    userAgent: UserAgent;
  }): EmployeeClassRoomAttendancePayload => {
    const { classRoomId, classSessionId, qrCodeId, employeeId } = params;
    return {
      attendance_method: "qr",
      attendance_mode: "offline",
      attended_at: dayjs().toISOString(),
      class_room_id: classRoomId,
      class_session_id: classSessionId,
      device_info: {
        userAgent: {
          ...userAgent,
        },
      },
      scan_location_lat: null,
      scan_location_lng: null,
      rejection_reason: null,
      qr_code_id: qrCodeId,
      distance_from_class: null,
      attendance_status: "present",
      employee_id: employeeId,
    };
  };
  private checkValidStatusQrCode = (status: ClassQRCode["status"]) => {
    if (status === "disabled") {
      throw new DomainError("QrCode đã bị hủy", "QR_CODE_DISABLED", 410);
    }
    if (status === "expired") {
      throw new DomainError("QrCode đã đã hết hạn", "QR_CODE_EXPIRED", 410);
    }

    if (status === "inactive") {
      throw new DomainError("QrCode chưa được kích hoạt", "QR_CODE_INACTIVE", 410);
    }
  };
  private checkValidTimeQrCode(startTime: string | null, endTime: string | null) {
    if (!startTime && !endTime) return;

    const now = dayjs();

    if (!dayjs(startTime).isValid() || !dayjs(endTime).isValid()) {
      throw new DomainError(`Invalid date`, "CHECK_IN_DATE_INVALID", 422);
    }

    if (now.isBefore(dayjs(startTime))) {
      throw new DomainError(`Chưa đến giờ check-in`, "CHECK_IN_INVALID", 409);
    }

    if (now.isAfter(dayjs(endTime))) {
      throw new DomainError(`Đã hết giờ check-in ${endTime}`, "CHECK_IN_INVALID", 409);
    }
  }
}

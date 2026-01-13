import dayjs from "dayjs";
import { userAgent } from "next/server";

import { ClassQRCode } from "@/model/qr-attendance.model";
import { classQRCodeRepository, classRoomRepository } from "@/repository";
import { EmployeeClassRoomAttendancePayload } from "@/repository/class-room";
import { StudentClassRoomCheckInDto } from "@/types/dto/classRooms/student-check-in-classroom.dto";

type UserAgent = ReturnType<typeof userAgent>;

export class ClassRoomCheckInService {
  private userAgent: UserAgent;
  constructor(userAgent: UserAgent) {
    this.userAgent = userAgent;
  }
  async execute(input: StudentClassRoomCheckInDto) {
    const { qrCode, classRoomId, classSessionId, employeeId } = input;

    const { data: dataQrCode, error } = await classQRCodeRepository.getClassQRCodeDetail({
      classRoomId,
      classSessionId,
      qrCode,
    });

    console.log({ error });
    if (!dataQrCode) {
      throw new Error("QrCode Invalid");
    }

    if (!dataQrCode.is_enabled) {
      throw new Error("QrCode đã ngừng sử dụng.");
    }

    this.checkValidStatusQrCode(dataQrCode.status);

    this.checkValidTimeQrCode(dataQrCode.checkin_start_time, dataQrCode.checkin_end_time);

    const isEmployeeExistsInClassRoom = await classRoomRepository.isEmployeeAssignedToClassRoom(
      employeeId,
      classRoomId,
    );

    if (!isEmployeeExistsInClassRoom) {
      throw new Error("Học viên không tồn tại trong lớp học.");
    }

    const { data: dataEmployeeAttendance, error: errorAttendance } = await classRoomRepository.getEmployeeAttendance(
      dataQrCode.id,
      employeeId,
    );

    if (errorAttendance) {
      throw new Error(errorAttendance.message);
    }

    if (dataEmployeeAttendance) {
      throw new Error("Học viên đã điểm danh.");
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

    return data;
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
      throw new Error("QrCode đã bị hủy");
    }
    if (status === "expired") {
      throw new Error("QrCode đã đã hết hạn");
    }

    if (status === "inactive") {
      throw new Error("QrCode đã ngừng kích hoạt");
    }
  };
  private checkValidTimeQrCode(startTime: string | null, endTime: string | null) {
    if (!startTime && !endTime) return;

    const now = dayjs();

    if (!dayjs(startTime).isValid() || !dayjs(endTime).isValid()) {
      throw new Error(`Time inValid, startTime: ${startTime}; endTime: ${endTime}`);
    }

    if (now.isBefore(dayjs(startTime))) {
      throw new Error(`Chưa đến giờ check-in ${startTime}, now: ${now}`);
    }

    if (now.isAfter(dayjs(endTime))) {
      throw new Error(`Đã hết giờ check-in ${endTime}`);
    }
  }
}

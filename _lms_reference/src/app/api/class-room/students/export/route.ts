import { NextRequest, NextResponse } from "next/server";

import { fDateTime } from "@/lib/dayjs";
import { classRoomRepository } from "@/repository";
import { createServiceRoleClient } from "@/services";
import type { ClassRoomStudentDto } from "@/types/dto/classRooms/classRoom.dto";

export const dynamic = "force-dynamic";

const ATTENDANCE_LABELS: Record<"attended" | "absent" | "pending", string> = {
  attended: "Tham gia",
  absent: "Vắng mặt",
  pending: "Chưa xác định",
};

const MAX_PAGE_SIZE = 1000;

const resolveOrganizationUnitName = (student: ClassRoomStudentDto, unitType: "branch" | "department") => {
  if (unitType === "department") {
    const departments = student.employee?.employee_departments ?? [];
    return departments[0]?.departments?.name ?? "-";
  }

  const branches = student.employee?.employee_branches ?? [];
  return branches[0]?.branches?.name ?? "-";
};

// const resolveAttendanceStatus = (
//   student: ClassRoomStudentDto,
// ): keyof typeof ATTENDANCE_LABELS => {
//   const hasCheckIn = student.class_room_attendance?.some(
//     (attendanceRecord) => Boolean(attendanceRecord.check_in_at),
//   );

//   return hasCheckIn ? "attended" : "absent";
// };

const formatDateTimeValue = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const formatted = fDateTime(value, "DD/MM/YYYY HH:mm");
  if (!formatted || formatted === "Invalid time value") {
    return "-";
  }

  return formatted;
};

const buildFileName = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T").join("_");
  return `danh_sach_hoc_vien_${timestamp}.xlsx`;
};

const normalizeParam = (value: string | null) => {
  if (!value || value === "all") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

async function collectStudents(input: {
  classRoomId: string;
  search?: string;
  branchId?: string;
  departmentId?: string;
  attendanceStatus?: "attended" | "absent" | "pending";
}) {
  const supabaseClient = await createServiceRoleClient();
  let page = 1;
  const allStudents: ClassRoomStudentDto[] = [];

  while (true) {
    const result = await classRoomRepository.getClassRoomStudents(
      {
        ...input,
        page,
        limit: MAX_PAGE_SIZE,
      },
      supabaseClient,
    );

    const chunk = result.data ?? [];
    if (chunk.length === 0) {
      break;
    }

    allStudents.push(...chunk);

    if (chunk.length < MAX_PAGE_SIZE || allStudents.length >= (result.total ?? 0)) {
      break;
    }

    page += 1;
  }

  return allStudents;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const classRoomId = normalizeParam(searchParams.get("classRoomId"));
    if (!classRoomId) {
      return NextResponse.json({ error: "Thiếu classRoomId" }, { status: 400 });
    }

    const search = normalizeParam(searchParams.get("search"));
    const branchId = normalizeParam(searchParams.get("branchId"));
    const departmentId = normalizeParam(searchParams.get("departmentId"));

    const attendanceParam = normalizeParam(searchParams.get("attendanceStatus")) as
      | "attended"
      | "absent"
      | "pending"
      | undefined;
    const attendanceStatus =
      attendanceParam && ["attended", "absent", "pending"].includes(attendanceParam)
        ? (attendanceParam as "attended" | "absent" | "pending")
        : undefined;

    const students = await collectStudents({
      classRoomId,
      search,
      branchId,
      departmentId,
      attendanceStatus,
    });

    if (students.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy dữ liệu phù hợp để xuất." }, { status: 404 });
    }

    const rows = students.map((student, index) => {
      // const attendanceStatusKey = resolveAttendanceStatus(student);
      // const attendanceLabel = ATTENDANCE_LABELS[attendanceStatusKey];
      // const attendanceRecord =
      //   student.class_room_attendance?.find(
      //     (record) => record.check_in_at || record.check_out_at,
      //   ) ?? student.class_room_attendance?.[0];

      return {
        STT: index + 1,
        "Mã nhân viên": student.employee?.employee_code ?? "-",
        "Họ và tên": student.employee?.profile?.full_name ?? "-",
        Email: student.employee?.profile?.email ?? "-",
        "Số điện thoại": student.employee?.profile?.phone_number ?? "-",
        "Chi nhánh": resolveOrganizationUnitName(student, "branch"),
        "Phòng ban": resolveOrganizationUnitName(student, "department"),
        "Thời gian gán": formatDateTimeValue(student.created_at),
        // "Điểm danh": attendanceLabel,
        // "Vào lớp": formatDateTimeValue(attendanceRecord?.check_in_at),
        // "Kết thúc": formatDateTimeValue(attendanceRecord?.check_out_at),
      };
    });

    const XLSXModule = await import("xlsx");
    const XLSX = XLSXModule.default ?? XLSXModule;

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HocVien");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const fileName = buildFileName();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Export class room students failed:", error);

    return NextResponse.json({ error: "Xuất danh sách học viên thất bại. Vui lòng thử lại." }, { status: 500 });
  }
}

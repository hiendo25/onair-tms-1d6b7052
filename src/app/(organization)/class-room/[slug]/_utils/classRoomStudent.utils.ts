import type { ClassRoomStudentDto } from "@/types/dto/classRooms/classRoom.dto";

export type AttendanceStatus = "attended" | "absent";

export const resolveStudentDepartmentName = (student: ClassRoomStudentDto): string => {
  const departments = student.employee?.employee_departments ?? [];
  return departments[0]?.departments?.name ?? "-";
};

export const resolveStudentAttendanceStatus = (student: ClassRoomStudentDto): AttendanceStatus => {
  const sessions = student.class_rooms?.sessions ?? [];
  const hasAttendance = sessions.some((session) =>
    (session.class_attendances ?? []).some((attendance) => Boolean(attendance.attended_at)),
  );

  return hasAttendance ? "attended" : "absent";
};

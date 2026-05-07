import { ClassRoomSessionDetailDto } from "@/types/dto/classRooms/classRoom.dto";
import { resolveJoinUrl } from "@/utils/class-room-session";

export { resolveJoinUrl };

type TeacherInfo = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export const extractTeachers = (
  session?: ClassRoomSessionDetailDto | null,
): TeacherInfo[] => {
  if (!session?.teacherAssignments?.length) {
    return [];
  }

  const uniqueTeachers = new Map<string, TeacherInfo>();

  session.teacherAssignments.forEach((assignment) => {
    const teacher = assignment.teacher;
    const teacherId =
      teacher?.id ?? assignment.teacher_id ?? assignment.id ?? "";

    if (!teacherId || uniqueTeachers.has(teacherId)) {
      return;
    }

    uniqueTeachers.set(teacherId, {
      id: teacherId,
      name: teacher?.profile?.full_name ?? "Giảng viên",
      avatarUrl: teacher?.profile?.avatar ?? null,
    });
  });

  return Array.from(uniqueTeachers.values());
};

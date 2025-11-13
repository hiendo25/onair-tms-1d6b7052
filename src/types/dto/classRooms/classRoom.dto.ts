import { Tables } from "@/types/supabase.types";

export type EmployeeWithProfileDto = Tables<"employees"> & {
  profile?: Tables<"profiles"> | null;
};

type ClassRoomAssigneeDto = Tables<"class_room_employee"> & {
  employee?: Pick<EmployeeWithProfileDto, "id" | "employee_type"> | null;
};

type ClassSessionTeacherAssignmentDto = Tables<"class_session_teacher"> & {
  teacher?: EmployeeWithProfileDto | null;
};

type ClassRoomSessionDto = Tables<"class_sessions"> & {
  runtimeStatus?: string;
  teacherAssignments?: ClassSessionTeacherAssignmentDto[];
};

export type ClassRoomPriorityDto = Tables<"class_rooms_priority"> & {
  class_sessions: ClassRoomSessionDto[];
  assignees?: ClassRoomAssigneeDto[];
  creator?: EmployeeWithProfileDto | null;
  studentCount?: [{ count: number }];
};

type EmploymentWithOrganizationUnitDto = Tables<"employments"> & {
  organizationUnit?: Pick<
    Tables<"organization_units">,
    "id" | "name" | "type"
  > | null;
};

type ClassRoomStudentEmployeeDto = Tables<"employees"> & {
  profile?: Pick<
    Tables<"profiles">,
    "id" | "full_name" | "email" | "phone_number" | "avatar"
  > | null;
  employments?: EmploymentWithOrganizationUnitDto[];
  attendances?: ClassRoomStudentSessionAttendanceDto[] | null;
};

export type ClassRoomStudentSessionAttendanceDto = Pick<
  Tables<"class_attendances">,
  | "id"
  | "employee_id"
  | "class_room_id"
  | "class_session_id"
  | "attendance_status"
  | "attended_at"
  | "attendance_method"
  | "attendance_mode"
>;

type ClassRoomStudentSessionDto = Pick<
  Tables<"class_sessions">,
  "id" | "is_online" | "title" | "start_at" | "end_at"
> & {
  class_attendances?: ClassRoomStudentSessionAttendanceDto[] | null;
};

export type ClassRoomStudentDto = Tables<"class_room_employee"> & {
  id: string;
  created_at: Date;
  employee?: ClassRoomStudentEmployeeDto | null;
  class_rooms_priority?: { runtime_status: string | null } | null;
  class_rooms?: { sessions: ClassRoomStudentSessionDto[] | null };
};

type ClassRoomSummaryDto = Pick<
  Tables<"class_rooms">,
  | "id"
  | "title"
  | "description"
  | "slug"
  | "thumbnail_url"
  | "start_at"
  | "end_at"
  | "room_type"
  | "status"
  | "organization_id"
  | "employee_id"
> & {
  assignees?: ClassRoomAssigneeDto[] | null;
};

export type ClassRoomSessionDetailDto = Tables<"class_sessions"> & {
  class_room?: ClassRoomSummaryDto | null;
  teacherAssignments?: ClassSessionTeacherAssignmentDto[];
};

export type ClassRoomStatusCountDto = {
  runtime_status: string | null;
  total: number;
};

import { ClassRoom } from "@/model/class-room.model";
import { ClassAttendance } from "@/model/qr-attendance.model";

export type CreateClassRoomPayload = Pick<
  ClassRoom,
  | "description"
  | "room_type"
  | "slug"
  | "start_at"
  | "end_at"
  | "status"
  | "thumbnail_url"
  | "title"
  | "organization_id"
  | "employee_id"
  | "class_type"
>;
export type UpdateClassRoomPayload = Pick<
  ClassRoom,
  | "id"
  | "title"
  | "slug"
  | "description"
  | "room_type"
  | "start_at"
  | "end_at"
  | "status"
  | "thumbnail_url"
  | "employee_id"
>;
export type UpSertClassRoomPayload =
  | {
      action: "create";
      payload: CreateClassRoomPayload;
    }
  | {
      action: "update";
      payload: UpdateClassRoomPayload;
    };

export type CreatePivotClassRoomAndHashTagPayload = {
  class_room_id: string;
  hash_tag_id: string;
};
export type CreatePivotClassRoomAndFieldPayload = {
  class_room_id: string;
  class_field_id: string;
};

export type CreatePivotClassRoomAndEmployeePayload = {
  class_room_id: string;
  employee_id: string;
};

export enum ClassRoomRuntimeStatusFilter {
  All = "all",
  Ongoing = "ongoing",
  Today = "today",
  Upcoming = "upcoming",
  Past = "past",
  Draft = "draft",
}

export enum ClassRoomTypeFilter {
  All = "all",
  Single = "single",
  Multiple = "multiple",
}

export enum ClassSessionModeFilter {
  All = "all",
  Online = "online",
  Offline = "offline",
  Live = "live",
}

export enum ClassRoomStatusFilter {
  All = "all",
  Daft = "draft",
  Publish = "publish",
  Active = "active",
  Pending = "pending",
  Deactive = "deactive",
  Deleted = "deleted",
}

export type AttendanceStatus = "attended" | "absent" | "pending";
export interface ClassRoomFilters {
  type: ClassRoomTypeFilter;
  sessionMode: ClassSessionModeFilter;
  search: string;
  startDate?: string | null;
  endDate?: string | null;
  runtimeStatus: ClassRoomRuntimeStatusFilter;
  status: ClassRoomStatusFilter;
}

export type DeletePivotClassRoomAndEmployeePayload = {
  class_room_id: string;
  employeeIds: string[];
};

export type CreatePivotClassRoomWithResourcePayload = {
  class_room_id: string;
  resource_id: string;
};

export type CreateClassRoomFlashcardPayload = {
  class_room_id: string;
  flashcard_id: string;
  order_index?: number;
};

export type DeleteClassRoomFlashcardPayload = {
  class_room_id: string;
  flashcard_ids?: string[];
};

export type EmployeeClassRoomAttendancePayload = Pick<
  ClassAttendance,
  | "qr_code_id"
  | "class_room_id"
  | "class_session_id"
  | "attended_at"
  | "attendance_method"
  | "attendance_status"
  | "device_info"
  | "scan_location_lat"
  | "scan_location_lng"
  | "distance_from_class"
  | "employee_id"
  | "attendance_mode"
  | "rejection_reason"
>;

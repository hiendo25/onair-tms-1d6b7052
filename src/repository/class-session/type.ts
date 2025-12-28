import { ClassSession } from "@/model/class-session.model";
import { ClassSessionsCoursesPeriod } from "@/model/class-session-course-period";

export type BulkCreateClassRoomSessionsPayload = {
  classRoomId: string;
  sessions: Pick<
    ClassSession,
    | "title"
    | "start_at"
    | "end_at"
    | "description"
    | "session_type"
    | "priority"
    | "channel_info"
    | "channel_provider"
    | "location"
    | "weekly_schedule"
  >[];
};

export type CreateClassRoomSessionPayload = Pick<
  ClassSession,
  | "title"
  | "start_at"
  | "end_at"
  | "description"
  | "session_type"
  | "priority"
  | "channel_info"
  | "channel_provider"
  | "location"
  | "class_room_id"
  | "weekly_schedule"
>;

export type UpdateClassRoomSessionPayload = Pick<
  ClassSession,
  | "id"
  | "title"
  | "start_at"
  | "end_at"
  | "description"
  | "session_type"
  | "priority"
  | "channel_info"
  | "channel_provider"
  | "location"
  | "weekly_schedule"
>;
export type UpSertClassRoomSessionPayload =
  | {
      action: "create";
      payload: CreateClassRoomSessionPayload;
    }
  | {
      action: "update";
      payload: UpdateClassRoomSessionPayload;
    };

export type CreatePivotClassRoomSessionAndTeacherPayload = {
  class_session_id: string;
  teacher_id: string;
};

export type CreatePivotClassSessionWithCoursePeriodPayload = Pick<
  ClassSessionsCoursesPeriod,
  "class_session_id" | "course_id" | "teacher_id" | "start_at" | "end_at" | "weekly_schedule"
>;
export type UpdatePivotClassSessionWithCoursePeriodPayload = Pick<
  ClassSessionsCoursesPeriod,
  "id" | "teacher_id" | "start_at" | "end_at" | "weekly_schedule"
>;

export type UpsertPivotClassSessionWithCoursePeriodPayload =
  | {
      action: "create";
      payload: CreatePivotClassSessionWithCoursePeriodPayload;
    }
  | {
      action: "update";
      payload: UpdatePivotClassSessionWithCoursePeriodPayload;
    };

export type CreatePivotClassSessionWithAssignmentPayload = {
  session_id: string;
  assignment_id: string;
  start_at: string | null;
  end_at: string | null;
};

import { ClassSession } from "@/model/class-session.model";

export type BulkCreateClassRoomSessionsPayload = {
  classRoomId: string;
  sessions: Pick<
    ClassSession,
    | "title"
    | "start_at"
    | "end_at"
    | "description"
    | "assignment_id"
    | "session_type"
    | "priority"
    | "channel_info"
    | "channel_provider"
    | "location"
  >[];
};

export type CreateClassRoomSessionPayload = Pick<
  ClassSession,
  | "title"
  | "start_at"
  | "end_at"
  | "description"
  | "assignment_id"
  | "session_type"
  | "priority"
  | "channel_info"
  | "channel_provider"
  | "location"
  | "class_room_id"
>;

export type UpdateClassRoomSessionPayload = Pick<
  ClassSession,
  | "id"
  | "title"
  | "start_at"
  | "end_at"
  | "description"
  | "assignment_id"
  | "session_type"
  | "priority"
  | "channel_info"
  | "channel_provider"
  | "location"
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

export type CreatePivotClassSessionWithCoursePeriodPayload = {
  class_session_id: string;
  course_id: string;
  teacher_id: string;
  start_at: string;
  end_at: string;
};

export type CreatePivotClassSessionWithAssignmentPayload = {
  session_id: string;
  assignment_id: string;
  start_at: string | null;
  end_at: string | null;
};

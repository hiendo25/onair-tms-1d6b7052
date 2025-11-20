import { supabase } from "@/services";
import {
  BulkCreateClassRoomSessionsPayload,
  CreateClassRoomSessionPayload,
  CreatePivotClassRoomSessionAndTeacherPayload,
  CreatePivotClassSessionWithCoursePeriodPayload,
  CreatePivotClassSessionWithAssignmentPayload,
  UpSertClassRoomSessionPayload,
} from "./type";
export * from "./type";

const bulkCreateClassSession = async (payload: BulkCreateClassRoomSessionsPayload) => {
  try {
    const sessionInsertPayload = payload.sessions.map((session) => ({
      ...session,
      class_room_id: payload.classRoomId,
    }));
    return await supabase.from("class_sessions").insert(sessionInsertPayload).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error craete Sessions");
  }
};

const createClassSession = async (payload: CreateClassRoomSessionPayload) => {
  try {
    return await supabase.from("class_sessions").insert(payload).select("*").single();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error craete Sessions");
  }
};

const deleteClassSession = async (ids: string[]) => {
  try {
    return await supabase.from("class_sessions").delete().in("id", ids);
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error Delete Sessions");
  }
};

const bulkUpsertClassSession = async (upsertPayload: UpSertClassRoomSessionPayload[]) => {
  try {
    return await supabase
      .from("class_sessions")
      .upsert(upsertPayload.map((pl) => pl.payload))
      .select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error Delete Sessions");
  }
};

const upsertClassSession = async (upsertPayload: UpSertClassRoomSessionPayload) => {
  try {
    return await supabase
      .from("class_sessions")
      .upsert(upsertPayload.payload)
      .select(
        `
          id,
          title,
          description,
          start_at,
          end_at,
          class_room_id,
          channel_provider,
          channel_info,
          session_type,
          courses_period:class_sessions_courses_period(
            id,
            course:courses(id, title, slug),
            start_at,
            end_at,
            teacher:employees(id,
              employee_type,
              employee_code,
              profile:profiles(
                id,
                full_name,
                email,
                employee_id,
                avatar
              )
            )
          ),
          session_assignment:class_session_assignment(
            id,
            assignments(
              id,
              name
            )
          ),
          teachers:class_session_teacher(
            id,
            employee:employees!class_session_teacher_teacher_id_fkey(
              id,
              employee_type,
              employee_code,
              profile:profiles(
                id,
                full_name,
                email,
                employee_id,
                avatar
              )
            )
          ),
          agendas:class_sessions_agendas(
            id,
            title,
            description,
            thumbnail_url,
            start_at,
            end_at,
            class_session_id
          ),
          metadata:class_session_metadata(
            id,
            class_session_id,
            key,
            value
          ),
          class_qr_codes(
            id,
            class_room_id, 
            class_session_id, 
            checkin_start_time, 
            checkin_end_time
          )
        `,
      )
      .single();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error Delete Sessions");
  }
};

const createPivotClassSessionAndTeacher = async (payload: CreatePivotClassRoomSessionAndTeacherPayload[]) => {
  try {
    return await supabase.from("class_session_teacher").insert(payload).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error create Pivot Session and Teacher");
  }
};

const deletePivotClassSessionAndTeacher = async (ids: string[]) => {
  try {
    return await supabase.from("class_session_teacher").delete().in("id", ids).select(`
        id,
        employee:employees(id, employee_code)
      `);
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error create Agendas");
  }
};
const bulkCreatePivotClassSessionWithCoursePeriod = async (
  payload: CreatePivotClassSessionWithCoursePeriodPayload[],
) => {
  try {
    return await supabase.from("class_sessions_courses_period").insert(payload).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error createPivotClassSessionWithCoursePeriod");
  }
};

const createPivotClassSessionWithAssignment = async (payload: CreatePivotClassSessionWithAssignmentPayload) => {
  try {
    return await supabase.from("class_session_assignment").insert(payload).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error createPivotClassSessionWithAssignment");
  }
};

export {
  bulkCreatePivotClassSessionWithCoursePeriod,
  createPivotClassSessionWithAssignment,
  createClassSession,
  createPivotClassSessionAndTeacher,
  deletePivotClassSessionAndTeacher,
  deleteClassSession,
  upsertClassSession,
  bulkUpsertClassSession,
  bulkCreateClassSession,
};

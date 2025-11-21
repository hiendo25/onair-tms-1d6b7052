import { supabase } from "@/services";
import {
  BulkCreateClassRoomSessionsPayload,
  CreateClassRoomSessionPayload,
  CreatePivotClassRoomSessionAndTeacherPayload,
  CreatePivotClassSessionWithCoursePeriodPayload,
  CreatePivotClassSessionWithAssignmentPayload,
  UpSertClassRoomSessionPayload,
  UpdatePivotClassSessionWithCoursePeriodPayload,
  UpsertPivotClassSessionWithCoursePeriodPayload,
} from "./type";
import { SELECT_SESSION_DETAIL } from "./query-select.constant";
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
    return await supabase.from("class_sessions").upsert(upsertPayload.payload).select(SELECT_SESSION_DETAIL).single();
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

const bulkDeletePivotClassSessionWithCoursePeriod = async (ids: number[]) => {
  try {
    return await supabase.from("class_sessions_courses_period").delete().in("id", ids).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error createPivotClassSessionWithCoursePeriod");
  }
};

const updatePivotClassSessionWithCoursePeriod = async (payload: UpdatePivotClassSessionWithCoursePeriodPayload) => {
  const { id, ...restPayload } = payload;
  try {
    return await supabase
      .from("class_sessions_courses_period")
      .update(restPayload)
      .eq("id", payload.id)
      .select()
      .single();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error createPivotClassSessionWithCoursePeriod");
  }
};

const upsertPivotClassSessionWithCoursePeriod = async (payload: UpsertPivotClassSessionWithCoursePeriodPayload) => {
  try {
    return await supabase.from("class_sessions_courses_period").upsert(payload.payload).select().single();
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

const deletePivotClassSessionWithAssignment = async (ids: number[]) => {
  try {
    return await supabase.from("class_session_assignment").delete().in("id", ids).select();
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
  deletePivotClassSessionWithAssignment,
  bulkDeletePivotClassSessionWithCoursePeriod,
  updatePivotClassSessionWithCoursePeriod,
  upsertPivotClassSessionWithCoursePeriod,
};

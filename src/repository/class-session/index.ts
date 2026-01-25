import { createSVClient, supabase } from "@/services";

import { SELECT_SESSION_DETAIL } from "./query-select.constant";
import {
  BulkCreateClassRoomSessionsPayload,
  CreateClassRoomSessionPayload,
  CreatePivotClassRoomSessionAndTeacherPayload,
  CreatePivotClassSessionWithAssignmentPayload,
  CreatePivotClassSessionWithCoursePeriodPayload,
  UpdatePivotClassSessionWithCoursePeriodPayload,
  UpSertClassRoomSessionPayload,
  UpsertPivotClassSessionWithCoursePeriodPayload,
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

const deleteClassSessionTeachersByEmployeeId = async (employeeId: string) => {
  try {
    const { error } = await supabase.from("class_session_teacher").delete().eq("teacher_id", employeeId);

    if (error) throw error;
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error deleting class session teachers");
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

const bulkCreatePivotClassSessionWithAssignment = async (payload: CreatePivotClassSessionWithAssignmentPayload[]) => {
  try {
    return await supabase.from("class_session_assignment").insert(payload).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error createPivotClassSessionWithAssignment");
  }
};

const bulkDeletePivotClassSessionWithAssignment = async (ids: number[]) => {
  try {
    return await supabase.from("class_session_assignment").delete().in("id", ids).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error createPivotClassSessionWithAssignment");
  }
};

/**
 * Get class rooms that contain a specific course and where the employee is assigned
 */
const getClassRoomsWithCourseAndEmployee = async (courseId: string, employeeId: string) => {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("class_sessions_courses_period")
    .select(
      `
      course_id,
      class_session_id,
      class_sessions!inner(
        class_room_id,
        class_rooms!inner(
          id,
          title,
          class_room_employee!inner(employee_id),
          class_room_certificate_templates(
            id,
            certificate_template_id,
            certificate_templates(id, name)
          )
        )
      )
    `
    )
    .eq("course_id", courseId)
    .eq("class_sessions.class_rooms.class_room_employee.employee_id", employeeId);

  if (error) {
    console.error("[ClassSession] Error fetching class rooms:", error);
    throw new Error(`Failed to fetch class rooms: ${error.message}`);
  }

  return data || [];
};

/**
 * Get all courses in a specific class room
 */
const getCoursesByClassRoomId = async (classRoomId: string) => {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("class_sessions_courses_period")
    .select(
      `
      course_id,
      class_session_id,
      class_sessions!inner(class_room_id)
    `
    )
    .eq("class_sessions.class_room_id", classRoomId);

  if (error) {
    console.error("[ClassSession] Error fetching courses by class room:", error);
    throw new Error(`Failed to fetch courses by class room: ${error.message}`);
  }

  return data || [];
};

/**
 * Get class room sessions by class room ID with certificate template info
 */
const getClassRoomSessionsByClassRoomId = async (classRoomId: string) => {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("class_sessions")
    .select(
      `
      id,
      class_room_id,
      class_rooms!inner(
        id,
        title,
        class_room_certificate_templates(
          id,
          days_to_expire,
          certificate_template_id,
          certificate_templates(id, name)
        )
      )
    `
    )
    .eq("class_room_id", classRoomId);

  if (error) {
    console.error("[ClassSession] Error fetching class room sessions:", error);
    throw new Error(`Failed to fetch class room sessions: ${error.message}`);
  }

  return data || [];
};

export type ClassRoomWithCertificate = {
  classRoomId: string;
  classRoomTitle: string;
  certificateTemplateId: string;
  daysToExpire?: number | null;
};

/**
 * Extract unique class rooms from query results
 * Works with both getClassRoomsWithCourseAndEmployee and getClassRoomSessionsByClassRoomId results
 */
const extractClassRoomsFromSessions = (
  classRoomSessions: Awaited<ReturnType<typeof getClassRoomsWithCourseAndEmployee>> | Awaited<ReturnType<typeof getClassRoomSessionsByClassRoomId>>
): ClassRoomWithCertificate[] => {
  const classRoomMap = new Map<string, ClassRoomWithCertificate>();

  classRoomSessions.forEach((session: any) => {
    // Handle both data structures
    const classRoom = session.class_sessions?.class_rooms || session.class_rooms;
    const certificate = classRoom?.class_room_certificate_templates?.[0];

    if (classRoom?.id && certificate?.certificate_template_id) {
      classRoomMap.set(classRoom.id, {
        classRoomId: classRoom.id,
        classRoomTitle: classRoom.title,
        certificateTemplateId: certificate.certificate_template_id,
        daysToExpire: certificate.days_to_expire,
      });
    }
  });

  return Array.from(classRoomMap.values());
};

export {
  bulkCreatePivotClassSessionWithCoursePeriod,
  createPivotClassSessionWithAssignment,
  createClassSession,
  createPivotClassSessionAndTeacher,
  deletePivotClassSessionAndTeacher,
  deleteClassSessionTeachersByEmployeeId,
  deleteClassSession,
  upsertClassSession,
  bulkUpsertClassSession,
  bulkCreateClassSession,
  bulkDeletePivotClassSessionWithAssignment,
  bulkDeletePivotClassSessionWithCoursePeriod,
  updatePivotClassSessionWithCoursePeriod,
  upsertPivotClassSessionWithCoursePeriod,
  bulkCreatePivotClassSessionWithAssignment,
  getClassRoomsWithCourseAndEmployee,
  getCoursesByClassRoomId,
  getClassRoomSessionsByClassRoomId,
  extractClassRoomsFromSessions,
};

import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { SupabaseClient } from "@supabase/supabase-js";

import { ClassRoomMetaKey, ClassRoomMetaValue } from "@/constants/class-room-meta.constant";
import { DayOfWeek } from "@/model/enum-type.model";
import { MarkAttendancePayload } from "@/modules/class-room-management/operations/mutation";
import {
  GetClassRoomsQueryInput,
  GetClassRoomStatusCountsInput,
  GetClassRoomStudentsQueryInput,
} from "@/modules/class-room-management/operations/query";
import { createClient, supabase } from "@/services";
import {
  ClassRoomPriorityDto,
  ClassRoomSessionDetailDto,
  ClassRoomStatusCountDto,
  ClassRoomStudentDto,
  ClassRoomStudentSessionAttendanceDto,
} from "@/types/dto/classRooms/classRoom.dto";
import { PaginatedResult } from "@/types/dto/pagination.dto";
import { Database } from "@/types/supabase.types";

import {
  CLASS_ROOM_STUDENTS_SELECT,
  CLASS_ROOMS_SELECT,
  CLASS_SESSION_WITH_CLASS_ROOM_SELECT,
  LIMIT,
  PAGE,
} from "./constants";
import { SELECT_CLASSROOM_DETAIL, SELECT_CLASSROOM_DETAIL_BY_SLUG } from "./query-select";
import {
  ClassRoomRuntimeStatusFilter,
  ClassRoomStatusFilter,
  ClassRoomTypeFilter,
  ClassSessionModeFilter,
  CreateClassRoomPayload,
  CreatePivotClassRoomAndEmployeePayload,
  CreatePivotClassRoomAndFieldPayload,
  CreatePivotClassRoomAndHashTagPayload,
  CreatePivotClassRoomWithResourcePayload,
  DeletePivotClassRoomAndEmployeePayload,
  EmployeeClassRoomAttendancePayload,
  UpdateClassRoomPayload,
  UpSertClassRoomPayload,
} from "./type";
export * from "./type";

const getClassRoomById = async (classRoomId: string) => {
  try {
    const { data, error } = await supabase
      .from("class_rooms")
      .select(SELECT_CLASSROOM_DETAIL)
      .eq("id", classRoomId)
      .order("priority", { ascending: true, referencedTable: "class_sessions" })
      .single()
      .overrideTypes<{
        class_room_metadata: {
          class_room_id: string;
          id: string;
          key: ClassRoomMetaKey;
          value: ClassRoomMetaValue;
        }[];
        sessions: {
          channel_info: {
            providerId: string;
            url: string;
            password: string;
          };
          weekly_schedule: {
            from: DayOfWeek;
            time: string;
          } | null;
          courses_period: {
            weekly_schedule: {
              from: {
                day: DayOfWeek;
                time: string;
              };
              to: {
                day: DayOfWeek;
                time: string;
              };
              isDuration: boolean;
              duration: {
                hours: number;
                minutes: number;
              };
            } | null;
          }[];
        }[];
      }>();
    return { data, error };
  } catch (err: any) {
    throw new Error(err?.message ?? "Fetching ClassRoom Detail failed not found");
  }
};
export type GetClassRoomByIdResponse = Awaited<ReturnType<typeof getClassRoomById>>;

const getClassRoomBySlug = async (slug: string) => {
  try {
    const { data, error } = await supabase
      .from("class_rooms")
      .select(SELECT_CLASSROOM_DETAIL_BY_SLUG)
      .eq("slug", slug)
      .single();

    return { data, error };
  } catch (err: any) {
    throw new Error(err?.message ?? "Fetching ClassRoom Detail failed not found");
  }
};
export type GetClassRoomBySlugResponse = Awaited<ReturnType<typeof getClassRoomBySlug>>;

const createClassRoom = async (payload: CreateClassRoomPayload) => {
  try {
    return await supabase.from("class_rooms").insert(payload).select().single();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error craete Class Room");
  }
};

const updateClassRoom = async (payload: UpdateClassRoomPayload) => {
  try {
    const { id, ...restPayload } = payload;
    return await supabase.from("class_rooms").update(restPayload).eq("id", id).select().single();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error update Class Room");
  }
};

const upsertClassRoom = async (upsertPayload: UpSertClassRoomPayload) => {
  try {
    return await supabase.from("class_rooms").upsert(upsertPayload.payload).select().single();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error craete Class Room");
  }
};

const createPivotClassRoomAndHashTag = async (payload: CreatePivotClassRoomAndHashTagPayload[]) => {
  try {
    return await supabase.from("class_hash_tag").insert(payload).select("*");
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error craete hash tag");
  }
};

const deletePivotClassRoomAndHashTag = async (ids: string[]) => {
  try {
    return await supabase.from("class_hash_tag").delete().in("id", ids);
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error craete hash tag");
  }
};

const createPivotClassRoomAndField = async (payload: CreatePivotClassRoomAndFieldPayload[]) => {
  try {
    return await supabase.from("class_room_field").insert(payload).select("*");
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error craete Class Room");
  }
};

const deletePivotClassRoomAndField = async (ids: string[]) => {
  try {
    return await supabase.from("class_room_field").delete().in("id", ids);
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error craete Class Room");
  }
};

const createPivotClassRoomAndEmployee = async (payload: CreatePivotClassRoomAndEmployeePayload[]) => {
  try {
    return await supabase.from("class_room_employee").insert(payload).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error create Class Room and Employee");
  }
};

const deletePivotClassRoomAndEmployee = async (ids: number[]) => {
  try {
    return await supabase.from("class_room_employee").delete().in("id", ids);
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error Delete ClassRoom Employee ID");
  }
};

const deletePivotClassRoomAndEmployeeByEmployeeId = async (payload: DeletePivotClassRoomAndEmployeePayload) => {
  const { error } = await supabase
    .from("class_room_employee")
    .delete()
    .eq("class_room_id", payload.class_room_id)
    .in("employee_id", payload.employeeIds)
    .select();

  if (error) {
    throw new Error(`Failed to delete user in classRoom: ${error.message}`);
  }
};

const deleteAllClassRoomEmployeesByEmployeeId = async (employeeId: string) => {
  const { error } = await supabase.from("class_room_employee").delete().eq("employee_id", employeeId);

  if (error) {
    throw new Error(`Failed to delete class room employees by employee: ${error.message}`);
  }
};

const deleteClassRoomsByEmployeeId = async (employeeId: string) => {
  const { error } = await supabase.from("class_rooms").update({ status: "deleted" }).eq("employee_id", employeeId);

  if (error) {
    throw new Error(`Failed to delete class rooms by employee: ${error.message}`);
  }
};

const sanitizeSearchTerm = (value: string) => value.replace(/%/g, "\\%").replace(/_/g, "\\_").replace(/,/g, " ");

const applyClassRoomFilters = <T extends PostgrestFilterBuilder<any, any, any, any>>(
  query: T,
  filters: GetClassRoomsQueryInput = {},
): T => {
  const { status, runtimeStatus, from, to, q, type, sessionMode } = filters;
  let builder = query;

  if (status && status !== ClassRoomStatusFilter.All) {
    builder = builder.eq("status", status);
  }

  if (type && type !== ClassRoomTypeFilter.All) {
    builder = builder.eq("room_type", type);
  }

  if (runtimeStatus && runtimeStatus !== ClassRoomRuntimeStatusFilter.All) {
    builder = builder.eq("runtime_status", runtimeStatus);
  }

  if (sessionMode && sessionMode !== ClassSessionModeFilter.All) {
    builder = builder.eq("class_sessions.session_type", sessionMode);
  }

  if (from) {
    builder = builder.gte("computed_end_at", from);
  }

  if (to) {
    builder = builder.lte("computed_start_at", to);
  }

  if (q) {
    const trimmed = q.trim();
    if (trimmed) {
      const escaped = sanitizeSearchTerm(trimmed);
      builder = builder.or([`title.ilike.%${escaped}%`, `description.ilike.%${escaped}%`].join(","));
    }
  }

  return builder;
};

const createClassRoomsQuery = (
  filters: {
    organizationId?: string | null;
    employeeId?: string | null;
    teacherClassRoomIds?: string[];
  },
  select: string,
  options?: { count?: "exact" | "planned" | "estimated"; head?: boolean },
) => {
  const { organizationId, employeeId, teacherClassRoomIds } = filters;
  const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const sanitizedTeacherClassRoomIds = Array.from(
    new Set(
      (teacherClassRoomIds ?? [])
        .map((id) => id?.trim())
        .filter((id): id is string => Boolean(id) && uuidPattern.test(id)),
    ),
  );

  let query = supabase.from("class_rooms_priority").select(select, options).not("status", "in", "(deleted)");

  if (organizationId) {
    query = query.eq("organization_id", organizationId!);
  }

  const orConditions: string[] = [];

  if (employeeId) {
    orConditions.push(`employee_id.eq.${employeeId}`);
  }

  if (sanitizedTeacherClassRoomIds.length > 0) {
    orConditions.push(`id.in.(${sanitizedTeacherClassRoomIds.join(",")})`);
  }

  if (orConditions.length > 0) {
    query = query.or(orConditions.join(","));
  }

  return query;
};

const getClassRooms = async (input: GetClassRoomsQueryInput = {}): Promise<PaginatedResult<ClassRoomPriorityDto>> => {
  const {
    page = PAGE,
    limit = LIMIT,
    runtimeStatus: statusFilter,
    status,
    q,
    from,
    to,
    organizationId,
    employeeId,
    orderBy,
    orderField,
    type,
    sessionMode,
  } = input;

  const trimmedEmployeeId = employeeId?.trim();

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 12;
  const rangeStart = (safePage - 1) * safeLimit;
  const rangeEnd = rangeStart + safeLimit - 1;

  if (!organizationId && !trimmedEmployeeId) {
    return {
      data: [],
      total: 0,
      page: safePage,
      limit: safeLimit,
    };
  }

  let teacherClassRoomIds: string[] | undefined;

  if (trimmedEmployeeId) {
    const { data: teacherAssignments, error: teacherError } = await supabase
      .from("class_session_teacher")
      .select(
        `
          class_sessions!inner (
            class_room_id
          )
        `,
      )
      .eq("teacher_id", trimmedEmployeeId);

    if (teacherError) {
      throw teacherError;
    }

    teacherClassRoomIds = Array.from(
      new Set(
        (teacherAssignments ?? [])
          .map((assignment) => assignment?.class_sessions?.class_room_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );
  }

  let query = createClassRoomsQuery(
    { organizationId, employeeId: trimmedEmployeeId, teacherClassRoomIds },
    CLASS_ROOMS_SELECT,
    { count: "exact" },
  );

  query = applyClassRoomFilters(query, {
    runtimeStatus: statusFilter,
    q,
    from,
    to,
    status,
    type,
    sessionMode,
  });

  if (orderField && orderBy) {
    query = query.order(orderField, { ascending: orderBy === "asc" });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.order("sort_rank_primary").order("sort_rank_secondary").range(rangeStart, rangeEnd);

  const { data, error, count } = await query;
  const fnData = data as unknown as ClassRoomPriorityDto[];

  if (error) {
    throw error;
  }

  return {
    data: fnData,
    total: count ?? 0,
    page: safePage,
    limit: safeLimit,
  };
};

const normalizeStudentSessionAttendances = (student: ClassRoomStudentDto, classRoomId: string): ClassRoomStudentDto => {
  const sessions = student.class_rooms?.sessions;

  if (!sessions?.length) {
    return student;
  }

  const attendancesForClassRoom = (student.employee?.attendances ?? []).filter(
    (attendance) => attendance.class_room_id === classRoomId,
  );

  const attendanceBySessionId = attendancesForClassRoom.reduce<Record<string, ClassRoomStudentSessionAttendanceDto[]>>(
    (acc, attendance) => {
      if (!attendance.class_session_id) {
        return acc;
      }

      if (!acc[attendance.class_session_id]) {
        acc[attendance.class_session_id] = [];
      }

      acc[attendance?.class_session_id]?.push(attendance);

      return acc;
    },
    {},
  );

  const normalizedSessions = sessions.map((session) => ({
    ...session,
    class_attendances: session.id ? attendanceBySessionId[session.id] ?? [] : [],
  }));

  return {
    ...student,
    class_rooms: student.class_rooms ? { ...student.class_rooms, sessions: normalizedSessions } : student.class_rooms,
  };
};

const getClassRoomStudents = async (
  input: GetClassRoomStudentsQueryInput,
  client?: SupabaseClient<Database>,
): Promise<PaginatedResult<ClassRoomStudentDto>> => {
  const { classRoomId, page = 1, limit = 20, search, branchId, departmentId } = input;

  const supabaseClient = client ?? supabase;

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20;
  const rangeStart = (safePage - 1) * safeLimit;
  const rangeEnd = rangeStart + safeLimit - 1;

  if (!classRoomId) {
    return {
      data: [],
      total: 0,
      page: safePage,
      limit: safeLimit,
    };
  }

  let query = supabaseClient
    .from("class_room_employee")
    .select(CLASS_ROOM_STUDENTS_SELECT, { count: "exact" })
    .eq("class_room_id", classRoomId)
    .eq("employee.employee_type", "student")
    .eq("employee.attendances.class_room_id", classRoomId);

  if (search?.trim()) {
    const sanitized = sanitizeSearchTerm(search.trim());
    query = query.or(
      [`full_name.ilike.%${sanitized}%`, `email.ilike.%${sanitized}%`, `phone_number.ilike.%${sanitized}%`].join(","),
      { foreignTable: "employee.profile" },
    );
  }

  if (branchId && branchId !== "all") {
    query = query.eq("employee.employee_branches.branch_id", branchId);
  }

  if (departmentId && departmentId !== "all") {
    query = query.eq("employee.employee_departments.department_id", departmentId);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error, count } = await query.range(rangeStart, rangeEnd);

  if (error) {
    throw error;
  }

  const students = (data ?? []) as unknown as ClassRoomStudentDto[];
  const normalizedStudents = students.map((student) => normalizeStudentSessionAttendances(student, classRoomId));

  return {
    data: normalizedStudents,
    total: count ?? 0,
    page: safePage,
    limit: safeLimit,
  };
};

const getClassRoomStatusCounts = async (input: GetClassRoomStatusCountsInput): Promise<ClassRoomStatusCountDto[]> => {
  const trimmedEmployeeId = input.employeeId?.trim();

  if (!trimmedEmployeeId) {
    return [];
  }

  const normalizeString = (value?: string | null) => {
    if (typeof value !== "string") {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const searchValue = normalizeString(input.q);
  const sanitizedSearch = searchValue ? sanitizeSearchTerm(searchValue) : undefined;

  const fromValue = normalizeString(input.from);
  const toValue = normalizeString(input.to);

  const statusFilter = input.status && input.status !== ClassRoomStatusFilter.All ? input.status : undefined;

  const typeFilter = input.type && input.type !== ClassRoomTypeFilter.All ? input.type : undefined;

  const sessionModeFilter =
    input.sessionMode && input.sessionMode !== ClassSessionModeFilter.All ? input.sessionMode : undefined;

  const { data, error } = await supabase.rpc("count_class_room_runtime_status_by_employee", {
    p_employee_id: trimmedEmployeeId,
    p_search: sanitizedSearch,
    p_from: fromValue,
    p_to: toValue,
    p_status: statusFilter,
    p_type: typeFilter,
    p_session_mode: sessionModeFilter,
  });

  if (error) {
    throw error;
  }

  type RawStatusCountRow = {
    runtime_status: string | null;
    total: number | string | null;
  };

  const rawRows = (data ?? []) as RawStatusCountRow[];

  const parsedCounts: ClassRoomStatusCountDto[] = rawRows.map((row) => ({
    runtime_status: row.runtime_status,
    total: Number(row.total ?? 0),
  }));

  return parsedCounts;
};

const deleteClassRoomById = async (classRoomId: string) => {
  const { error } = await supabase.from("class_rooms").update({ status: "deleted" }).eq("id", classRoomId);

  if (error) {
    throw new Error(`Failed to delete classRoom: ${error.message}`);
  }
};

const getClassRoomSessionDetail = async (input: { sessionId: string }): Promise<ClassRoomSessionDetailDto | null> => {
  const { sessionId } = input;
  if (!sessionId) {
    throw new Error("Session ID is required to fetch class session");
  }

  const query = supabase
    .from("class_sessions")
    .select(CLASS_SESSION_WITH_CLASS_ROOM_SELECT)
    .eq("id", sessionId)
    .limit(1);

  const { data, error } = await query.maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return (data ?? null) as ClassRoomSessionDetailDto | null;
};

type GetClassRoomsByEmployeeIdInput = Omit<GetClassRoomsQueryInput, "organizationId" | "employeeId"> & {
  employeeId: string;
};

const getClassRoomsByEmployeeId = async (
  input: GetClassRoomsByEmployeeIdInput,
): Promise<PaginatedResult<ClassRoomPriorityDto>> => {
  const {
    employeeId,
    page = PAGE,
    limit = LIMIT,
    runtimeStatus,
    status,
    q,
    from,
    to,
    type,
    sessionMode,
    orderField,
    orderBy,
  } = input;

  const trimmedId = employeeId?.trim();
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : PAGE;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : LIMIT;
  const rangeStart = (safePage - 1) * safeLimit;
  const rangeEnd = rangeStart + safeLimit - 1;

  if (!trimmedId) {
    return {
      data: [],
      total: 0,
      page: safePage,
      limit: safeLimit,
    };
  }

  let query = supabase
    .from("class_rooms_priority")
    .select(
      `
        ${CLASS_ROOMS_SELECT},
        assigneePivot:class_room_employee!inner (
          employee_id
        )
      `,
      { count: "exact" },
    )
    .eq("assigneePivot.employee_id", trimmedId)
    .not("status", "in", "(deleted)");

  query = applyClassRoomFilters(query, {
    runtimeStatus,
    status,
    q,
    from,
    to,
    type,
    sessionMode,
  });

  if (orderField && orderBy) {
    query = query.order(orderField, { ascending: orderBy === "asc" });
  } else {
    query = query
      .order("sort_rank_primary", { ascending: true })
      .order("sort_rank_secondary", { ascending: true })
      .order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(rangeStart, rangeEnd);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as (ClassRoomPriorityDto & {
    assigneePivot?: { employee_id: string }[] | null;
  })[];

  const parsedData = rows.map(({ assigneePivot, ...classRoom }) => classRoom as ClassRoomPriorityDto);

  return {
    data: parsedData,
    total: count ?? 0,
    page: safePage,
    limit: safeLimit,
  };
};

const markAttendance = async (payload: MarkAttendancePayload) => {
  try {
    const { data: existingAttendance, error: existingAttendanceError } = await supabase
      .from("class_attendances")
      .select("id")
      .eq("class_session_id", payload.classSessionId)
      .eq("employee_id", payload.employeeId);

    if (existingAttendanceError) {
      throw existingAttendanceError;
    }

    if ((existingAttendance?.length ?? 0) > 0) {
      throw new Error("Học viên đã được điểm danh trong buổi học này.");
    }

    const { data, error } = await supabase
      .from("class_attendances")
      .insert({
        class_session_id: payload.classSessionId,
        class_room_id: payload.classRoomId,
        employee_id: payload.employeeId,
        attendance_method: payload.attendance_method,
        attendance_mode: payload.attendance_mode,
        attended_at: new Date().toISOString(),
        attendance_status: "present",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw new Error("Unable to markAttendance");
  }
};

const createPivotClassRoomsWithResources = async (payload: CreatePivotClassRoomWithResourcePayload[]) => {
  try {
    return await supabase.from("class_rooms_resources").insert(payload).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error create pivot Class Room and Resources");
  }
};

const deletePivotClassRoomsWithResources = async (ids: number[]) => {
  try {
    return await supabase.from("class_rooms_resources").delete().in("id", ids);
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error Delete Class rooom Resource");
  }
};

const isEmployeeAssignedToClassRoom = async (employeeId: string, classRoomId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("class_room_employee")
    .select()
    .eq("employee_id", employeeId)
    .eq("class_room_id", classRoomId)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
};

const getEmployeeAttendance = async (qrCodeId: string, employeeId: string) => {
  const supabase = createClient();
  return await supabase
    .from("class_attendances")
    .select("*")
    .eq("qr_code_id", qrCodeId)
    .eq("employee_id", employeeId)
    .maybeSingle();
};

const createEmployeeAttendance = async (payload: EmployeeClassRoomAttendancePayload) => {
  const supabase = createClient();
  return await supabase
    .from("class_attendances")
    .insert(payload)
    .select(
      `
				id, 
				qr_code_id, 
				class_room_id, 
				employee_id, 
				class_session_id, 
				attendance_status, 
				attended_at, 
				scan_location_lat,
				scan_location_lng,
				distance_from_class,
				attendance_method,
				attendance_mode,
				employees(
					id,
					employee_code,
					profiles(full_name)
				)
			`,
    )
    .maybeSingle();
};

export {
  createClassRoom,
  updateClassRoom,
  createPivotClassRoomAndHashTag,
  createPivotClassRoomAndField,
  createPivotClassRoomsWithResources,
  deletePivotClassRoomAndField,
  createPivotClassRoomAndEmployee,
  upsertClassRoom,
  deletePivotClassRoomAndHashTag,
  getClassRoomById,
  getClassRoomBySlug,
  deletePivotClassRoomAndEmployee,
  getClassRoomsByEmployeeId,
  getClassRoomSessionDetail,
  deleteClassRoomById,
  getClassRoomStatusCounts,
  getClassRoomStudents,
  getClassRooms,
  deletePivotClassRoomAndEmployeeByEmployeeId,
  deleteAllClassRoomEmployeesByEmployeeId,
  deleteClassRoomsByEmployeeId,
  deletePivotClassRoomsWithResources,
  markAttendance,
  isEmployeeAssignedToClassRoom,
  getEmployeeAttendance,
  createEmployeeAttendance,
};

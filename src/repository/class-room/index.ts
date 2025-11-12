import { supabase } from "@/services";
import {
  CreateClassRoomPayload,
  CreatePivotClassRoomAndHashTagPayload,
  CreatePivotClassRoomAndFieldPayload,
  CreatePivotClassRoomAndEmployeePayload,
  UpSertClassRoomPayload,
} from "./type";
import { ClassRoomMetaKey, ClassRoomMetaValue } from "@/constants/class-room-meta.constant";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import {
  GetClassRoomsQueryInput,
  GetClassRoomStatusCountsInput,
  GetClassRoomStudentsQueryInput,
} from "@/modules/class-room-management/operations/query";
import { PaginatedResult } from "@/types/dto/pagination.dto";
import {
  ClassRoomPriorityDto,
  ClassRoomSessionDetailDto,
  ClassRoomStatusCountDto,
  ClassRoomStudentDto,
  ClassRoomStudentSessionAttendanceDto,
} from "@/types/dto/classRooms/classRoom.dto";
import {
  CLASS_ROOM_STUDENTS_SELECT,
  CLASS_ROOMS_SELECT,
  CLASS_SESSION_WITH_CLASS_ROOM_SELECT,
  LIMIT,
  PAGE,
} from "./constants";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase.types";
import {
  ClassRoomRuntimeStatusFilter,
  ClassRoomStatusFilter,
  ClassRoomTypeFilter,
  ClassSessionModeFilter,
} from "@/app/(organization)/admin/class-room/list/types/types";
import { MarkAttendancePayload } from "@/modules/class-room-management/operations/mutation";
export * from "./type";

const getClassRoomById = async (classRoomId: string) => {
  try {
    const { data, error } = await supabase
      .from("class_rooms")
      .select(
        `
          id, 
          title,
          slug,
          description,
          room_type,
          comunity_info,
          thumbnail_url,
          documents,
          start_at,
          end_at,
          status,
          employee_id,
          class_room_metadata(id, key, value, class_room_id),
          class_hash_tag(
            id,
            hash_tags(
              id, name, slug, type
            )
          ),
          class_room_field(
            id,
            categories(
              id, name, slug
            )
          ),
          employees:class_room_employee(
            id,
            employee:employees(
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
          owner:employees(
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
          ),
          organizations(
            id, 
            name
          ),
          sessions:class_sessions(
            id,
            title,
            description,
            start_at,
            end_at,
            class_room_id,
            location,
            is_online,
            channel_provider,
            channel_info,
            limit_person,
            priority,
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
          )
        `,
      )
      .eq("id", classRoomId)
      .order("priority", { ascending: true, foreignTable: "class_sessions" })
      .single()
      .overrideTypes<{
        class_room_metadata: {
          class_room_id: string;
          id: string;
          key: ClassRoomMetaKey;
          value: ClassRoomMetaValue;
        }[];
        comunity_info: { name: string; url: string };
        sessions: {
          channel_info: {
            providerId: string;
            url: string;
            password: string;
          };
        }[];
        documents: {
          fileExtension: string;
          size: number;
          type: string;
          url: string;
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
      .select(
        `
          id, 
          title,
          slug,
          description,
          room_type,
          comunity_info,
          thumbnail_url,
          documents,
          start_at,
          end_at,
          status,
          employee_id,
          employees:class_room_employee(
            employee:employees(
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
          owner:employees(
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
          ),
          organizations(
            id, 
            name
          ),
          sessions:class_sessions(
            id,
            title,
            description,
            start_at,
            end_at,
            class_room_id,
            location,
            is_online,
            channel_provider,
            channel_info,
            limit_person,
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
            class_qr_codes(
              id,
              class_room_id, 
              class_session_id, 
              checkin_start_time, 
              checkin_end_time
            )
          )
        `,
      )
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
    throw new Error(err.message ?? "Unknown error create Class Room and Employee");
  }
};

type DeletePivotClassRoomAndEmployeePayload = {
  class_room_id: string;
  employeeIds: string[];
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
    const isOnline = sessionMode === ClassSessionModeFilter.Online;
    builder = builder.eq("class_sessions.is_online", isOnline);
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
    query = query.eq("employee.branchEmployments.organization_unit_id", branchId);
  }

  if (departmentId && departmentId !== "all") {
    query = query.eq("employee.departmentEmployments.organization_unit_id", departmentId);
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
    throw error;
  }
};

export {
  createClassRoom,
  createPivotClassRoomAndHashTag,
  createPivotClassRoomAndField,
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
  markAttendance,
};

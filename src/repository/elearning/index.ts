import {
  GetElearningsQueryInput,
  GetElearningStudentsQueryInput,
  GetMyElearningCoursesInput,
} from "@/modules/elearning/operations/query";
import { supabase } from "@/services";
import {
  ElearningAssignedCourseDto,
  ElearningCourseDto,
  ElearningCourseStudentDto,
} from "@/types/dto/elearning/elearning.dto";
import { PaginatedResult } from "@/types/dto/pagination.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const ALLOWED_ORDER_FIELDS = new Set(["created_at", "title", "start_at", "end_at"]);

const COURSES_SELECT = `
  *,
  studentCount:courses_students(count),
  categories:courses_categories (
    category:categories (
      id,
      name,
      slug
    )
  ),
  teacherAssignments:courses_teachers (
    id,
    teacher:employees (
      id,
      employee_type,
      profile:profiles (
        id,
        full_name,
        email,
        phone_number,
        avatar
      )
    )
  )
`;

const ELEARNING_COURSE_STUDENTS_SELECT = `
  id,
  course_id,
  student_id,
  student:employees!inner (
    id,
    employee_code,
    employee_type,
    status,
    profile:profiles!inner (
      id,
      full_name,
      email,
      phone_number,
      avatar
    ),
    employments (
      id,
      organization_unit_id,
      organizationUnit:organization_units!employments_organization_unit_id_fkey (
        id,
        name,
        type
      )
    ),
    branchEmployments:employments!inner (organization_unit_id),
    departmentEmployments:employments!inner (organization_unit_id)
  )
`;

const MY_ELEARNING_ASSIGNMENTS_SELECT = `
  id,
  course_id,
  student_id,
  created_at,
  course:courses (
    ${COURSES_SELECT}
  )
`;

const sanitizeSearchTerm = (value: string) =>
  value.replace(/%/g, "\\%").replace(/_/g, "\\_").replace(/,/g, " ");

const getElearnings = async (
  input: GetElearningsQueryInput = {},
): Promise<PaginatedResult<ElearningCourseDto>> => {
  const {
    q,
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    orderField,
    orderBy = "desc",
    employeeId,
    organizationId,
  } = input;

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : DEFAULT_PAGE;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_LIMIT;
  const rangeStart = (safePage - 1) * safeLimit;
  const rangeEnd = rangeStart + safeLimit - 1;

  if (!organizationId && !employeeId) {
    return {
      data: [],
      total: 0,
      page: safePage,
      limit: safeLimit,
    };
  }

  const teacherCourseIds: string[] = [];

  if (employeeId) {
    const { data: teacherAssignments, error: teacherError } = await supabase
      .from("courses_teachers")
      .select("online_course_id")
      .eq("teacher_id", employeeId);

    if (teacherError) {
      throw teacherError;
    }

    for (const assignment of teacherAssignments ?? []) {
      const courseId = assignment?.online_course_id;
      if (courseId && !teacherCourseIds.includes(courseId)) {
        teacherCourseIds.push(courseId);
      }
    }
  }

  let query = supabase
    .from("courses")
    .select(COURSES_SELECT, { count: "exact" })
    .not("status", "in", "(deleted)");

  if (organizationId) {
    query = query.eq("organization_id", organizationId!);
  }

  const accessConditions: string[] = [];

  if (employeeId) {
    accessConditions.push(`created_by.eq.${employeeId}`);
    if (teacherCourseIds.length > 0) {
      accessConditions.push(`id.in.(${teacherCourseIds.join(",")})`);
    }
  }

  const trimmedSearch = q?.trim();
  const sanitizedSearch = trimmedSearch ? sanitizeSearchTerm(trimmedSearch) : null;
  const searchClause = sanitizedSearch
    ? `or(title.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%)`
    : null;

  if (accessConditions.length > 0 && searchClause) {
    const combined = accessConditions.map(
      (condition) => `and(${condition},${searchClause})`,
    );
    query = query.or(combined.join(","));
  } else if (accessConditions.length > 0) {
    query = query.or(accessConditions.join(","));
  } else if (searchClause) {
    query = query.or(searchClause);
  }

  const sortField =
    orderField && ALLOWED_ORDER_FIELDS.has(orderField) ? orderField : "created_at";
  const ascending = orderBy === "asc";

  const { data, error, count } = await query
    .order(sortField, { ascending, nullsFirst: false })
    .range(rangeStart, rangeEnd);

  if (error) {
    throw error;
  }

  return {
    data: (data ?? []) as ElearningCourseDto[],
    total: count ?? 0,
    page: safePage,
    limit: safeLimit,
  };
};

const getElearningCourseById = async (courseId: string) => {
  const trimmedId = courseId?.trim();

  if (!trimmedId) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from("courses")
    .select(COURSES_SELECT)
    .eq("id", trimmedId)
    .single();

  return {
    data: (data as ElearningCourseDto) ?? null,
    error,
  };
};

const getElearningCourseStudents = async (
  input: GetElearningStudentsQueryInput,
): Promise<PaginatedResult<ElearningCourseStudentDto>> => {
  const {
    courseId,
    page = 1,
    limit = 10,
    search,
    branchId,
    departmentId,
  } = input;

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
  const rangeStart = (safePage - 1) * safeLimit;
  const rangeEnd = rangeStart + safeLimit - 1;

  if (!courseId) {
    return {
      data: [],
      total: 0,
      page: safePage,
      limit: safeLimit,
    };
  }

  let query = supabase
    .from("courses_students")
    .select(ELEARNING_COURSE_STUDENTS_SELECT, { count: "exact" })
    .eq("course_id", courseId)
    .eq("student.employee_type", "student");

  if (search?.trim()) {
    const sanitized = sanitizeSearchTerm(search.trim());
    query = query.or(
      [
        `full_name.ilike.%${sanitized}%`,
        `email.ilike.%${sanitized}%`,
        `phone_number.ilike.%${sanitized}%`,
      ].join(","),
      { foreignTable: "student.profile" },
    );
  }

  if (branchId && branchId !== "all") {
    query = query.eq(
      "student.branchEmployments.organization_unit_id",
      branchId,
    );
  }

  if (departmentId && departmentId !== "all") {
    query = query.eq(
      "student.departmentEmployments.organization_unit_id",
      departmentId,
    );
  }

  const { data, error, count } = await query
    .order("id", { ascending: false })
    .range(rangeStart, rangeEnd);

  if (error) {
    throw error;
  }

  const rawData = (data ?? []) as Record<string, any>[];
  const parsedData = rawData.map((item) => {
    const { student, ...restItem } = item as Record<string, any>;

    if (!student) {
      return {
        ...restItem,
      };
    }

    const { employments: studentEmployments, ...studentInfo } =
      student as Record<string, any>;

    return {
      ...restItem,
      student: {
        ...studentInfo,
        employments: studentEmployments ?? [],
      },
    };
  }) as ElearningCourseStudentDto[];

  return {
    data: parsedData,
    total: count ?? 0,
    page: safePage,
    limit: safeLimit,
  };
};

const getMyElearningCourses = async (
  input: GetMyElearningCoursesInput,
): Promise<PaginatedResult<ElearningAssignedCourseDto>> => {
  const { studentId, page = 1, limit = 12, search } = input;

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 12;
  const rangeStart = (safePage - 1) * safeLimit;
  const rangeEnd = rangeStart + safeLimit - 1;

  if (!studentId) {
    return {
      data: [],
      total: 0,
      page: safePage,
      limit: safeLimit,
    };
  }

  let query = supabase
    .from("courses_students")
    .select(MY_ELEARNING_ASSIGNMENTS_SELECT, { count: "exact" })
    .eq("student_id", studentId);

  if (search?.trim()) {
    const sanitized = sanitizeSearchTerm(search.trim());
    query = query.or(
      [
        `title.ilike.%${sanitized}%`,
        `description.ilike.%${sanitized}%`,
      ].join(","),
      { foreignTable: "course" },
    );
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeEnd);

  if (error) {
    throw error;
  }

  const parsedData = (data ?? []).map((item) => ({
    assignmentId: item.id,
    assignedAt: item.created_at,
    courseId: item.course_id,
    course: item.course ?? null,
  })) as ElearningAssignedCourseDto[];

  return {
    data: parsedData,
    total: count ?? 0,
    page: safePage,
    limit: safeLimit,
  };
};

const deleteElearningCourseById = async (elearningId: string) => {
  const { error } = await supabase.from("courses")
    .update({ status: "deleted" })
    .eq("id", elearningId);

  if (error) {
    throw new Error(`Failed to delete elearning course: ${error.message}`);
  }
}

type DeletePivotElearningStudentsPayload = {
  courseId: string;
  studentsId: string[];
};
const deletePivotElearningCourseStudents = async (payload: DeletePivotElearningStudentsPayload) => {
  const { error } = await supabase
    .from("courses_students")
    .delete()
    .eq("course_id", payload.courseId)
    .in("student_id", payload.studentsId)
    .select();

  if (error) {
    throw new Error(`Failed to delete user in elearning course: ${error.message}`);
  }
};

const getTableTest = async () => {
  return await supabase.from("courses_categories").select("*");
}


export {
  getElearnings,
  getElearningCourseById,
  getElearningCourseStudents,
  getMyElearningCourses,
  getTableTest,

  deleteElearningCourseById,
  deletePivotElearningCourseStudents
};

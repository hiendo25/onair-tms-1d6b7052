import { supabase } from "@/services";
import { CreateCoursePayload, UpdateCoursePayload, CreatePivotCoursesWithCategoriesPayload } from "./type";
import { CourseMetaKey, CourseMetaValue } from "@/constants/course-meta.constant";
import { PaginatedResult } from "@/types/dto/pagination.dto";
import { CourseDto } from "@/types/dto/courses/course.dto";
import { GetCoursesQueryInput } from "@/modules/courses/operations/query";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const ALLOWED_ORDER_FIELDS = new Set(["created_at", "title", "start_at", "end_at"]);

const createCourse = async (payload: CreateCoursePayload) => {
  try {
    return await supabase.from("courses").insert(payload).select("*").single();
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

const updateCourse = async (payload: UpdateCoursePayload) => {
  try {
    const { id: courseId, ...restPayload } = payload;
    return await supabase.from("courses").update(restPayload).match({ id: courseId }).select("*").single();
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

const createPivotCoursesWithCategories = async (payload: CreatePivotCoursesWithCategoriesPayload[]) => {
  try {
    return await supabase.from("courses_categories").insert(payload).select("*");
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error craete Class Room");
  }
};

const deletePivotCoursesWithCategories = async (ids: number[]) => {
  try {
    return await supabase.from("courses_categories").delete().in("id", ids).select("*");
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error Delete Pivot Courses With Categories");
  }
};

const getCourseById = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select(
        `
          id, 
          title,
          slug,
          description,
          status,
          created_by,
          courses_metadatas(id, key, value, course_id),
          courses_categories(
            id,
            categories(
              id, name, slug
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
          sections(
            id,
            title,
            description,
            course_id,
            status,
            priority,
            lessons(
              id,
              title,
              content,
              section_id,
              assignment_id,
              lesson_type,
              priority,
              status,
              main_resource:resources(
                id,
                path,
                size, 
                kind, 
                mime_type, 
                name
              ),
              assignments(
                id,
                name, 
                description
              ),
              lessons_resources(
                id,
                resource:resources(
                  id,
                  path,
                  size, 
                  kind, 
                  mime_type, 
                  name
                  )
                )
            )
          )
        `,
      )
      .eq("id", courseId)
      .order("priority", { ascending: true, referencedTable: "sections" })
      .order("priority", { ascending: true, referencedTable: "sections.lessons" })
      .single()
      .overrideTypes<{
        courses_metadatas: {
          class_room_id: string;
          id: number;
          key: CourseMetaKey;
          value: CourseMetaValue;
        }[];
      }>();
    return { data, error };
  } catch (err: any) {
    throw new Error(err?.message ?? "Fetching ClassRoom Detail failed not found");
  }
};

const deleteCoursesByEmployeeId = async (employeeId: string) => {
  try {
    const { error } = await supabase
      .from("courses")
      .update({ status: "deleted" })
      .eq("created_by", employeeId);

    if (error) throw error;
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error deleting courses");
  }
};

export type GetCourseByIdResponse = Awaited<ReturnType<typeof getCourseById>>;

const getCourses = async (
  input: GetCoursesQueryInput = {},
): Promise<PaginatedResult<CourseDto>> => {
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

  if (!organizationId) {
    return {
      data: [],
      total: 0,
      page: safePage,
      limit: safeLimit,
    };
  }

  let query = supabase
    .from("courses")
    .select("*", { count: "exact" })
    .not("status", "in", "(deleted)");

  if (organizationId) {
    query = query.eq("organization_id", organizationId!);
  }

  const accessConditions: string[] = [];

  const trimmedSearch = q?.trim();
  const sanitizedSearch = trimmedSearch ? trimmedSearch : null;
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
    data: data,
    total: count ?? 0,
    page: safePage,
    limit: safeLimit,
  };
};

const deleteCourseById = async (courseId: string) => {
  const { error } = await supabase.from("courses")
    .update({ status: "deleted" })
    .eq("id", courseId);

  if (error) {
    throw new Error(`Failed to delete course: ${error.message}`);
  }
}


export {
  createCourse,
  createPivotCoursesWithCategories,
  getCourseById,
  getCourses,
  updateCourse,
  deletePivotCoursesWithCategories,
  deleteCoursesByEmployeeId,
  deleteCourseById,
};

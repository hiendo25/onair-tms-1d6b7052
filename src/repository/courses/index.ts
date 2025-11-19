import { supabase } from "@/services";
import { CreateCoursePayload, UpdateCoursePayload, CreatePivotCoursesWithCategoriesPayload } from "./type";
import { CourseMetaKey, CourseMetaValue } from "@/constants/course-meta.constant";

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
export type GetCourseByIdResponse = Awaited<ReturnType<typeof getCourseById>>;

export type GetCoursesQueryParams = {
  limit?: number;
};
const getCourses = async (courseQueryparams?: GetCoursesQueryParams) => {
  try {
    return await supabase.from("courses").select(
      `
        id,
        title,
        slug,
        status,
        created_by,
        courses_categories(
          id,
          categories(
            id, name, slug
          )
        ),
        organizations(
          id, 
          name
        ),
        sections(
          id,
          title,
          course_id,
          status,
          priority,
          lessons(
            id,
            title,
            lesson_type,
            priority,
            status
          )
        ),
        owner:employees(
          id,
          employee_code,
          profiles(id, full_name, avatar, email)
        )
      `,
      { count: "exact" },
    );
  } catch (err: any) {
    throw new Error(err?.message ?? "Fetching Course list failed.");
  }
};
export type GetCoursesResponse = Awaited<ReturnType<typeof getCourses>>;

export {
  createCourse,
  createPivotCoursesWithCategories,
  getCourseById,
  getCourses,
  updateCourse,
  deletePivotCoursesWithCategories,
};

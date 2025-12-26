import type { ResourceRow } from "@/modules/learning-screen/types";
import { createSVClient } from "@/services";
import type { Tables } from "@/types/supabase.types";

export type LessonResourceBridgeRow = Tables<"lessons_resources"> & {
  resource?: ResourceRow | null;
};

export type RawLessonDetailRow = Tables<"lessons"> & {
  lesson_resources?: LessonResourceBridgeRow[] | null;
  main_resource_detail?: ResourceRow | null;
};

export type RawOutlineLessonRow = Pick<
  Tables<"lessons">,
  | "assignment_id"
  | "created_at"
  | "id"
  | "lesson_type"
  | "main_resource"
  | "priority"
  | "section_id"
  | "status"
  | "title"
  | "updated_at"
> & {
  main_resource_detail?: ResourceRow | null;
};

export type RawOutlineSectionRow = Tables<"sections"> & {
  lessons?: RawOutlineLessonRow[] | null;
};

export type RawOutlineCourseRow = Tables<"courses"> & {
  sections?: RawOutlineSectionRow[] | null;
};

export type LessonProgressRow = Pick<Tables<"lesson_progress">, "lesson_id" | "status">;
export type CourseHeaderRow = Pick<Tables<"courses">, "id" | "title">;

const COURSE_OUTLINE_SELECT = `
  *,
  sections:sections (
    *,
    lessons:lessons (
      id,
      title,
      lesson_type,
      priority,
      main_resource,
      main_resource_detail:resources (*),
      section_id,
      status,
      assignment_id,
      created_at,
      updated_at
    )
  )
`;

const LESSON_DETAIL_SELECT = `
  *,
  main_resource_detail:resources (*),
  lesson_resources:lessons_resources (
    *,
    resource:resources (*)
  )
`;

const getCourseOutlineRaw = async (courseId: string): Promise<RawOutlineCourseRow | null> => {
  const trimmedCourseId = courseId?.trim();
  if (!trimmedCourseId) {
    return null;
  }

  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_OUTLINE_SELECT)
    .eq("id", trimmedCourseId)
    .order("priority", { ascending: true, referencedTable: "sections" })
    .order("created_at", { ascending: true, referencedTable: "sections" })
    .order("priority", { ascending: true, referencedTable: "sections.lessons" })
    .order("created_at", { ascending: true, referencedTable: "sections.lessons" })
    .single();

  if (error) {
    throw error;
  }

  return (data ?? null) as unknown as RawOutlineCourseRow | null;
};

const getLessonDetailRaw = async (lessonId: string): Promise<RawLessonDetailRow | null> => {
  const trimmedLessonId = lessonId?.trim();
  if (!trimmedLessonId) {
    return null;
  }

  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_DETAIL_SELECT)
    .eq("id", trimmedLessonId)
    .single();

  if (error) {
    throw error;
  }

  return (data ?? null) as unknown as RawLessonDetailRow | null;
};

const getResourcesByIds = async (resourceIds: string[]): Promise<ResourceRow[]> => {
  if (!resourceIds.length) {
    return [];
  }

  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .in("id", resourceIds);

  if (error) {
    throw error;
  }

  return data ?? [];
};

const getLessonProgressRows = async (
  lessonIds: string[],
  learningPathId: string,
  employeeId: string,
): Promise<LessonProgressRow[]> => {
  if (!lessonIds.length) {
    return [];
  }

  const trimmedLearningPathId = learningPathId?.trim();
  if (!trimmedLearningPathId) {
    return [];
  }

  const trimmedEmployeeId = employeeId?.trim();
  if (!trimmedEmployeeId) {
    return [];
  }

  const supabase = await createSVClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id,status")
    .in("lesson_id", lessonIds)
    .eq("learning_path_id", trimmedLearningPathId)
    .eq("employee_id", trimmedEmployeeId);

  if (error) {
    throw error;
  }

  return data ?? [];
};

const getCourseHeaderById = async (courseId: string): Promise<CourseHeaderRow | null> => {
  const trimmedCourseId = courseId?.trim();
  if (!trimmedCourseId) {
    return null;
  }

  const supabase = await createSVClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id,title")
    .eq("id", trimmedCourseId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
};

const getAssignmentById = async (assignmentId: string): Promise<Tables<"assignments"> | null> => {
  const trimmedAssignmentId = assignmentId?.trim();
  if (!trimmedAssignmentId) {
    return null;
  }

  const supabase = await createSVClient();
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", trimmedAssignmentId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
};

export {
  getAssignmentById,
  getCourseHeaderById,
  getCourseOutlineRaw,
  getLessonDetailRaw,
  getLessonProgressRows,
  getResourcesByIds,
};

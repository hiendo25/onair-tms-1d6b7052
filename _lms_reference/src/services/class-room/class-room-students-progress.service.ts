import { calculateProgressPercentage } from "@/services/progress/progress.service";
import { createSVClient } from "@/services/supabase/server";

export interface ClassRoomStudentProgressItem {
  employeeId: string;
  completedLessons: number;
  progressPercentage: number;
}

export interface ClassRoomStudentsProgressResult {
  classRoomId: string;
  totalLessons: number;
  students: ClassRoomStudentProgressItem[];
}

interface GetClassRoomStudentsProgressParams {
  classRoomId: string;
  employeeIds: string[];
  learningPathId?: string | null;
}

const getClassRoomLessonIds = async (classRoomId: string): Promise<string[]> => {
  const supabase = await createSVClient();

  const { data: sessionCourses, error: coursesError } = await supabase
    .from("class_sessions")
    .select("class_sessions_courses_period!inner(course_id)")
    .eq("class_room_id", classRoomId);

  if (coursesError) {
    throw new Error(`Failed to fetch class room courses: ${coursesError.message}`);
  }

  const courseIds = Array.from(
    new Set(
      (sessionCourses ?? []).flatMap((session: any) =>
        session.class_sessions_courses_period?.map((course: any) => course.course_id) || [],
      ),
    ),
  );

  if (courseIds.length === 0) {
    return [];
  }

  const { data: sections, error: lessonsError } = await supabase
    .from("sections")
    .select("lessons!inner(id)")
    .in("course_id", courseIds)
    .eq("status", "active")
    .eq("lessons.status", "active");

  if (lessonsError) {
    throw new Error(`Failed to fetch class room lessons: ${lessonsError.message}`);
  }

  const lessonIds = (sections ?? []).flatMap((section: any) =>
    section.lessons?.map((lesson: { id: string }) => lesson.id) || [],
  );

  return Array.from(new Set(lessonIds));
};

export const getClassRoomStudentsProgress = async (
  params: GetClassRoomStudentsProgressParams,
): Promise<ClassRoomStudentsProgressResult> => {
  const { classRoomId, employeeIds, learningPathId } = params;

  if (!classRoomId) {
    throw new Error("Class room ID is required");
  }

  const lessonIds = await getClassRoomLessonIds(classRoomId);
  const totalLessons = lessonIds.length;

  if (employeeIds.length === 0 || totalLessons === 0) {
    return {
      classRoomId,
      totalLessons,
      students: employeeIds.map((employeeId) => ({
        employeeId,
        completedLessons: 0,
        progressPercentage: 0,
      })),
    };
  }

  const supabase = await createSVClient();

  let progressQuery = supabase
    .from("lesson_progress")
    .select("employee_id")
    .in("employee_id", employeeIds)
    .in("lesson_id", lessonIds)
    .eq("status", "completed");

  if (learningPathId) {
    progressQuery = progressQuery.eq("learning_path_id", learningPathId);
  } else {
    progressQuery = progressQuery.eq("class_room_id", classRoomId).is("learning_path_id", null);
  }

  const { data: progressRows, error: progressError } = await progressQuery;

  if (progressError) {
    throw new Error(`Failed to fetch lesson progress: ${progressError.message}`);
  }

  const completedMap = new Map<string, number>();
  (progressRows ?? []).forEach((row: any) => {
    const current = completedMap.get(row.employee_id) ?? 0;
    completedMap.set(row.employee_id, current + 1);
  });

  const students = employeeIds.map((employeeId) => {
    const completedLessons = completedMap.get(employeeId) ?? 0;
    return {
      employeeId,
      completedLessons,
      progressPercentage: calculateProgressPercentage(completedLessons, totalLessons),
    };
  });

  return {
    classRoomId,
    totalLessons,
    students,
  };
};

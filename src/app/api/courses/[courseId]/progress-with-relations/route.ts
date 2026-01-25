/**
 * GET /api/courses/[courseId]/progress-with-relations?learningPathId=[learningPathId]
 *
 * Get course progress with nested sections and lessons progress
 * Returns course progress along with all sections and their lessons
 *
 * Query params:
 * - learningPathId (optional): If not provided, will get the most recent learning path for the employee
 *
 * OPTIMIZATIONS APPLIED:
 * 1. Batch fetch all sections for the course (ordered by priority)
 * 2. Batch fetch all lessons for all sections (ordered by priority)
 * 3. Single batch query for all lesson progress data
 * 4. In-memory calculation for nested structure
 *
 * Performance: 3 queries regardless of section/lesson count
 */

import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import {
  buildProgressResponse,
  calculateProgressPercentage,
  resolveLearningPathId,
} from "@/services/progress/progress.service";
import { createSVClient } from "@/services/supabase/server";
import type { LessonProgressResponse, ProgressResponse } from "@/types/progress.types";

// Database response types
interface SectionRecord {
  id: string;
  priority: number | null;
}

interface LessonRecord {
  id: string;
  section_id: string;
  priority: number | null;
}

interface LessonProgressRecord {
  lesson_id: string;
  status: "in_progress" | "completed";
  current_position_seconds: number | null;
}

interface LessonProgressData {
  isCompleted: boolean;
  currentPositionSeconds: number | null;
}

// API response types
interface SectionWithLessonsProgress extends ProgressResponse {
  lessons: LessonProgressResponse[];
}

interface CourseProgressWithRelations extends ProgressResponse {
  sections: SectionWithLessonsProgress[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    // Authenticate user and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    // Get course ID from route params
    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 },
      );
    }

    // Get learning path ID from query params or resolve to most recent
    const providedLearningPathId = request.nextUrl.searchParams.get("learningPathId");
    const learningPathId = await resolveLearningPathId(employee.id, providedLearningPathId);

    const supabase = await createSVClient();

    // Step 1: Fetch all sections for this course
    const { data: sectionsData, error: sectionsError } = await supabase
      .from("sections")
      .select("id, priority")
      .eq("course_id", courseId)
      .eq("status", "active")
      .order("priority", { ascending: true });

    const sections = sectionsData as SectionRecord[] | null;

    if (sectionsError) {
      console.error("[API] Error fetching sections:", sectionsError);
      return NextResponse.json(
        { error: "Failed to fetch sections" },
        { status: 500 },
      );
    }

    if (!sections || sections.length === 0) {
      // No sections, return course with empty structure
      const courseProgress: CourseProgressWithRelations = {
        entityId: courseId,
        entityType: "course",
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
        learningPathId,
        employeeId: employee.id,
        sections: [],
      };

      return NextResponse.json(courseProgress, { status: 200 });
    }

    const sectionIds = sections.map((section) => section.id);

    // Step 2: Fetch all lessons for all sections in one query
    const { data: lessonsData, error: lessonsError } = await supabase
      .from("lessons")
      .select("id, section_id, priority")
      .in("section_id", sectionIds)
      .eq("status", "active")
      .order("priority", { ascending: true });

    const lessons = lessonsData as LessonRecord[] | null;

    if (lessonsError) {
      console.error("[API] Error fetching lessons:", lessonsError);
      return NextResponse.json(
        { error: "Failed to fetch lessons" },
        { status: 500 },
      );
    }

    if (!lessons || lessons.length === 0) {
      // No lessons, return course with sections but no lessons
      const sectionsWithProgress: SectionWithLessonsProgress[] = sections.map((section) => ({
        entityId: section.id,
        entityType: "section" as const,
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
        learningPathId,
        employeeId: employee.id,
        lessons: [],
      }));

      const courseProgress: CourseProgressWithRelations = {
        entityId: courseId,
        entityType: "course",
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
        learningPathId,
        employeeId: employee.id,
        sections: sectionsWithProgress,
      };

      return NextResponse.json(courseProgress, { status: 200 });
    }

    const lessonIds = lessons.map((lesson) => lesson.id);

    // Step 3: Batch fetch progress for all lessons at once (including current_position_seconds)
    let progressQuery = supabase
      .from("lesson_progress")
      .select("lesson_id, status, current_position_seconds")
      .eq("employee_id", employee.id)
      .in("lesson_id", lessonIds);

    if (learningPathId) {
      progressQuery = progressQuery.eq("learning_path_id", learningPathId);
    }

    const { data: progressDataRaw, error: progressError } = await progressQuery;
    const progressData = progressDataRaw as LessonProgressRecord[] | null;

    if (progressError) {
      console.error("[API] Error fetching progress data:", progressError);
      return NextResponse.json(
        { error: "Failed to fetch progress data" },
        { status: 500 },
      );
    }

    // Step 4: Build lookup maps for efficient in-memory processing
    const lessonProgressMap = new Map<string, LessonProgressData>();

    if (progressData) {
      progressData.forEach((progress) => {
        lessonProgressMap.set(progress.lesson_id, {
          isCompleted: progress.status === "completed",
          currentPositionSeconds: progress.current_position_seconds,
        });
      });
    }

    // Group lessons by section
    const lessonsBySection = new Map<string, LessonRecord[]>();
    lessons.forEach((lesson) => {
      const sectionLessons = lessonsBySection.get(lesson.section_id);
      if (!sectionLessons) {
        lessonsBySection.set(lesson.section_id, [lesson]);
      } else {
        sectionLessons.push(lesson);
      }
    });

    // Step 5: Build nested response structure
    let totalCourseLessons = 0;
    let totalCourseCompletedLessons = 0;

    const sectionsWithProgress: SectionWithLessonsProgress[] = sections.map((section) => {
      const sectionLessons = lessonsBySection.get(section.id) ?? [];

      // Build lesson progress for this section (with currentPositionSeconds)
      const lessonProgressList: LessonProgressResponse[] = sectionLessons.map((lesson) => {
        const progress = lessonProgressMap.get(lesson.id);
        const isCompleted = progress?.isCompleted ?? false;
        const currentPositionSeconds = progress?.currentPositionSeconds ?? null;

        return {
          entityId: lesson.id,
          entityType: "lesson",
          totalLessons: 1,
          completedLessons: isCompleted ? 1 : 0,
          progressPercentage: isCompleted ? 100 : 0,
          learningPathId,
          employeeId: employee.id,
          currentPositionSeconds,
        };
      });

      // Calculate section progress
      const sectionTotalLessons = sectionLessons.length;
      const sectionCompletedLessons = sectionLessons.filter((lesson) => {
        const progress = lessonProgressMap.get(lesson.id);
        return progress?.isCompleted ?? false;
      }).length;

      // Accumulate for course totals
      totalCourseLessons += sectionTotalLessons;
      totalCourseCompletedLessons += sectionCompletedLessons;

      return {
        entityId: section.id,
        entityType: "section" as const,
        totalLessons: sectionTotalLessons,
        completedLessons: sectionCompletedLessons,
        progressPercentage: calculateProgressPercentage(
          sectionCompletedLessons,
          sectionTotalLessons
        ),
        learningPathId,
        employeeId: employee.id,
        lessons: lessonProgressList,
      };
    });

    // Build final course progress response
    const courseProgress: CourseProgressWithRelations = {
      entityId: courseId,
      entityType: "course",
      totalLessons: totalCourseLessons,
      completedLessons: totalCourseCompletedLessons,
      progressPercentage: calculateProgressPercentage(
        totalCourseCompletedLessons,
        totalCourseLessons
      ),
      learningPathId,
      employeeId: employee.id,
      sections: sectionsWithProgress,
    };

    return NextResponse.json(courseProgress, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching course progress with relations:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch course progress with relations",
      },
      { status: 500 },
    );
  }
}

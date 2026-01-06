/**
 * Gamification Event Handler
 * Handles XP awarding events triggered by user actions
 *
 * NOTE: Only processes gamification for lessons within a learning path context
 * (learningPathId must be provided)
 */

import type { TargetTriggerType } from "@/constants/gamification-rules.constant";
import {
  calculateProgressPercentage,
  getCourseProgress,
  getClassRoomProgress,
  getLearningPathProgress,
  getPhaseProgress,
} from "@/services/progress/progress.service";
import { createSVClient } from "@/services/supabase/server";
import { awardXp } from "../xp-transactions";
import { getRulesForOrganization } from "../rules";

interface LessonCompletionContext {
  employeeId: string;
  organizationId: string;
  lessonId: string;
  learningPathId?: string | null;
}

interface XpAward {
  entityType: string;
  xpAmount: number;
  progress: number;
}

interface ProgressCalculationResult {
  entityId: string;
  entityType: "course" | "class" | "phase" | "learning_path";
  triggerType: TargetTriggerType;
  progressPercentage: number;
  totalLessons: number;
  completedLessons: number;
}

/**
 * Get course ID, class room ID, and phase ID from a lesson
 * Returns all IDs in a single query for better performance
 */
async function getLessonHierarchy(
  lessonId: string,
  learningPathId: string
): Promise<{
  courseId: string | null;
  classRoomId: string | null;
  phaseId: string | null;
}> {
  try {
    const supabase = await createSVClient();

    // Get section from lesson
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("section_id")
      .eq("id", lessonId)
      .single();

    if (lessonError || !lesson) {
      return { courseId: null, classRoomId: null, phaseId: null };
    }

    // Get course from section
    const { data: section, error: sectionError } = await supabase
      .from("sections")
      .select("course_id")
      .eq("id", lesson.section_id)
      .single();

    if (sectionError || !section) {
      return { courseId: null, classRoomId: null, phaseId: null };
    }

    const courseId = section.course_id;

    // Get class room from course via class_sessions_courses_period
    const { data: sessionCourse, error: scError } = await supabase
      .from("class_sessions_courses_period")
      .select(`
        class_sessions!inner(
          class_room_id
        )
      `)
      .eq("course_id", courseId)
      .limit(1)
      .maybeSingle();

    if (scError || !sessionCourse) {
      return { courseId, classRoomId: null, phaseId: null };
    }

    const classRoomId = (sessionCourse.class_sessions as any)?.class_room_id;
    if (!classRoomId) {
      return { courseId, classRoomId: null, phaseId: null };
    }

    // Get phase from class room and learning path
    const { data: phaseClassRoom, error: pcError } = await supabase
      .from("phase_class_rooms")
      .select(`
        phase_id,
        learning_path_phases!inner(
          learning_path_id
        )
      `)
      .eq("class_room_id", classRoomId)
      .eq("learning_path_phases.learning_path_id", learningPathId)
      .limit(1)
      .maybeSingle();

    if (pcError || !phaseClassRoom) {
      return { courseId, classRoomId, phaseId: null };
    }

    return { courseId, classRoomId, phaseId: phaseClassRoom.phase_id };
  } catch (error) {
    console.error("Error getting lesson hierarchy:", error);
    return { courseId: null, classRoomId: null, phaseId: null };
  }
}

/**
 * Check if XP was already awarded for an entity
 */
async function wasXpAwarded(
  employeeId: string,
  organizationId: string,
  triggerType: TargetTriggerType,
  entityId: string
): Promise<boolean> {
  try {
    const supabase = await createSVClient();

    const { data, error } = await supabase
      .from("employee_xp_transactions")
      .select("id")
      .eq("employee_id", employeeId)
      .eq("organization_id", organizationId)
      .eq("trigger_type", triggerType)
      .contains("metadata", { entity_id: entityId })
      .limit(1);

    if (error) {
      console.error("Error checking XP award history:", error);
      return false;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error("Error checking XP award:", error);
    return false;
  }
}

/**
 * Process gamification in background (fire-and-forget)
 * Logs errors but doesn't throw them
 */
export function handleLessonCompletionBackground(
  context: LessonCompletionContext
): void {
  // Fire-and-forget: don't await, just start the process
  handleLessonCompletion(context).catch((error) => {
    console.error("[Background Gamification] Error processing XP awards:", error);
  });
}

/**
 * Handle lesson completion event and award XP if applicable
 * Only processes if learningPathId is provided
 */
export async function handleLessonCompletion(
  context: LessonCompletionContext
): Promise<{
  xpAwarded: boolean;
  awards: XpAward[];
}> {
  const { employeeId, organizationId, lessonId, learningPathId } = context;
  const awards: XpAward[] = [];

  // Only process gamification if learningPathId is provided
  if (!learningPathId) {
    return { xpAwarded: false, awards: [] };
  }

  try {
    // Fetch gamification rules for organization (includes defaults if not in DB)
    const rulesResult = await getRulesForOrganization(organizationId);
    if (!rulesResult.success) {
      console.error("Failed to fetch gamification rules");
      return { xpAwarded: false, awards: [] };
    }

    // Create a map of rules by trigger type for easy lookup
    const rulesMap = new Map(
      rulesResult.data.map((rule) => [rule.trigger_type, rule])
    );

    // Get lesson hierarchy (course, class room, phase) in a single flow
    const { courseId, classRoomId, phaseId } = await getLessonHierarchy(
      lessonId,
      learningPathId
    );

    // Calculate progress for all applicable entities
    const progressResults: ProgressCalculationResult[] = [];

    // 1. Course progress (if lesson belongs to a course)
    if (courseId) {
      const { totalLessons, completedLessons } = await getCourseProgress(
        courseId,
        employeeId,
        learningPathId
      );
      const progressPercentage = calculateProgressPercentage(completedLessons, totalLessons);

      progressResults.push({
        entityId: courseId,
        entityType: "course",
        triggerType: "course_completed",
        progressPercentage,
        totalLessons,
        completedLessons,
      });
    }

    // 2. Class progress (if lesson belongs to a class)
    if (classRoomId) {
      const { totalLessons, completedLessons } = await getClassRoomProgress(
        classRoomId,
        employeeId,
        learningPathId
      );
      const progressPercentage = calculateProgressPercentage(completedLessons, totalLessons);

      progressResults.push({
        entityId: classRoomId,
        entityType: "class",
        triggerType: "class_completed",
        progressPercentage,
        totalLessons,
        completedLessons,
      });
    }

    // 3. Phase progress (if lesson belongs to a phase within the learning path)
    if (phaseId) {
      const { totalLessons, completedLessons } = await getPhaseProgress(
        phaseId,
        employeeId,
        learningPathId
      );
      const progressPercentage = calculateProgressPercentage(completedLessons, totalLessons);

      progressResults.push({
        entityId: phaseId,
        entityType: "phase",
        triggerType: "phase_completed",
        progressPercentage,
        totalLessons,
        completedLessons,
      });
    }

    // 4. Learning path progress
    const { totalLessons, completedLessons } = await getLearningPathProgress(
      learningPathId,
      employeeId
    );
    const progressPercentage = calculateProgressPercentage(completedLessons, totalLessons);

    progressResults.push({
      entityId: learningPathId,
      entityType: "learning_path",
      triggerType: "learning_path_completed",
      progressPercentage,
      totalLessons,
      completedLessons,
    });

    // Award XP for entities that meet criteria
    for (const progress of progressResults) {
      // Get the rule for this trigger type
      const rule = rulesMap.get(progress.triggerType);

      // Skip if rule doesn't exist or is not active
      if (!rule || !rule.is_active) {
        continue;
      }

      // Get minimum progress percentage from rule conditions (default to 80 if not set)
      const minProgressPercentage =
        (rule.conditions as any)?.min_progress_percentage ?? 80;

      // Check if progress meets threshold
      if (progress.progressPercentage >= minProgressPercentage) {
        // Check if XP was already awarded
        const alreadyAwarded = await wasXpAwarded(
          employeeId,
          organizationId,
          progress.triggerType,
          progress.entityId
        );

        if (!alreadyAwarded) {
          // Award XP (awardXp will validate the rule again internally)
          const result = await awardXp({
            employeeId,
            organizationId,
            triggerType: progress.triggerType,
            metadata: {
              entity_id: progress.entityId,
              entity_type: progress.entityType,
              progress_percentage: progress.progressPercentage,
              total_lessons: progress.totalLessons,
              completed_lessons: progress.completedLessons,
              triggered_by_lesson: lessonId,
            },
          });

          if (result.success && result.xpAwarded) {
            awards.push({
              entityType: progress.entityType,
              xpAmount: result.xpAwarded,
              progress: progress.progressPercentage,
            });
          }
        }
      }
    }

    return {
      xpAwarded: awards.length > 0,
      awards,
    };
  } catch (error) {
    console.error("Error handling lesson completion:", error);
    return { xpAwarded: false, awards: [] };
  }
}

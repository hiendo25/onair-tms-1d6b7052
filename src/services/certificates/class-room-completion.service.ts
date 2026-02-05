/**
 * Class Room Completion Service
 * Handles business logic for checking class room completion and certificate eligibility
 */

import {
  classRoomSessionRepository,
  coursesLessonsRepository,
  lessonProgressRepository,
} from "@/repository";

export type CertificateEligibilityResult = {
  isEligible: boolean;
  classRoomId?: string;
  classRoomTitle?: string;
  certificateTemplateId?: string;
  daysToExpire?: number | null;
};

/**
 * Check if a specific course is completed by the employee in a given class room context
 */
async function isCourseCompleted(
  employeeId: string,
  courseId: string,
  classRoomId?: string | null
): Promise<boolean> {
  // Get all lessons for this course
  const courseLessons = await coursesLessonsRepository.getLessonsByCourseId(courseId);

  if (courseLessons.length === 0) {
    return false;
  }

  const courseLessonIds = courseLessons.map((l) => l.id);

  // Check completion for this course in the specific context (class room or standalone)
  const courseCompletedLessons = await lessonProgressRepository.getCompletedLessonsForEmployee(
    employeeId,
    courseLessonIds,
    classRoomId
  );

  return courseCompletedLessons.length >= courseLessons.length;
}

/**
 * Check if all courses in a class room are completed by the employee
 */
async function isClassRoomFullyCompleted(employeeId: string, classRoomId: string): Promise<boolean> {
  // Get all courses in this class room
  const allClassRoomCourses = await classRoomSessionRepository.getCoursesByClassRoomId(classRoomId);

  if (allClassRoomCourses.length === 0) {
    return false;
  }

  const classRoomCourseIds = Array.from(new Set(allClassRoomCourses.map((c: any) => c.course_id))) as string[];

  // Check completion for all courses in class room, filtered by classRoomId
  for (const courseId of classRoomCourseIds) {
    const isComplete = await isCourseCompleted(employeeId, courseId, classRoomId);

    if (!isComplete) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a specific class room is eligible for certificate generation
 * Simplified version that checks only the provided class room
 *
 * @param employeeId - The employee ID
 * @param classRoomId - The class room ID to check
 * @returns Certificate eligibility information for this class room
 */
async function checkClassRoomCertificateEligibility(
  employeeId: string,
  classRoomId: string
): Promise<CertificateEligibilityResult | null> {
  try {
    // Get class room details including certificate template
    const classRoomSessions = await classRoomSessionRepository.getClassRoomSessionsByClassRoomId(classRoomId);

    if (classRoomSessions.length === 0) {
      return null;
    }

    // Extract class room info
    const classRooms = classRoomSessionRepository.extractClassRoomsFromSessions(classRoomSessions);

    if (classRooms.length === 0) {
      return null;
    }

    const classRoom = classRooms[0];

    if (!classRoom || !classRoom.certificateTemplateId) {
      return null;
    }

    // Check if all courses in this class room are completed
    const isComplete = await isClassRoomFullyCompleted(employeeId, classRoomId);

    if (!isComplete) {
      return null;
    }

    return {
      isEligible: true,
      classRoomId: classRoom.classRoomId,
      classRoomTitle: classRoom.classRoomTitle,
      certificateTemplateId: classRoom.certificateTemplateId,
      daysToExpire: classRoom.daysToExpire,
    };
  } catch (error) {
    console.error("[ClassRoomCompletionService] Error checking class room certificate eligibility:", error);
    throw error;
  }
}

export { checkClassRoomCertificateEligibility };

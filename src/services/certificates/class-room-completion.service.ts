/**
 * Class Room Completion Service
 * Handles business logic for checking class room completion and certificate eligibility
 */

import * as classRoomSessionRepository from "@/repository/class-session";
import * as coursesLessonsRepository from "@/repository/courses-lessons";
import * as lessonProgressRepository from "@/repository/lesson-progress";

export type CertificateEligibilityResult = {
  isEligible: boolean;
  classRoomId?: string;
  classRoomTitle?: string;
  certificateTemplateId?: string;
};

/**
 * Check if a specific course is completed by the employee
 */
async function isCourseCompleted(employeeId: string, courseId: string): Promise<boolean> {
  // Get all lessons for this course
  const courseLessons = await coursesLessonsRepository.getLessonsByCourseId(courseId);

  if (courseLessons.length === 0) {
    return false;
  }

  const courseLessonIds = courseLessons.map((l) => l.id);

  // Check completion for this course
  const courseCompletedLessons = await lessonProgressRepository.getCompletedLessonsForEmployee(
    employeeId,
    courseLessonIds
  );

  return courseCompletedLessons.length === courseLessons.length;
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

  const classRoomCourseIds = [...new Set(allClassRoomCourses.map((c: any) => c.course_id))];

  // Check completion for all courses in class room
  for (const courseId of classRoomCourseIds) {
    const isComplete = await isCourseCompleted(employeeId, courseId);

    if (!isComplete) {
      return false;
    }
  }

  return true;
}

/**
 * Check if employee is eligible for certificate after completing a lesson
 * Only applicable for non-learning-path context (learningPathId is null)
 *
 * @param employeeId - The employee ID
 * @param lessonId - The lesson that was just completed
 * @returns Certificate eligibility information
 */
async function checkCertificateEligibility(
  employeeId: string,
  lessonId: string
): Promise<CertificateEligibilityResult[]> {
  try {
    // Step 1: Get the course that contains this lesson
    const lessonData = await coursesLessonsRepository.getCourseByLessonId(lessonId);

    if (!lessonData?.sections) {
      return [];
    }

    const courseId = lessonData.sections.course_id;

    // Step 2: Get all lessons in this course and check completion status
    const courseLessons = await coursesLessonsRepository.getLessonsByCourseId(courseId);

    if (courseLessons.length === 0) {
      return [];
    }

    const lessonIds = courseLessons.map((l) => l.id);

    // Check how many lessons the employee has completed
    const completedLessons = await lessonProgressRepository.getCompletedLessonsForEmployee(
      employeeId,
      lessonIds
    );

    const allLessonsCompleted = completedLessons.length === courseLessons.length;

    if (!allLessonsCompleted) {
      return [];
    }

    // Step 3: Find class rooms that contain this course and employee is assigned to
    const classRoomSessions = await classRoomSessionRepository.getClassRoomsWithCourseAndEmployee(
      courseId,
      employeeId
    );

    if (classRoomSessions.length === 0) {
      return [];
    }

    // Extract unique class rooms with certificate templates
    const classRooms = classRoomSessionRepository.extractClassRoomsFromSessions(classRoomSessions);

    if (classRooms.length === 0) {
      return [];
    }

    // Step 4: Check if all courses in each class room are completed
    const eligibleClassRooms: CertificateEligibilityResult[] = [];

    for (const classRoom of classRooms) {
      const isClassRoomComplete = await isClassRoomFullyCompleted(employeeId, classRoom.classRoomId);

      if (isClassRoomComplete) {
        eligibleClassRooms.push({
          isEligible: true,
          classRoomId: classRoom.classRoomId,
          classRoomTitle: classRoom.classRoomTitle,
          certificateTemplateId: classRoom.certificateTemplateId,
        });
      }
    }

    return eligibleClassRooms;
  } catch (error) {
    console.error("[ClassRoomCompletionService] Error checking certificate eligibility:", error);
    throw error;
  }
}

export { checkCertificateEligibility };

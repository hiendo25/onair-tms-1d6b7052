import type { GetClassRoomBySlugResponse } from "@/repository/class-room";
import type { ClassRoomProgressWithRelations, ProgressResponse } from "@/types/progress.types";

type ClassRoomDetailData = NonNullable<GetClassRoomBySlugResponse["data"]>;

type ClassRoomSession = ClassRoomDetailData["sessions"][number];

type CoursePeriod = NonNullable<ClassRoomSession["courses_period"]>[number];

type CourseWithProgress = CoursePeriod["course"] & {
  progress?: ProgressResponse | null;
};

type CoursePeriodWithProgress = Omit<CoursePeriod, "course"> & {
  course: CourseWithProgress;
};

type ClassRoomSessionWithProgress = Omit<ClassRoomSession, "courses_period"> & {
  progress: ProgressResponse | null;
  courses_period: CoursePeriodWithProgress[];
};

export type ClassRoomDetailWithProgress = Omit<ClassRoomDetailData, "sessions"> & {
  progress: ProgressResponse | null;
  sessions: ClassRoomSessionWithProgress[];
};

const buildCourseProgressMap = (
  progress: ClassRoomProgressWithRelations | null | undefined,
): Map<string, ProgressResponse> => {
  const progressMap = new Map<string, ProgressResponse>();

  if (!progress?.class_sessions?.length) {
    return progressMap;
  }

  progress.class_sessions.forEach((session) => {
    session.courses.forEach((course) => {
      if (!course.entityId) {
        return;
      }
      progressMap.set(course.entityId, course);
    });
  });

  return progressMap;
};

const buildSessionProgressMap = (
  progress: ClassRoomProgressWithRelations | null | undefined,
): Map<string, ProgressResponse> => {
  const progressMap = new Map<string, ProgressResponse>();

  if (!progress?.class_sessions?.length) {
    return progressMap;
  }

  progress.class_sessions.forEach((session) => {
    if (!session.entityId) {
      return;
    }
    progressMap.set(session.entityId, session);
  });

  return progressMap;
};

const buildClassRoomProgress = (
  progress: ClassRoomProgressWithRelations | null | undefined,
): ProgressResponse | null => {
  if (!progress) {
    return null;
  }

  const { class_sessions: _classSessions, ...summary } = progress;
  return summary;
};

export const mapClassRoomCoursesProgress = (
  classRoom: ClassRoomDetailData,
  progress: ClassRoomProgressWithRelations | null | undefined,
): ClassRoomDetailWithProgress => {
  const progressMap = buildCourseProgressMap(progress);
  const sessionProgressMap = buildSessionProgressMap(progress);
  const classRoomProgress = buildClassRoomProgress(progress);

  return {
    ...classRoom,
    progress: classRoomProgress,
    sessions: (classRoom.sessions ?? []).map((session) => {
      const coursesPeriod = session.courses_period ?? [];

      return {
        ...session,
        progress: sessionProgressMap.get(session.id) ?? null,
        courses_period: coursesPeriod.map((coursePeriod) => {
          const course = coursePeriod.course;
          if (!course || !course.id) {
            return coursePeriod as CoursePeriodWithProgress;
          }

          return {
            ...coursePeriod,
            course: {
              ...course,
              progress: progressMap.get(course.id) ?? null,
            },
          };
        }),
      };
    }),
  };
};

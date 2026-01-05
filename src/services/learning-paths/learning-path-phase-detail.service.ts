import { PATHS } from "@/constants/path.constant";
import { ROUTE_QUERY_KEYS, ROUTE_QUERY_VALUES } from "@/constants/route-query.constant";
import {
  CLASSROOM_PROGRESS_STATUS,
  type ClassRoomProgressStatus,
  DEFAULT_COUNT,
  PROGRESS_COMPLETED_PERCENT,
  PROGRESS_EMPTY_PERCENT,
} from "@/modules/learning-paths/learning-path-user.constants";
import type {
  LearningPathPhaseDetailViewData,
  PhaseClassRoomCardItem,
  PhaseClassRoomWithProgress,
  PhaseDetailData,
  PhaseProgressSummary,
  PhaseWithClassRoomsWithProgress,
} from "@/modules/learning-paths/types";
import { learningPathsRepository } from "@/repository";
import {
  buildProgressResponse,
  getClassRoomProgress,
  getPhaseProgress,
} from "@/services/progress/progress.service";
import type { ProgressResponse } from "@/types/progress.types";

const PROGRESS_ENTITY_TYPES = {
  phase: "phase",
  classRoom: "class_room",
} as const;

const EMPTY_PROGRESS = { totalLessons: 0, completedLessons: 0 };

const resolveClassRoomModeKey = (classRoom: PhaseClassRoomWithProgress["class_room"]): string => {
  const sessionType = classRoom.class_sessions?.[0]?.session_type ?? null;
  return (classRoom.room_type ?? sessionType ?? "pending") as string;
};

const resolveSessionCount = (classRoom: PhaseClassRoomWithProgress["class_room"]): number => {
  return classRoom.class_sessions?.length ?? DEFAULT_COUNT;
};

const resolveProgressStatus = (progressPercentage: number): ClassRoomProgressStatus => {
  if (progressPercentage >= PROGRESS_COMPLETED_PERCENT) {
    return CLASSROOM_PROGRESS_STATUS.COMPLETED;
  }

  if (progressPercentage > PROGRESS_EMPTY_PERCENT) {
    return CLASSROOM_PROGRESS_STATUS.IN_PROGRESS;
  }

  return CLASSROOM_PROGRESS_STATUS.NOT_STARTED;
};

const buildClassRoomCardItem = (
  classRoomItem: PhaseClassRoomWithProgress,
  progress: ProgressResponse | null,
): PhaseClassRoomCardItem => {
  const classRoom = classRoomItem.class_room;
  const progressPercentage = progress?.progressPercentage ?? PROGRESS_EMPTY_PERCENT;
  const status = resolveProgressStatus(progressPercentage);
  const modeKey = resolveClassRoomModeKey(classRoom);
  const sessionCount = resolveSessionCount(classRoom);

  return {
    id: classRoom.id,
    title: classRoom.title ?? "Lớp học chưa đặt tên",
    description: classRoom.description,
    modeKey,
    sessionCount,
    progressPercentage,
    status,
    href: classRoom.slug
      ? `${PATHS.CLASSROOMS.DETAIL_CLASSROOM(classRoom.slug)}?${new URLSearchParams({
        [ROUTE_QUERY_KEYS.SOURCE]: ROUTE_QUERY_VALUES.LEARNING_PATH,
      }).toString()}`
      : null,
  };
};

const buildPhaseProgressSummary = (
  phase: PhaseWithClassRoomsWithProgress,
  classRooms: PhaseClassRoomCardItem[],
  phaseProgress: ProgressResponse | null,
): PhaseProgressSummary => {
  const totalClassRooms = phase.phase_class_rooms_count ?? phase.phase_class_rooms?.length ?? DEFAULT_COUNT;
  const completedClassRooms = classRooms.filter(
    (classRoom) => classRoom.status === CLASSROOM_PROGRESS_STATUS.COMPLETED,
  ).length;

  return {
    progressPercentage: phaseProgress?.progressPercentage ?? PROGRESS_EMPTY_PERCENT,
    completedClassRooms,
    totalClassRooms,
  };
};

const buildPhaseDetailData = (
  phase: PhaseWithClassRoomsWithProgress,
  phaseProgress: ProgressResponse | null,
): PhaseDetailData => {
  const classRooms = (phase.phase_class_rooms ?? []).map((classRoomItem) =>
    buildClassRoomCardItem(classRoomItem, classRoomItem.progress),
  );

  return {
    phase,
    classRooms,
    summary: buildPhaseProgressSummary(phase, classRooms, phaseProgress),
  };
};

const buildClassRoomProgress = async (
  classRoomId: string,
  learningPathId: string | null,
  employeeId: string,
): Promise<ProgressResponse> => {
  return getClassRoomProgress(classRoomId, employeeId, learningPathId).then((progress) =>
    buildProgressResponse({
      entityId: classRoomId,
      entityType: PROGRESS_ENTITY_TYPES.classRoom,
      totalLessons: progress.totalLessons,
      completedLessons: progress.completedLessons,
      learningPathId,
      employeeId,
    }),
  );
};

export async function getLearningPathPhaseDetailForEmployee(
  phaseId: string,
  organizationId: string,
  employeeId: string,
): Promise<LearningPathPhaseDetailViewData | null> {
  const phaseDetail = await learningPathsRepository.getLearningPathPhaseDetail(phaseId, organizationId);

  if (!phaseDetail) {
    return null;
  }

  const learningPathId = phaseDetail.learningPath.id ?? null;

  const classRoomIds = (phaseDetail.phase.phase_class_rooms ?? []).map(
    (classRoomItem) => classRoomItem.class_room.id,
  );

  const [phaseProgressRaw, classRoomsProgress] = await Promise.all([
    learningPathId
      ? getPhaseProgress(phaseId, employeeId, learningPathId)
      : Promise.resolve(EMPTY_PROGRESS),
    Promise.all(classRoomIds.map((classRoomId) => buildClassRoomProgress(classRoomId, learningPathId, employeeId))),
  ]);

  const phaseProgress = learningPathId
    ? buildProgressResponse({
      entityId: phaseId,
      entityType: PROGRESS_ENTITY_TYPES.phase,
      totalLessons: phaseProgressRaw.totalLessons,
      completedLessons: phaseProgressRaw.completedLessons,
      learningPathId,
      employeeId,
    })
    : null;

  const classRoomsProgressMap = new Map<string, ProgressResponse>(
    classRoomsProgress.map((progress) => [progress.entityId, progress]),
  );

  return {
    learningPath: phaseDetail.learningPath,
    detailData: buildPhaseDetailData(
      {
        ...phaseDetail.phase,
        phase_class_rooms: (phaseDetail.phase.phase_class_rooms ?? []).map((classRoomItem) => ({
          ...classRoomItem,
          progress: classRoomsProgressMap.get(classRoomItem.class_room.id) ?? null,
        })),
      },
      phaseProgress,
    ),
  };
}

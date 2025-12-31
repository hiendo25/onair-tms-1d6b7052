import { PATHS } from "@/constants/path.constant";
import { ROUTE_QUERY_KEYS, ROUTE_QUERY_VALUES } from "@/constants/route-query.constant";
import type { PhaseClassRoomWithDetails, PhaseWithClassRooms } from "@/repository/learning-paths";
import type { ProgressResponse } from "@/types/progress.types";

import type { PhaseClassRoomCardItem, PhaseDetailData, PhaseProgressSummary } from "./learning-path-phase.types";
import {
  CLASSROOM_PROGRESS_STATUS,
  type ClassRoomProgressStatus,
  DEFAULT_COUNT,
  PROGRESS_COMPLETED_PERCENT,
  PROGRESS_EMPTY_PERCENT,
} from "./learning-path-user.constants";

const CLASSROOM_MODE_LABELS: Record<string, string> = {
  live: "Live",
  online: "Online",
  offline: "Trực tiếp",
  pending: "Chưa xác định",
};

const CLASSROOM_STATUS_LABELS: Record<ClassRoomProgressStatus, string> = {
  [CLASSROOM_PROGRESS_STATUS.COMPLETED]: "Hoàn thành",
  [CLASSROOM_PROGRESS_STATUS.IN_PROGRESS]: "Đang học",
  [CLASSROOM_PROGRESS_STATUS.NOT_STARTED]: "Chưa bắt đầu",
};

const CLASSROOM_STATUS_COLORS: Record<ClassRoomProgressStatus, PhaseClassRoomCardItem["statusColor"]> = {
  [CLASSROOM_PROGRESS_STATUS.COMPLETED]: "success",
  [CLASSROOM_PROGRESS_STATUS.IN_PROGRESS]: "info",
  [CLASSROOM_PROGRESS_STATUS.NOT_STARTED]: "default",
};

const resolveClassRoomMode = (classRoom: PhaseClassRoomWithDetails["class_room"]) => {
  const sessionType = classRoom.class_sessions?.[0]?.session_type ?? null;
  const modeKey = (classRoom.room_type ?? sessionType ?? "pending") as string;

  return {
    modeKey,
    modeLabel: CLASSROOM_MODE_LABELS[modeKey] ?? CLASSROOM_MODE_LABELS.pending,
  };
};

const resolveDurationLabel = (classRoom: PhaseClassRoomWithDetails["class_room"]) => {
  const sessionCount = classRoom.class_sessions?.length ?? DEFAULT_COUNT;

  if (sessionCount === 0) {
    return "Chưa có lịch";
  }

  return `${sessionCount} buổi`;
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
  classRoomItem: PhaseClassRoomWithDetails,
  progress: ProgressResponse | null
): PhaseClassRoomCardItem => {
  const classRoom = classRoomItem.class_room;
  const progressPercentage = progress?.progressPercentage ?? PROGRESS_EMPTY_PERCENT;
  const status = resolveProgressStatus(progressPercentage);
  const { modeKey, modeLabel } = resolveClassRoomMode(classRoom);

  return {
    id: classRoom.id,
    title: classRoom.title ?? "Lớp học chưa đặt tên",
    description: classRoom.description,
    modeKey,
    modeLabel,
    durationLabel: resolveDurationLabel(classRoom),
    progressPercentage,
    status,
    statusLabel: CLASSROOM_STATUS_LABELS[status],
    statusColor: CLASSROOM_STATUS_COLORS[status],
    href: classRoom.slug
      ? `${PATHS.CLASSROOMS.DETAIL_CLASSROOM(classRoom.slug)}?${new URLSearchParams({
          [ROUTE_QUERY_KEYS.SOURCE]: ROUTE_QUERY_VALUES.LEARNING_PATH,
        }).toString()}`
      : null,
  };
};

const buildPhaseProgressSummary = (
  phase: PhaseWithClassRooms,
  classRooms: PhaseClassRoomCardItem[],
  phaseProgress: ProgressResponse | null
): PhaseProgressSummary => {
  const totalClassRooms = phase.phase_class_rooms_count ?? phase.phase_class_rooms?.length ?? DEFAULT_COUNT;
  const completedClassRooms = classRooms.filter(
    (classRoom) => classRoom.status === CLASSROOM_PROGRESS_STATUS.COMPLETED
  ).length;

  return {
    progressPercentage: phaseProgress?.progressPercentage ?? PROGRESS_EMPTY_PERCENT,
    completedClassRooms,
    totalClassRooms,
  };
};

export const buildPhaseDetailData = (
  phase: PhaseWithClassRooms,
  phaseProgress: ProgressResponse | null,
  classRoomsProgress: ProgressResponse[]
): PhaseDetailData => {
  const progressMap = new Map<string, ProgressResponse>(
    classRoomsProgress.map((progress) => [progress.entityId, progress])
  );

  const classRooms = (phase.phase_class_rooms ?? []).map((classRoomItem) =>
    buildClassRoomCardItem(classRoomItem, progressMap.get(classRoomItem.class_room.id) ?? null)
  );

  return {
    phase,
    classRooms,
    summary: buildPhaseProgressSummary(phase, classRooms, phaseProgress),
  };
};

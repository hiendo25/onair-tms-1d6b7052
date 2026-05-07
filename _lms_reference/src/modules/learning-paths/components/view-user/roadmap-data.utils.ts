import { getPhaseLabel } from "@/modules/learning-paths/components/learning-path-detail.utils";
import { PHASE_STATUS } from "../../learning-path-user.constants";
import type { PhaseTimelineItem } from "../../types";

import type { RoadMapItem } from "./roadmap.types";

const EMPTY_DESCRIPTION = "Chưa có mô tả cho giai đoạn này.";

const findLastCompletedIndex = (items: PhaseTimelineItem[]): number => {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (items[index]?.status === PHASE_STATUS.COMPLETED) {
      return index;
    }
  }

  return -1;
};

export const buildRoadMapData = (items: PhaseTimelineItem[]): RoadMapItem[] =>
  items.map((item, index) => ({
    title: getPhaseLabel(item.phase, index),
    content: item.phase.description || EMPTY_DESCRIPTION,
    orderIndex: item.orderIndex ?? index + 1,
    status: item.status,
    progressPercentage: item.progressPercentage,
  }));

export const getCurrentStepIndex = (items: PhaseTimelineItem[]): number => {
  if (items.length === 0) return -1;

  const activeIndex = items.findIndex((item) => item.status === PHASE_STATUS.ACTIVE);
  if (activeIndex >= 0) return activeIndex;

  const allCompleted = items.every((item) => item.status === PHASE_STATUS.COMPLETED);
  if (allCompleted) return items.length;

  return findLastCompletedIndex(items);
};

import type { CSSProperties } from "react";

import { PHASE_STATUS } from "../../learning-path-user.constants";
import {
  ROADMAP_PROGRESS_RING_CIRCUMFERENCE,
  ROADMAP_TEXT,
} from "./roadmap-svg.constants";
import type { RoadMapItemStatus } from "./roadmap.types";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const PILL_TEXT_WIDTH_RATIO = 0.55;
const PROGRESS_MIN = 0;
const PROGRESS_MAX = 100;

export const getPillWidth = (label: string, fontSize: number, padding: number): number => {
  if (!label) return padding * 2;
  const estimatedWidth = label.length * (fontSize * PILL_TEXT_WIDTH_RATIO);
  return Math.max(
    padding * 2,
    Math.min(ROADMAP_TEXT.titlePillMaxWidth, estimatedWidth + padding * 2),
  );
};

export const getProgressRingOffset = (percentage: number): number => {
  const clamped = clamp(percentage, PROGRESS_MIN, PROGRESS_MAX);
  return ROADMAP_PROGRESS_RING_CIRCUMFERENCE - (ROADMAP_PROGRESS_RING_CIRCUMFERENCE * clamped) / 100;
};

export const getCursorStyle = (isEnabled: boolean): CSSProperties => ({
  cursor: isEnabled ? "pointer" : "not-allowed",
});

export const isItemEnabled = (
  status: RoadMapItemStatus | undefined,
  currentStepIndex: number,
  index: number,
): boolean => {
  if (status) return status !== PHASE_STATUS.LOCKED;
  return currentStepIndex >= index;
};

export const resolveItemStatus = (
  status: RoadMapItemStatus | undefined,
  isEnabled: boolean,
): RoadMapItemStatus => status ?? (isEnabled ? PHASE_STATUS.ACTIVE : PHASE_STATUS.LOCKED);

export const isFinishEnabled = (currentStepIndex: number, dataLength: number): boolean =>
  currentStepIndex >= dataLength - 1;

export const isItemLocked = ({
  status,
  currentStepIndex,
  index,
  dataLength,
  isFinished,
}: {
  status?: RoadMapItemStatus;
  currentStepIndex: number;
  index: number;
  dataLength: number;
  isFinished?: boolean;
}): boolean => {
  if (isFinished) return !isFinishEnabled(currentStepIndex, dataLength);
  if (status) return status === PHASE_STATUS.LOCKED;
  return currentStepIndex < index;
};

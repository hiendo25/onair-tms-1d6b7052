import dayjs from "dayjs";

import { DAY_OFF_WEEK_OPTIONS } from "@/constants/date-time";
import { FORMAT_TIME } from "@/lib";
import { DayOfWeek } from "@/model/enum-type.model";
import { CLASSROOM_DETAIL_TEXT } from "../_constants";

type WeeklyScheduleTime = {
  day?: DayOfWeek | null;
  time?: string | null;
};

export type WeeklyScheduleLike = {
  from?: WeeklyScheduleTime | null;
  to?: WeeklyScheduleTime | null;
};

export type DateRangeDisplay = {
  isSameDay: boolean;
  rangeLabel: string;
  timeRangeLabel?: string;
  dateLabel?: string;
  startLabel?: string;
  endLabel?: string;
};

export type ScheduleDisplay = {
  type: "weekly" | "same-day" | "multi-day" | "unknown";
  primaryLabel: string;
  secondaryLabel?: string;
  dateRange?: DateRangeDisplay;
};

const DAY_LABEL_MAP = new Map<DayOfWeek, string>(
  DAY_OFF_WEEK_OPTIONS.map((item) => [item.value, item.label]),
);

const formatDayLabel = (day?: DayOfWeek | null): string | null => {
  if (!day) {
    return null;
  }

  return DAY_LABEL_MAP.get(day) ?? null;
};

const formatTimeValue = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const parsedTime = dayjs(value);
  if (!parsedTime.isValid()) {
    return null;
  }

  return parsedTime.format(FORMAT_TIME);
};

const coerceWeeklySchedule = (weeklySchedule?: WeeklyScheduleLike | null | unknown): WeeklyScheduleLike | null => {
  if (!weeklySchedule || typeof weeklySchedule !== "object" || Array.isArray(weeklySchedule)) {
    return null;
  }

  return weeklySchedule as WeeklyScheduleLike;
};

export const formatWeeklyScheduleLabel = (
  weeklySchedule?: WeeklyScheduleLike | null | unknown,
): string | null => {
  const normalizedSchedule = coerceWeeklySchedule(weeklySchedule);
  if (!normalizedSchedule?.from || !normalizedSchedule?.to) {
    return null;
  }

  const fromDayLabel = formatDayLabel(normalizedSchedule.from.day);
  const toDayLabel = formatDayLabel(normalizedSchedule.to.day);
  const fromTime = formatTimeValue(normalizedSchedule.from.time);
  const toTime = formatTimeValue(normalizedSchedule.to.time);

  if (!fromDayLabel || !toDayLabel || !fromTime || !toTime) {
    return null;
  }

  if (fromDayLabel === toDayLabel) {
    return `${fromDayLabel}, ${fromTime} - ${toTime}`;
  }

  return `${fromDayLabel}, ${fromTime} - ${toDayLabel}, ${toTime}`;
};

export const getDateRangeDisplay = (params: {
  startAt?: string | null;
  endAt?: string | null;
  sameDayDateFormat: string;
  dateTimeFormat: string;
  timeFormat?: string;
}): DateRangeDisplay | null => {
  const { startAt, endAt, sameDayDateFormat, dateTimeFormat, timeFormat = FORMAT_TIME } = params;

  if (!startAt || !endAt) {
    return null;
  }

  const startDate = dayjs(startAt);
  const endDate = dayjs(endAt);

  if (!startDate.isValid() || !endDate.isValid()) {
    return null;
  }

  const isSameDay = startDate.isSame(endDate, "day");

  if (isSameDay) {
    const timeRangeLabel = `${startDate.format(timeFormat)} - ${endDate.format(timeFormat)}`;
    const dateLabel = startDate.format(sameDayDateFormat);

    return {
      isSameDay,
      rangeLabel: `${timeRangeLabel}, ${dateLabel}`,
      timeRangeLabel,
      dateLabel,
    };
  }

  const startLabel = startDate.format(dateTimeFormat);
  const endLabel = endDate.format(dateTimeFormat);

  return {
    isSameDay,
    rangeLabel: `${startLabel} - ${endLabel}`,
    startLabel,
    endLabel,
  };
};

export const buildScheduleDisplay = (params: {
  startAt?: string | null;
  endAt?: string | null;
  weeklySchedule?: WeeklyScheduleLike | null | unknown;
  isFromLearningPath?: boolean;
  sameDayDateFormat: string;
  dateTimeFormat: string;
  timeFormat?: string;
}): ScheduleDisplay => {
  const {
    startAt,
    endAt,
    weeklySchedule,
    isFromLearningPath,
    sameDayDateFormat,
    dateTimeFormat,
    timeFormat,
  } = params;

  const weeklyLabel = isFromLearningPath ? formatWeeklyScheduleLabel(weeklySchedule) : null;

  if (weeklyLabel) {
    return {
      type: "weekly",
      primaryLabel: weeklyLabel,
      secondaryLabel: CLASSROOM_DETAIL_TEXT.WEEKLY_LABEL,
    };
  }

  const dateRange = getDateRangeDisplay({
    startAt,
    endAt,
    sameDayDateFormat,
    dateTimeFormat,
    timeFormat,
  });

  if (!dateRange) {
    return {
      type: "unknown",
      primaryLabel: CLASSROOM_DETAIL_TEXT.SCHEDULE_FALLBACK,
    };
  }

  if (dateRange.isSameDay) {
    return {
      type: "same-day",
      primaryLabel: dateRange.timeRangeLabel ?? dateRange.rangeLabel,
      secondaryLabel: dateRange.dateLabel,
      dateRange,
    };
  }

  return {
    type: "multi-day",
    primaryLabel: dateRange.rangeLabel,
    dateRange,
  };
};

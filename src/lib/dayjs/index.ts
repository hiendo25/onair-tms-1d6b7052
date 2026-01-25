 
import "dayjs/locale/vi";

import type { Dayjs, OpUnitType } from "dayjs";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import timezonePlugin from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import round from "./plugin/round";

dayjs.extend(utc);
dayjs.extend(timezonePlugin);
dayjs.extend(isSameOrBefore);
dayjs.extend(advancedFormat);

dayjs.extend(isSameOrAfter);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(duration);
dayjs.extend(round);

export const TIME_ZONE = "Asia/Ho_Chi_Minh";
export const FORMAT_DATE_TIME = "HH:mm dddd, D MMMM, YYYY";
export const FORMAT_DATE_TIME_SHORTER = "HH:mm, D MMMM, YYYY";
export const FORMAT_DATE_TIME_CLEANER = "HH:mm | DD/MM/YYYY";
export const FORMAT_TIME = "HH:mm";
export const FORMAT_DATE = "D MMMM, YYYY";
export const FORMAT_DATE_STANDARD = "DD/MM/YYYY";
export const FORMAT_DATE_STANDARD_WITHOUT_YEAR = "DD/MM";
export const FORMAT_DATE_QUERY = "YYYY-MM-DD";
export const FORMAT_DATE_WITHOUT_YEAR = "D MMMM";
export const FORMAT_DATE_DAY = "dddd, D MMMM, YYYY";
export const FORMAT_DATE_DAY_WITHOUT_YEAR = "dddd, D MMMM";
export const FORMAT_DATE_LABEL = "dddd, DD [tháng] MM, YYYY";
export const FORMAT_DATE_LABEL_WITHOUT_YEAR = "dddd, DD [tháng] MM";
export const FORMAT_DATE_LABEL_WITHOUT_HUMAN_DAY_AND_YEAR = "DD [tháng] MM";
export const FORMAT_DATE_LOCALIZE = "D [tháng] M, YYYY";
export const FORMAT_DURATION = "H [giờ] m [phút]";

export const FORMAT_DATE_TIME_EVENT_ITEM = "[Th] d, DD [thg] MM | HH:mm";
export const FORMAT_DATE_PUBLISHED_ACADEMY_BLOG_POST = "DD [Thg] MM, YYYY";

dayjs.tz.setDefault(TIME_ZONE);
dayjs.locale("vi");

export type DatePickerFormat =
  | Dayjs
  | Date
  | string
  | number
  | null
  | undefined;

/**
 * Docs: https://day.js.org/docs/en/display/format
 */
export const formatStr = {
  dateTime: FORMAT_DATE_TIME,
  date: FORMAT_DATE,
  time: FORMAT_TIME,
  split: {
    dateTime: "DD/MM/YYYY HH:mm", // 17/04/2022 12:00 am
    date: "DD/MM/YYYY", // 17/04/2022
  },
  paramCase: {
    dateTime: "DD-MM-YYYY HH:mm", // 17-04-2022 12:00 am
    date: "DD-MM-YYYY", // 17-04-2022
  },
};

export function today(format?: string) {
  return dayjs(new Date()).startOf("day").format(format);
}

// ----------------------------------------------------------------------

export const getDiff = (
  start?: string | Date | null,
  end?: string | Date | null,
) => {
  const startDate = start ? dayjs(start) : dayjs();
  const endDate = end ? dayjs(end) : dayjs();

  let months = Math.abs(endDate.diff(startDate, "months"));
  const days = Math.abs(endDate.diff(startDate, "days"));

  if (!(months > 0)) {
    return `${days} ngày`;
  }

  const years = Math.floor(months / 12);
  months -= years * 12;

  const re =
    (years > 0 ? `${years} năm` : "") + (months > 0 ? ` ${months} tháng` : "");

  if (re) {
    return re;
  }

  return `${days} ngày`;
};

export const mergeDateFormat = (
  start?: string | Date | null,
  end?: string | Date | null,
) => {
  const startDate = start ? dayjs(start) : dayjs();
  const endDate = end ? dayjs(end) : dayjs();

  const isSameDay = endDate.isSame(startDate, "day");
  // const isSameMonth = endDate.isSame(startDate, 'month');
  const isSameYear = endDate.isSame(startDate, "year");

  if (isSameDay) {
    return `${startDate.format(FORMAT_TIME)} - ${endDate.format(
      FORMAT_TIME + " | D MMMM, YYYY",
    )}`;
  }
  // if (isSameMonth) {
  // 	return `${startDate.format(FORMAT_TIME + ', DD')} - ${endDate.format(FORMAT_TIME + ', D MMMM, YYYY')}`;
  // }
  if (isSameYear) {
    return `${startDate.format(FORMAT_TIME + ", DD MMMM")} - ${endDate.format(
      FORMAT_TIME + ", D MMMM, YYYY",
    )}`;
  }

  return `${startDate.format(
    FORMAT_TIME + ", D MMMM, YYYY",
  )} - ${endDate.format(FORMAT_TIME + ", D MMMM, YYYY")}`;
};

/** output: 17 Apr 2022 12:00 am
 */
export function fDateTime(date: DatePickerFormat, format?: string) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid
    ? dayjs(date).format(format ?? formatStr.dateTime)
    : "Invalid time value";
}

// ----------------------------------------------------------------------

/** output: 17 Apr 2022
 */
export function fDate(date: DatePickerFormat, format?: string) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid
    ? dayjs(date).format(format ?? formatStr.date)
    : "Invalid time value";
}

// ----------------------------------------------------------------------

/** output: 12:00 am
 */
export function fTime(date: DatePickerFormat, format?: string) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid
    ? dayjs(date).format(format ?? formatStr.time)
    : "Invalid time value";
}

// ----------------------------------------------------------------------

/** output: 1713250100
 */
export function fTimestamp(date: DatePickerFormat) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).valueOf() : "Invalid time value";
}

// ----------------------------------------------------------------------

/** output: a few seconds, 2 years
 */
export function fToNow(date: DatePickerFormat) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).toNow(true) : "Invalid time value";
}

// ----------------------------------------------------------------------

/** output: boolean
 */
export function fIsBetween(
  inputDate: DatePickerFormat,
  startDate: DatePickerFormat,
  endDate: DatePickerFormat,
) {
  if (!inputDate || !startDate || !endDate) {
    return false;
  }

  const formattedInputDate = fTimestamp(inputDate);
  const formattedStartDate = fTimestamp(startDate);
  const formattedEndDate = fTimestamp(endDate);

  if (formattedInputDate && formattedStartDate && formattedEndDate) {
    return (
      formattedInputDate >= formattedStartDate &&
      formattedInputDate <= formattedEndDate
    );
  }

  return false;
}

// ----------------------------------------------------------------------

/** output: boolean
 */
export function fIsAfter(
  startDate: DatePickerFormat,
  endDate: DatePickerFormat,
) {
  return dayjs(startDate).isAfter(endDate);
}

// ----------------------------------------------------------------------

/** output: boolean
 */
export function fIsSame(
  startDate: DatePickerFormat,
  endDate: DatePickerFormat,
  units?: OpUnitType,
) {
  if (!startDate || !endDate) {
    return false;
  }

  const isValid = dayjs(startDate).isValid() && dayjs(endDate).isValid();

  if (!isValid) {
    return "Invalid time value";
  }

  return dayjs(startDate).isSame(endDate, units ?? "year");
}

// ----------------------------------------------------------------------

/** output:
 * Same day: 26 Apr 2024
 * Same month: 25 - 26 Apr 2024
 * Same month: 25 - 26 Apr 2024
 * Same year: 25 Apr - 26 May 2024
 */
export function fDateRangeShortLabel(
  startDate: DatePickerFormat,
  endDate: DatePickerFormat,
  initial?: boolean,
) {
  const isValid = dayjs(startDate).isValid() && dayjs(endDate).isValid();

  const isAfter = fIsAfter(startDate, endDate);

  if (!isValid || isAfter) {
    return "Invalid time value";
  }

  let label = `${fDate(startDate)} - ${fDate(endDate)}`;

  if (initial) {
    return label;
  }

  const isSameYear = fIsSame(startDate, endDate, "year");
  const isSameMonth = fIsSame(startDate, endDate, "month");
  const isSameDay = fIsSame(startDate, endDate, "day");

  if (isSameYear && !isSameMonth) {
    label = `${fDate(startDate, "DD MMM")} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && !isSameDay) {
    label = `${fDate(startDate, "DD")} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && isSameDay) {
    label = `${fDate(endDate)}`;
  }

  return label;
}

// ----------------------------------------------------------------------

export interface DurationProps {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

/** output: '2024-05-28T05:55:31+00:00'
 */
export function fAdd({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}: DurationProps) {
  const result = dayjs()
    .add(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      }),
    )
    .format();

  return result;
}

/** output: '2024-05-28T05:55:31+00:00'
 */
export function fSub({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}: DurationProps) {
  const result = dayjs()
    .subtract(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      }),
    )
    .format();

  return result;
}

export const areDateRangesOverlapping = (
  [_startA, _endA]: [dayjs.ConfigType, dayjs.ConfigType],
  [_startB, _endB]: [dayjs.ConfigType, dayjs.ConfigType],
) => {
  const startA = dayjs(_startA);
  const endA = dayjs(_endA);
  const startB = dayjs(_startB);
  const endB = dayjs(_endB);

  return startA.isSameOrBefore(endB) && endA.isSameOrAfter(startB);
};

export default dayjs;

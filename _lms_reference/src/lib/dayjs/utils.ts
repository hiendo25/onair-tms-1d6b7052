import { Dayjs } from "dayjs";

import dayjs from "./index";

export const DATE_TIME_FORMATS = {
  // time only
  timeOnly: "HH:mm",

  // common date
  isoDate: "YYYY-MM-DD",
  shortDate: "DD/MM",
  shortDateYear: "DD/MM/YYYY",
  longDate: "D MMMM, YYYY",
  longDateWithWeekday: "dddd, D MMMM, YYYY",
  longDateWeekdayOnly: "dddd, D MMMM",

  // date + time
  timeDateLong: "HH:mm, D MMMM, YYYY",
  timeDateWeekday: "HH:mm dddd, D MMMM, YYYY",
  timeDateShort: "HH:mm | DD/MM/YYYY",

  // vietnamese localized
  dateMonthVietnamese: "DD [tháng] MM",
  dateMonthYearVietnamese: "D [tháng] M, YYYY",
  weekdayDateMonthVietnamese: "dddd, DD [tháng] MM",
  weekdayDateMonthYearVietnamese: "dddd, DD [tháng] MM, YYYY",
  timeVietnamese: "H [giờ] m [phút]",

  // compact / UI card
  weekdayShortDateTime: "[Th] d, DD [thg] MM | HH:mm",
  monthYearVietnamese: "DD [Thg] MM, YYYY",
} as const;

/**
 * @deprecated Use DATE_TIME_FORMATS.timeDateWeekday instead
 */
export const FORMAT_DATE_TIME = "HH:mm dddd, D MMMM, YYYY";
/**
 * @deprecated Use DATE_TIME_FORMATS.timeDateLong instead
 */
export const FORMAT_DATE_TIME_SHORTER = "HH:mm, D MMMM, YYYY";
/**
 * @deprecated Use DATE_TIME_FORMATS.timeDateShort instead
 */
export const FORMAT_DATE_TIME_CLEANER = "HH:mm | DD/MM/YYYY";
/**
 * @deprecated Use DATE_TIME_FORMATS.timeOnly instead
 */
export const FORMAT_TIME = "HH:mm";
/**
 * @deprecated Use DATE_TIME_FORMATS.longDate instead
 */
export const FORMAT_DATE = "D MMMM, YYYY";
/**
 * @deprecated Use DATE_TIME_FORMATS.shortDateYear instead
 */
export const FORMAT_DATE_STANDARD = "DD/MM/YYYY";
/**
 * @deprecated Use DATE_TIME_FORMATS.shortDate instead
 */
export const FORMAT_DATE_STANDARD_WITHOUT_YEAR = "DD/MM";

/**
 * @deprecated Use DATE_TIME_FORMATS.longDateWithWeekday instead
 */
export const FORMAT_DATE_DAY = "dddd, D MMMM, YYYY";

/**
 * @deprecated Use DATE_TIME_FORMATS.weekdayDateMonthYearVietnamese instead
 */
export const FORMAT_DATE_LABEL = "dddd, DD [tháng] MM, YYYY";

/**
 * @deprecated Use DATE_TIME_FORMATS.weekdayDateMonthVietnamese instead
 */
export const FORMAT_DATE_LABEL_WITHOUT_YEAR = "dddd, DD [tháng] MM";

/**
 * @deprecated Use DATE_TIME_FORMATS.dateMonthVietnamese instead
 */
export const FORMAT_DATE_LABEL_WITHOUT_HUMAN_DAY_AND_YEAR = "DD [tháng] MM";

export type DatePickerFormat = Dayjs | Date | string | number | null | undefined;

/**
 * Docs: https://day.js.org/docs/en/display/format
 */
export const formatStr = {
  dateTime: DATE_TIME_FORMATS["timeDateWeekday"],
  date: DATE_TIME_FORMATS["longDate"],
  time: DATE_TIME_FORMATS["timeOnly"],
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

export const getDiff = (start?: string | Date | null, end?: string | Date | null) => {
  const startDate = start ? dayjs(start) : dayjs();
  const endDate = end ? dayjs(end) : dayjs();

  let months = Math.abs(endDate.diff(startDate, "months"));
  const days = Math.abs(endDate.diff(startDate, "days"));

  if (!(months > 0)) {
    return `${days} ngày`;
  }

  const years = Math.floor(months / 12);
  months -= years * 12;

  const re = (years > 0 ? `${years} năm` : "") + (months > 0 ? ` ${months} tháng` : "");

  if (re) {
    return re;
  }

  return `${days} ngày`;
};

export const mergeDateFormat = (start?: string | Date | null, end?: string | Date | null) => {
  const startDate = start ? dayjs(start) : dayjs();
  const endDate = end ? dayjs(end) : dayjs();

  const isSameDay = endDate.isSame(startDate, "day");
  // const isSameMonth = endDate.isSame(startDate, 'month');
  const isSameYear = endDate.isSame(startDate, "year");

  if (isSameDay) {
    return `${startDate.format(FORMAT_TIME)} - ${endDate.format(FORMAT_TIME + " | D MMMM, YYYY")}`;
  }
  // if (isSameMonth) {
  // 	return `${startDate.format(FORMAT_TIME + ', DD')} - ${endDate.format(FORMAT_TIME + ', D MMMM, YYYY')}`;
  // }
  if (isSameYear) {
    return `${startDate.format(FORMAT_TIME + ", DD MMMM")} - ${endDate.format(FORMAT_TIME + ", D MMMM, YYYY")}`;
  }

  return `${startDate.format(FORMAT_TIME + ", D MMMM, YYYY")} - ${endDate.format(FORMAT_TIME + ", D MMMM, YYYY")}`;
};

/** output: 17 Apr 2022 12:00 am
 */
export function fDateTime(date: DatePickerFormat, format?: string) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).format(format ?? formatStr.dateTime) : "Invalid time value";
}

// ----------------------------------------------------------------------

/** output: 17 Apr 2022
 */
export function fDate(date: DatePickerFormat, format?: string) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).format(format ?? formatStr.date) : "Invalid time value";
}

// ----------------------------------------------------------------------

/** output: 12:00 am
 */
export function fTime(date: DatePickerFormat, format?: string) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).format(format ?? formatStr.time) : "Invalid time value";
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

/** output: boolean
 */
export function fIsBetween(inputDate: DatePickerFormat, startDate: DatePickerFormat, endDate: DatePickerFormat) {
  if (!inputDate || !startDate || !endDate) {
    return false;
  }

  const formattedInputDate = fTimestamp(inputDate);
  const formattedStartDate = fTimestamp(startDate);
  const formattedEndDate = fTimestamp(endDate);

  if (formattedInputDate && formattedStartDate && formattedEndDate) {
    return formattedInputDate >= formattedStartDate && formattedInputDate <= formattedEndDate;
  }

  return false;
}

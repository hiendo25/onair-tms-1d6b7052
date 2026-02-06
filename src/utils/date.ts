interface ParseDateInputOptions {
  endOfDay?: boolean;
}

const parseDateInput = (value: string, options?: ParseDateInputOptions): Date | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const isoCandidate = new Date(trimmed);
  if (!Number.isNaN(isoCandidate.getTime())) {
    const baseDate = new Date(
      isoCandidate.getFullYear(),
      isoCandidate.getMonth(),
      isoCandidate.getDate(),
    );
    return applyTime(baseDate, options?.endOfDay);
  }

  const parts = trimmed.split("/");
  if (parts.length !== 3) {
    return null;
  }

  const [dayText, monthText, yearText] = parts;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return null;
  }

  const baseDate = new Date(year, month - 1, day);
  if (
    baseDate.getFullYear() !== year ||
    baseDate.getMonth() !== month - 1 ||
    baseDate.getDate() !== day
  ) {
    return null;
  }

  return applyTime(baseDate, options?.endOfDay);
};

const parseDateTimeInput = (value: string): Date | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const isoCandidate = new Date(trimmed);
  if (!Number.isNaN(isoCandidate.getTime())) {
    return isoCandidate;
  }

  return parseDateInput(trimmed);
};

const parseDateRange = (startDate: string, endDate: string) => {
  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate, { endOfDay: true });

  if (!start || !end) {
    return null;
  }

  return { start, end };
};

const parseDateTimeRange = (startDate: string, endDate: string) => {
  const start = parseDateTimeInput(startDate);
  const end = parseDateTimeInput(endDate);

  if (!start || !end) {
    return null;
  }

  return { start, end };
};

const applyTime = (value: Date, endOfDay?: boolean) => {
  if (endOfDay) {
    value.setHours(23, 59, 59, 999);
    return value;
  }

  value.setHours(0, 0, 0, 0);
  return value;
};

export { parseDateInput, parseDateRange, parseDateTimeInput, parseDateTimeRange };

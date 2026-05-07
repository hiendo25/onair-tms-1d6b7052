import { DayOfWeek } from "@/model/enum-type.model";

const DAY_OFF_WEEK_OPTIONS: { value: DayOfWeek; label: string; index: number }[] = [
  { label: "Thứ Hai", value: "monday", index: 0 },
  { label: "Thứ Ba", value: "tuesday", index: 1 },
  { label: "Thứ Tư", value: "wednesday", index: 2 },
  { label: "Thứ Năm", value: "thursday", index: 3 },
  { label: "Thứ Sáu", value: "friday", index: 4 },
  { label: "Thứ Bảy", value: "saturday", index: 5 },
  { label: "Chủ Nhật", value: "sunday", index: 6 },
];

export { DAY_OFF_WEEK_OPTIONS };

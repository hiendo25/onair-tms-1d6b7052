import { fDateTime, FORMAT_DATE_TIME_CLEANER } from "@/lib";
import { Course } from "@/modules/plans/plan-form.schema";

import { PlanStatus } from "@/model/plan.model";
import { Dayjs } from "dayjs";

export type StatTone = "default" | "success" | "warning" | "error";

export const formatDateRange = (startDate?: string | Dayjs | null, endDate?: string | Dayjs | null) => {
  if (!startDate || !endDate) return null;

  return `${fDateTime(startDate, FORMAT_DATE_TIME_CLEANER)} - ${fDateTime(endDate, FORMAT_DATE_TIME_CLEANER)}`
};

export const getStatusLabel = (status: PlanStatus): string => {
  switch (status) {
    case "pending":
      return "Chờ duyệt";
    case "pending_survey":
      return "Chờ khảo sát";
    case "approved":
      return "Đã duyệt";
    case "rejected":
      return "Từ chối";
    default:
      return status;
  }
};

export const getStatusColor = (status: PlanStatus): "warning" | "success" | "error" => {
  switch (status) {
    case "pending":
    case "pending_survey":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "error";
    default:
      return "warning";
  }
};

export const getTone = (tone: StatTone = "default") => {
  switch (tone) {
    case "success":
      return { bg: "success.50", text: "success.dark" };
    case "warning":
      return { bg: "warning.50", text: "warning.dark" };
    case "error":
      return { bg: "error.50", text: "error.dark" };
    default:
      return { bg: "grey.50", text: "text.primary" };
  }
};

export const renderCourseTags = (value: Course[]) => {
  if (!value || value.length === 0) return null;
  if (value.length === 1) return value[0]?.title || "";
  if (value.length === 2) return `${value[0]?.title || ""}, ${value[1]?.title || ""}`;
  return `${value[0]?.title || ""}, ${value[1]?.title || ""} +${value.length - 2}`;
};

export * from "./survey";

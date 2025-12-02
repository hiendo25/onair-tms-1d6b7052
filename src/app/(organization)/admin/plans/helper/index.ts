import { fDateTime, FORMAT_DATE_TIME_CLEANER } from "@/lib";
import { PlanStatus } from "@/model/plan.model";
import { Dayjs } from "dayjs";

export const formatDateRange = (startDate?: string | Dayjs | null, endDate?: string | Dayjs | null) => {
  if (!startDate || !endDate) return null;

  return `${fDateTime(startDate, FORMAT_DATE_TIME_CLEANER)} - ${fDateTime(endDate, FORMAT_DATE_TIME_CLEANER)}`
};

export const getStatusLabel = (status: PlanStatus): string => {
  switch (status) {
    case "pending":
      return "Chờ duyệt";
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
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "error";
    default:
      return "warning";
  }
};
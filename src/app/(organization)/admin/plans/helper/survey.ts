import dayjs from "dayjs";
import { PlanStatus } from "@/model/plan.model";
import { PlanSurveyTarget, Survey } from "@/modules/plans/plan-form.schema";

export const formatSurveyDateTime = (value?: string | null, fallback = "Chưa đặt") => {
  if (!value) return fallback;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY HH:mm") : fallback;
};

export const formatSurveyDate = (value?: string | null, fallback = "—") => {
  if (!value) return fallback;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : fallback;
};

export const getSurveyStatusLabel = (status?: Survey["status"]) => {
  switch (status) {
    case "pending":
      return "Chờ khảo sát";
    case "collecting":
      return "Đang khảo sát";
    case "closed":
      return "Đã hoàn thành";
    default:
      return "Chưa khởi tạo";
  }
};

export const getSurveyStatusTone = (status?: Survey["status"]) => {
  switch (status) {
    case "closed":
      return { color: "success", variant: "outlined" as const };
    case "collecting":
      return { color: "warning", variant: "outlined" as const };
    case "pending":
      return { color: "default", variant: "outlined" as const };
    default:
      return { color: "default", variant: "outlined" as const };
  }
};

export const getSurveyTargetLabel = (targetType?: PlanSurveyTarget) => {
  switch (targetType) {
    case "branch":
      return "Theo chi nhánh";
    case "department":
      return "Theo phòng ban";
    default:
      return "Tất cả";
  }
};

export const isSurveyLocked = (planStatus?: PlanStatus, survey?: Survey) => {
  if (!survey) return false;
  const isPendingSurvey = planStatus === "pending_survey";
  const surveyNotClosed = survey.status !== "closed";
  return isPendingSurvey || surveyNotClosed;
};

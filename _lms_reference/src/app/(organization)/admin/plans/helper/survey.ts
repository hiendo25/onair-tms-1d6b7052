import { PlanStatus } from "@/model/plan.model";
import { PlanSurveyTarget, Survey } from "@/modules/plans/plan-form.schema";
import { getPlanSurveyAccess } from "@/modules/plans/survey-access";

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
  return getPlanSurveyAccess(planStatus, survey).shouldLock;
};

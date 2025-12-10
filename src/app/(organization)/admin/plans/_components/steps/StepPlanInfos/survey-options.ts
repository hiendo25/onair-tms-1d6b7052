import { PlanSurveyTarget } from "@/modules/plans/plan-form.schema";

export interface UnitOption {
  id: string;
  name: string;
  type?: "branch" | "department";
}

export const SURVEY_TARGET_OPTIONS: { value: PlanSurveyTarget; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "department", label: "Theo phòng ban" },
  { value: "branch", label: "Theo chi nhánh" },
];

import { Survey } from "@/model/survey";

export type CreateSurveyPayload = Pick<
  Survey,
  "description" | "organization_id" | "survey_type" | "title" | "created_by" | "slug"
>;

export type UpdateSurveyPayload = Pick<Survey, "id" | "description" | "survey_type" | "title" | "created_by" | "slug">;

export type UpsertSurveyPayload =
  | {
      action: "create";
      payload: CreateSurveyPayload;
    }
  | {
      action: "update";
      payload: UpdateSurveyPayload;
    };

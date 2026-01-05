import { Level } from "@/model/level.model";
export type CreateLevelPayload = Pick<
  Level,
  "description" | "icon" | "score_required" | "title" | "organization_id" | "created_by"
>;
export type UpdateLevelPayload = Pick<Level, "id" | "description" | "icon" | "score_required" | "title">;
export type UpdateStatusLevelPayload = Pick<Level, "id" | "status">;

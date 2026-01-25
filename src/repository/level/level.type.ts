import { Level } from "@/model/level.model";
export type LevelInsert = Pick<
  Level,
  "description" | "icon" | "score_required" | "title" | "organization_id" | "created_by"
>;
export type LevelUpdate = Pick<Level, "id" | "description" | "icon" | "score_required" | "title">;
export type LevelStatusUpdate = Pick<Level, "id" | "status">;

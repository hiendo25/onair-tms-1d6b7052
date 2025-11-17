import { Section } from "@/model/section.model";

export type CreateSectionPayload = Pick<Section, "title" | "description" | "course_id" | "priority" | "status">;

export type UpdateSectionPayload = Pick<Section, "title" | "description" | "priority" | "status" | "id">;
export type UpsertSectionPayload =
  | {
      action: "create";
      payload: CreateSectionPayload;
    }
  | {
      action: "update";
      payload: UpdateSectionPayload;
    };

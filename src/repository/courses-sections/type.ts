import { Section } from "@/model/section.model";

export type SectionInsert = Pick<Section, "title" | "description" | "course_id" | "priority" | "status">;

export type SectionUpdate = Pick<Section, "title" | "description" | "priority" | "status" | "id">;
export type SectionUpsert =
  | {
      action: "create";
      payload: SectionInsert;
    }
  | {
      action: "update";
      payload: SectionUpdate;
    };

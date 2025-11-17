import { Section } from "@/model/section.model";

export type CreateSectionPayload = Pick<Section, "title" | "description" | "course_id" | "priority" | "status">;

export type UpdateSectionPayload = Pick<Section, "title" | "description" | "course_id" | "priority" | "status" | "id">;

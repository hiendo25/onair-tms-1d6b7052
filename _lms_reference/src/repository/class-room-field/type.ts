import { ClassField } from "@/model/class-field.model";

export type CreateClassFieldPayload = Pick<ClassField, "thumbnail_url" | "name" | "slug" | "description">;

export type UpdateClassFieldPayload = Pick<ClassField, "thumbnail_url" | "name" | "slug" | "description" | "id">;

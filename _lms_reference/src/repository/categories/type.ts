import { Categories } from "@/model/categories.model";

export type CreateCategoryPayload = Pick<Categories, "thumbnail_url" | "name" | "slug" | "description">;

export type UpdateCategoryPayload = Pick<Categories, "thumbnail_url" | "name" | "slug" | "description" | "id">;

import { UserPreferences } from "@/model/user-preferences";

export type UpdateUserPreferencePayload = Pick<UserPreferences, "user_id" | "default_organization_id" | "id">;
export type UpsertUserPreferencePayload = UpdateUserPreferencePayload | CreateUserPreferencePayload;
export type CreateUserPreferencePayload = Pick<UserPreferences, "user_id" | "default_organization_id">;

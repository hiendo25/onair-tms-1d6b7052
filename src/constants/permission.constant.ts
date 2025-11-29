import { Constants, Database } from "@/types/supabase.types";
import { createEnum } from "@/utils";
type BuildPermission<R extends string, A extends string> = `${R}:${A}`;

export const PermissionActions = createEnum(Constants.public.Enums.action_code_enum);
export type TPermissionActions = Database["public"]["Enums"]["action_code_enum"];
import { PermissionActions as PerActions } from "@/model/permission.model";

export type Resources = keyof typeof RESOURCES;
export const RESOURCES = {
  classroom: "classroom",
  department: "department",
} as const;

export type Permission = BuildPermission<Resources, TPermissionActions>;
export type ResourcePermission = ({ resource: Resources; action: PerActions } | { $or: ResourcePermission })[];
export function buildPermission<R extends string, A extends string>(resource: R, action: A): BuildPermission<R, A> {
  return `${resource}:${action}` as BuildPermission<R, A>;
}

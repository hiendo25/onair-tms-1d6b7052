import { PermissionActions as PerActions } from "@/model/permission.model";
type BuildPermission<R extends string, A extends string> = `${R}:${A}`;

export type Resources = keyof typeof RESOURCES;

export const RESOURCES = {
  classroom: "classroom",
  employee: "employee",
  department: "department",
  course: "course",
  assignment: "assignment",
} as const;

export type Permissions = BuildPermission<Resources, PerActions>;
export type ResourcesActions = ({ resource: Resources; action: PerActions } | { $or: ResourcesActions })[];
export type PermissionsCheck = (Permissions | { $or: Permissions })[];
export function buildPermission<R extends string, A extends string>(resource: R, action: A): BuildPermission<R, A> {
  return `${resource}:${action}` as BuildPermission<R, A>;
}

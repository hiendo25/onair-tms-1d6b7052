//  import { Constants, Database } from "@/types/supabase.types";
// import { createEnum } from "@/utils";

// export const PermissionActions = createEnum(Constants.public.Enums.action_code_enum);
// export type TPermissionActions = Database["public"]["Enums"]["action_code_enum"];

import { PermissionActions as PerActions } from "@/model/permission.model";
type BuildPermission<R extends string, A extends string> = `${R}:${A}`;

export type Resources = keyof typeof RESOURCES;

export const RESOURCES = {
  classroom: "classroom",
  employee: "employee",
  department: "department",
  course: "course",
  assignment: "assignment",
  role: "roles",
} as const;

export type Permissions = BuildPermission<Resources, PerActions>;
export type ResourcesActions = ({ resource: Resources; action: PerActions } | { $or: ResourcesActions })[];
export type PermissionsCheck = (Permissions | { $or: Permissions })[];
export function buildPermission<R extends string, A extends string>(resource: R, action: A): BuildPermission<R, A> {
  return `${resource}:${action}` as BuildPermission<R, A>;
}

export const RESOURCE_OPTIONS: { label: string; code: Resources }[] = [
  { label: "Lớp học ", code: "classroom" },
  { label: "Môn học ", code: "course" },
  { label: "Người dùng ", code: "employee" },
  { label: "Phòng ban", code: "department" },
  { label: "Bài kiểm tra", code: "assignment" },
];

export const PERMISSION_ACTION_OPTIONS: { label: string; code: PerActions }[] = [
  { label: "Xem", code: "read" },
  { label: "Thêm", code: "create" },
  { label: "Chỉnh sửa", code: "update" },
  { label: "Xoá", code: "delete" },
];

import { PermissionActions } from "@/model/permission.model";

export interface ActionOption {
  label: string;
  code: PermissionActions;
}

export interface PermissionModule {
  id: string;
  name: string;
  actions: ActionOption[];
  // selectedActions: TPermissionActions[];
}

export interface RoleFormData {
  id: string;
  name: string;
  description: string;
  // selectedPermissions: Set<string> // Set of `${moduleId}_${permCode}`
  // originalSelectedPermissions: Set<string>; // For tracking changes
  selectedPermissions: Map<string, Set<PermissionActions>>; // Map of moduleId to Set of permCodes
  originalSelectedPermissions: Map<string, Set<PermissionActions>>; // For tracking changes
  modules: Record<string, PermissionModule>;
}

export const ACTION_OPTIONS: ActionOption[] = [
  { label: "Xem", code: "read" },
  { label: "Thêm", code: "create" },
  { label: "Chỉnh sửa", code: "update" },
  { label: "Xoá", code: "delete" },
];

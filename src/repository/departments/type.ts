import { Departments } from "@/model/departments.model";
export type DepartmentInsert = Pick<
  Departments,
  | "level"
  | "name"
  | "organization_id"
  | "parent_id"
  | "path"
  | "priority"
  | "status"
  | "created_by"
  | "managed_by"
  | "branch_id"
  | "code"
>;

export type DepartmentUpdate = Pick<
  Departments,
  | "id"
  | "level"
  | "name"
  | "parent_id"
  | "path"
  | "priority"
  | "status"
  | "managed_by"
  | "updated_at"
  | "branch_id"
  | "code"
>;

export type DepartmentUpdateStatus = Pick<Departments, "id" | "status" | "updated_at">;

export type DepartmentFilter = {
  from?: number;
  to?: number;
  filterField?: "name" | "code";
  filterValue?: string;
  organizationId: string;
  branchIds?: string[];
  excludes?: string[];
};

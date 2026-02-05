import { Branches } from "@/model/branches.model";

export type BranchInsert = Pick<
  Branches,
  | "code"
  | "address"
  | "level"
  | "name"
  | "organization_id"
  | "parent_id"
  | "path"
  | "priority"
  | "status"
  | "created_by"
  | "managed_by"
>;

export type BranchUpdate = Pick<
  Branches,
  | "id"
  | "code"
  | "address"
  | "level"
  | "name"
  | "parent_id"
  | "path"
  | "priority"
  | "status"
  | "managed_by"
  | "updated_at"
>;

export type BranchUpdateStatus = Pick<Branches, "id" | "status" | "updated_at">;

export type BranchesFilter = {
  from?: number;
  to?: number;
  filterField?: "name" | "code";
  filterValue?: string;
  organizationId: string;
  excludes?: string[];
};

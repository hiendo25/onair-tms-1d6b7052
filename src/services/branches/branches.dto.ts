import { BranchStatus } from "@/model/branches.model";

interface BaseBranchItemResult {
  id: string;
  name: string;
  address: string;
  code: string;
  path: string | null;
  priority: number;
  parentId: string | null;
  createdAt: string;
  level: number | null;
  status: BranchStatus;
  organization: {
    id: string;
    name: string;
  } | null;
  parent: {
    id: string;
    name: string;
    path: string | null;
  } | null;
  author: {
    id: string;
    fullName: string;
  } | null;
  managedBy: {
    id: string;
    fullName: string;
  } | null;
}
export interface CreateBranchInput {
  name?: string;
  address?: string;
  parentId?: string;
  code?: string;
  managedById?: string;
}

export interface GetBranchesInput {
  page?: number;
  pageSize?: number;
  organizationId?: string;
  filter?: {
    field?: "name" | "code";
    value?: string;
  };
  excludes?: string[];
}

export interface GetBranchesResult {
  page: number;
  pageSize: number;
  total: number;
  items: GetBranchItem[];
}

export interface UpdateBranchInput {
  id?: string;
  name?: string;
  parentId?: string;
  code?: string;
  address?: string;
  managedById?: string;
}

export interface UpdateBranchStatusInput {
  id?: string;
  status?: Extract<BranchStatus, "active" | "inactive">;
}
export interface GetBranchItem extends BaseBranchItemResult {
  children: GetBranchItem[] | null;
}
export interface CreateBranchResult extends BaseBranchItemResult {}
export interface DeleteBranchResult {
  id: string;
  name: string;
  address: string;
  code: string;
  path: string | null;
  priority: number;
  parentId: string | null;
  createdAt: string;
  level: number | null;
  status: BranchStatus;
}
export interface UpdateBranchResult extends BaseBranchItemResult {}
export interface UpdateBranchStatusResult extends BaseBranchItemResult {}

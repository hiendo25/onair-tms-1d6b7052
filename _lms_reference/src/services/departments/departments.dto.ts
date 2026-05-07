import { DepartmentStatus } from "@/model/departments.model";

interface BaseDepartmentItemResult {
  id: string;
  name: string;
  code: string | null;
  path: string | null;
  priority: number;
  parentId: string | null;
  createdAt: string;
  level: number | null;
  status: DepartmentStatus;
  organization: {
    id: string;
    name: string;
  } | null;
  parent: {
    id: string;
    name: string;
    code: string | null;
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
  branch: {
    id: string;
    name: string;
    code: string | null;
    path: string | null;
    level: number | null;
  } | null;
}

export interface CreateRootDepartmentInput {
  name?: string;
  code?: string;
  managedById?: string;
  branchId?: string;
}

export interface CreateDepartmentGroupInput {
  name?: string;
  parentId?: string;
  code?: string;
  managedById?: string;
}

export interface CreateDepartmentResult extends BaseDepartmentItemResult {}
export interface CreateRootDepartmentResult extends BaseDepartmentItemResult {}
export interface CreateDepartmentGroupResult extends BaseDepartmentItemResult {}

export interface GetDepartmentsInput {
  page?: number;
  pageSize?: number;
  organizationId?: string;
  filter?: {
    field?: "name" | "code";
    value?: string;
  };
  branchIds?: string[];
  excludes?: string[];
}

export interface GetDepartmentGroupsInput {
  departmentIds?: string[];
}
export interface GetDepartmentGroupsByIdsResult {
  items: Omit<BaseDepartmentItemResult, "parent">[];
  count: number;
}

export interface GetDepartmentsResult {
  page: number;
  pageSize: number;
  total: number;
  items: GetDepartmentItem[];
}

export interface UpdateDepartmentInput {
  id?: string;
  name?: string;
  parentId?: string;
  code?: string;
  managedById?: string;
  branchId?: string;
}

export interface UpdateRootDepartmentInput {
  id?: string;
  name?: string;
  code?: string;
  managedById?: string;
  branchId?: string;
}

export interface UpdateDepartmentGroupInput {
  id?: string;
  name?: string;
  code?: string;
  managedById?: string;
  parentId?: string;
}

export interface UpdateDepartmentStatusInput {
  id?: string;
  status?: Extract<DepartmentStatus, "active" | "inactive">;
}
export interface GetDepartmentItem extends BaseDepartmentItemResult {
  children: GetDepartmentItem[] | null;
}
export interface DeleteDepartmentResult {
  id: string;
  name: string;
  address: string;
  code: string;
  path: string | null;
  priority: number;
  parentId: string | null;
  createdAt: string;
  level: number | null;
  status: DepartmentStatus;
}
export interface UpdateDepartmentResult extends BaseDepartmentItemResult {}
export interface UpdateDepartmentStatusResult extends BaseDepartmentItemResult {}

export interface GetDepartmentDetailByIdResult {
  id: string;
  name: string;
  code: string | null;
  path: string | null;
  priority: number | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string | null;
  level: number | null;
  status: DepartmentStatus;
  organization: {
    id: string;
    name: string;
  } | null;
  parent: {
    id: string;
    name: string;
    code: string | null;
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
  branch: {
    id: string;
    name: string;
    code: string | null;
    path: string | null;
    level: number | null;
  } | null;
}

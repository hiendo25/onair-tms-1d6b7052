import { DomainError } from "@/lib/errors/DomainError";
import { branchRepository, departmentsRepository } from "@/repository";
import { GetBranchesByPathsRecords, GetRootBranchesRecords } from "@/repository/branch";
import { GetDepartmentsByPathsRecords, GetRootDepartmentsRecords } from "@/repository/departments";

import { GetDepartmentDetailByIdResult, GetDepartmentsInput, GetDepartmentsResult } from "./departments.dto";

export class GetDepartmentService {
  private organizationId: string;
  private authorId: string;
  private maxPageSize = 90;

  constructor(organizationId: string, authorId: string) {
    this.organizationId = organizationId;
    this.authorId = authorId;
  }

  async getDepartments(input: GetDepartmentsInput): Promise<GetDepartmentsResult> {
    const { filter, excludes, branchIds } = input;

    const page = input?.page && input?.page > 0 ? input.page : 1;
    const pageSize = input?.pageSize && input.pageSize > 0 ? Math.min(input.pageSize, this.maxPageSize) : 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    if (filter && filter.field && filter.field !== "code" && filter.field !== "name") {
      throw new DomainError("Filter field Invalid", "FILTER_FIELD_INVALID", 400);
    }

    const { data, count } = await departmentsRepository.getRootDepartments({
      from,
      to,
      excludes,
      organizationId: this.organizationId,
      filterField: filter?.field,
      filterValue: filter?.value,
      branchIds,
    });

    const rootPaths = data.map((item) => item.id);
    const childBranches = await departmentsRepository.getDepartmentsByPaths(rootPaths);

    // Build a Map for children;

    const childrenMap = new Map<string, GetDepartmentsByPathsRecords>();
    for (const child of childBranches) {
      const parentId = child.parent_id;
      if (parentId) {
        const existing = childrenMap.get(parentId) || [];
        existing.push(child);
        childrenMap.set(parentId, existing);
      }
    }

    const items = data.map<GetDepartmentsResult["items"][number]>((record) =>
      this.buildDepartmentsTree(record, childrenMap),
    );

    return {
      items,
      page,
      pageSize,
      total: count || 0,
    };
  }

  async getDetailDepartmentById(recordId?: string): Promise<GetDepartmentDetailByIdResult> {
    if (!recordId) {
      throw new DomainError("thiếu Id phòng ban.", "MISSING_ID_DEPARTMENT", 400);
    }

    const data = await departmentsRepository.getDepartmentById(recordId, this.organizationId);

    if (!data) {
      throw new DomainError("Không tìm thấy phòng ban", "DEPARTMENT_NOT_FOUND", 400);
    }

    return {
      id: data.id,
      name: data.name,
      priority: data.priority,
      code: data.code,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      path: data.path,
      level: data.level,
      status: data.status,
      author: data.createdBy
        ? {
            fullName: data.createdBy.full_name || "",
            id: data.createdBy.id,
          }
        : null,
      managedBy: data.managedBy
        ? {
            id: data.managedBy.id,
            fullName: data.managedBy.full_name || "",
          }
        : null,
      parent: null,
      parentId: data.parent_id,
      organization: {
        id: data.organizations.id,
        name: data.organizations.name,
      },
      branch: data.branch
        ? {
            id: data.branch.id,
            level: data.branch.level,
            name: data.branch.name,
            path: data.branch.path,
            code: data.branch.code,
          }
        : null,
    };
  }

  private buildDepartmentsTree(
    record: GetRootDepartmentsRecords["data"][number],
    childrenMap: Map<string, GetDepartmentsByPathsRecords>,
  ): GetDepartmentsResult["items"][number] {
    const children = childrenMap.get(record.id) || [];
    const childItems = children.map((child) => this.buildDepartmentsTree(child, childrenMap));
    return {
      id: record.id,
      name: record.name,
      createdAt: record.created_at,
      path: record.path,
      level: record.level,
      children: childItems,
      code: record.code,
      status: record.status,
      parentId: record.parent_id,
      priority: record.priority || 1,
      author: record.createdBy
        ? {
            fullName: record.createdBy.profiles?.full_name || "",
            id: record.createdBy.id,
          }
        : null,
      parent: null,
      managedBy: record.managedBy
        ? {
            id: record.managedBy.id,
            fullName: record.managedBy.full_name || record.managedBy.profiles?.full_name || "",
          }
        : null,
      organization: {
        id: record.organizations.id,
        name: record.organizations.name,
      },
      branch: record.branch
        ? {
            id: record.branch.id,
            name: record.branch.name,
            code: record.branch.code,
            path: record.branch.path,
            level: record.branch.level,
          }
        : null,
    };
  }
}

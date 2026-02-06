import { DomainError } from "@/lib/errors/DomainError";
import { branchRepository } from "@/repository";
import { GetBranchesByPathsRecords, GetRootBranchesRecords } from "@/repository/branch";

import { GetBranchesInput, GetBranchesResult } from "./branches.dto";

export class GetBranchService {
  private organizationId: string;
  private authorId: string;
  private maxPageSize = 90;

  constructor(organizationId: string, authorId: string) {
    this.organizationId = organizationId;
    this.authorId = authorId;
  }

  async getBranches(input: GetBranchesInput) {
    const { filter, excludes } = input;

    const page = input?.page && input?.page > 0 ? input.page : 1;
    const pageSize = input?.pageSize && input.pageSize > 0 ? Math.min(input.pageSize, this.maxPageSize) : 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    if (filter && filter.field && filter.field !== "code" && filter.field !== "name") {
      throw new DomainError("Filter field Invalid", "FILTER_FIELD_INVALID", 400);
    }

    const { data, count } = await branchRepository.getRootBranches({
      from,
      to,
      excludes,
      organizationId: this.organizationId,
      filterField: filter?.field,
      filterValue: filter?.value,
    });

    const rootPaths = data.map((item) => item.id);
    const childBranches = await branchRepository.getBranchesByPaths(rootPaths);

    // Build a Map for children;

    const childrenMap = new Map<string, GetBranchesByPathsRecords>();
    for (const child of childBranches) {
      const parentId = child.parent_id;
      if (parentId) {
        const existing = childrenMap.get(parentId) || [];
        existing.push(child);
        childrenMap.set(parentId, existing);
      }
    }

    const items = data.map<GetBranchesResult["items"][number]>((record) => this.buildBranchesTree(record, childrenMap));

    return {
      items,
      page,
      pageSize,
      total: count || 0,
    };
  }

  private buildBranchesTree(
    record: GetRootBranchesRecords["data"][number],
    childrenMap: Map<string, GetBranchesByPathsRecords>,
  ): GetBranchesResult["items"][number] {
    const children = childrenMap.get(record.id) || [];
    const childItems = children.map((child) => this.buildBranchesTree(child, childrenMap));
    return {
      id: record.id,
      name: record.name,
      address: record.address,
      createdAt: record.created_at,
      path: record.path,
      level: record.level,
      code: record.code,
      status: record.status,
      parentId: record.parent_id,
      priority: record.priority || 1,
      author: null,
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
      children: childItems,
    };
  }
}

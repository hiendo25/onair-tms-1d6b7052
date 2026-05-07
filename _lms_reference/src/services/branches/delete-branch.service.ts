import { DomainError } from "@/lib/errors/DomainError";
import { branchRepository, employeesRepository, organizationsRepository } from "@/repository";

import { DeleteBranchResult } from "./branches.dto";

export class DeleteBranchService {
  private organizationId: string;
  private authorId: string;

  constructor(organizationId: string, authorId: string) {
    this.organizationId = organizationId;
    this.authorId = authorId;
  }

  async execute(branchId: string): Promise<DeleteBranchResult> {
    const currentBranch = await branchRepository.getBranchById(branchId, this.organizationId);

    if (!currentBranch) {
      throw new DomainError("Chi nhánh không hợp lệ.", "BRANCH_ID_IS_INVALID", 400, branchId);
    }

    const queryPath = currentBranch.path ? `${currentBranch.path}/${currentBranch.id}` : currentBranch.id;

    const childBranches = await branchRepository.getBranchesByPaths([queryPath]);

    if (childBranches.length) {
      throw new DomainError("Không thể xóa, vui lòng gỡ toàn bộ chi nhánh con.", "BRANCH_CHILDREN_EXISTED", 400);
    }
    const data = await branchRepository.deleteBranchById(branchId);

    return {
      id: data.id,
      name: data.name,
      address: data.address,
      priority: data.priority || 0,
      code: data.code,
      createdAt: data.created_at,
      path: data.path,
      level: data.level,
      parentId: data.parent_id,
      status: data.status,
    };
  }
}

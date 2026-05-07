import dayjs from "@/lib/dayjs";
import { DomainError } from "@/lib/errors/DomainError";
import { branchRepository } from "@/repository";

import { UpdateBranchStatusInput, UpdateBranchStatusResult } from "./branches.dto";

export class UpdateBranchStatusService {
  private organizationId: string;
  private authorId: string;
  private defaultBranchLevel = 1;
  private maxBranchLevel = 2;

  constructor(organizationId: string, authorId: string) {
    this.organizationId = organizationId;
    this.authorId = authorId;
  }

  async execute(updateBranchInput: UpdateBranchStatusInput): Promise<UpdateBranchStatusResult> {
    if (!updateBranchInput.id) {
      throw new DomainError("Thiếu Id chi nhánh", "BRANCH_ID_IS_MISSING", 400);
    }

    const currentBranch = await branchRepository.getBranchById(updateBranchInput.id, this.organizationId);

    if (!currentBranch) {
      throw new DomainError("Chi nhánh không hợp lệ.", "BRANCH_ID_IS_INVALID", 400, updateBranchInput);
    }

    if (
      !updateBranchInput.status ||
      (updateBranchInput.status !== "active" && updateBranchInput.status !== "inactive")
    ) {
      throw new DomainError("Trạng thái không hợp lệ", "BRANCH_STATUS_IS_INVALID", 400, updateBranchInput);
    }

    const data = await branchRepository.updateBranchStatus({
      id: updateBranchInput.id,
      status: updateBranchInput.status,
      updated_at: dayjs().toISOString(),
    });

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
      organization: {
        id: data.organizations.id,
        name: data.organizations.name,
      },
    };
  }

  private async getParentBranch(recordId?: string) {
    if (!recordId) return null;

    const brach = await branchRepository.getBranchById(recordId, this.organizationId);

    if (!brach) {
      throw new DomainError("Parent Branch Invalid", "PARENT_BRANCH_INVALID", 400);
    }
    return brach;
  }
}

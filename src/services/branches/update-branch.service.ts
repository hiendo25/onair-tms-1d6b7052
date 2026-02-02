import dayjs from "@/lib/dayjs";
import { DomainError } from "@/lib/errors/DomainError";
import { branchRepository, employeesRepository, organizationsRepository } from "@/repository";

import { UpdateBranchInput, UpdateBranchResult } from "./branches.dto";
export class UpdateBranchService {
  private organizationId: string;
  private authorId: string;
  private defaultBranchLevel = 1;
  private maxBranchLevel = 2;

  constructor(organizationId: string, authorId: string) {
    this.organizationId = organizationId;
    this.authorId = authorId;
  }

  async execute(updateBranchInput: UpdateBranchInput): Promise<UpdateBranchResult> {
    const { managedById } = updateBranchInput;
    if (!updateBranchInput.id) {
      throw new DomainError("Thiếu Id chi nhánh", "BRANCH_ID_IS_MISSING", 400);
    }

    const currentBranch = await branchRepository.getBranchById(updateBranchInput.id, this.organizationId);

    const manager = await this.getManagedEmployee(managedById);

    console.log({ manager, managedById });
    if (!currentBranch) {
      throw new DomainError("Chi nhánh không hợp lệ.", "BRANCH_ID_IS_INVALID", 400, updateBranchInput);
    }

    const name = updateBranchInput.name ? updateBranchInput.name.trim() : currentBranch.name;
    const address = updateBranchInput.address ? updateBranchInput.address.trim() : currentBranch.address;

    const parentBranch = await this.getParentBranch(updateBranchInput.parentId);
    const branchLevel = parentBranch?.level ? parentBranch?.level + 1 : this.defaultBranchLevel;

    if (branchLevel > this.maxBranchLevel) {
      throw new DomainError(
        `Phân cấp chi nhánh tối đa cho phép là ${this.maxBranchLevel}`,
        "MAXIMUM_BRANCH_DEPTH_LEVEL",
        400,
      );
    }
    if (parentBranch?.id) {
      await this.applyValidateParentBranch(parentBranch.id, currentBranch.id);
    }

    let path: string | null = null;
    if (parentBranch) {
      path = parentBranch.path ? `${parentBranch.path}/${parentBranch.id}` : parentBranch.id;
    }

    const lastPriority = await branchRepository.getLastPriorityBranch(updateBranchInput.parentId ?? undefined);
    const nextPriority = lastPriority + 1;

    let branchCode = updateBranchInput.code;

    if (branchCode && branchCode !== currentBranch.code) {
      const branch = await branchRepository.getBranchByCodeOrName("code", branchCode);

      if (branch) {
        throw new DomainError("Mã chi nhánh đã tồn tại trên hệ thống.", "BRANCH_CODE_ALREADY_EXISTED", 409);
      }
    } else if (!branchCode) {
      branchCode = await this.generateBranchCode(nextPriority, branchLevel);
    } else {
      branchCode = currentBranch.code;
    }

    const data = await branchRepository.updateBranch({
      id: updateBranchInput.id,
      address,
      name,
      path,
      code: branchCode,
      level: branchLevel,
      parent_id: parentBranch ? parentBranch.id : null,
      priority: nextPriority,
      status: "active",
      managed_by: manager?.id ?? null,
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
      parent: parentBranch
        ? {
            id: parentBranch.id,
            name: parentBranch.code,
            path: parentBranch.path,
          }
        : null,
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

  private async generateBranchCode(nextPriority: number, branchLevel: number) {
    const { code } = await organizationsRepository.getOrganizationById(this.organizationId);
    const numberString = [...Array.from({ length: branchLevel }, (v, k) => k), nextPriority].join("");
    let branchCode = numberString.padStart(4, "0");

    if (code) {
      branchCode = code.concat("-", branchCode);
    }

    return branchCode;
  }

  private async applyValidateParentBranch(parentBranchId: string, currentBranchId: string) {
    const branchesChildren = await branchRepository.getBranchesByPaths([currentBranchId]);

    const branchChildMap = new Map(branchesChildren.map((item) => [item.id, item]));

    if (branchesChildren.length) {
      throw new DomainError(
        "Để cập nhật chinh nhánh cha vui lòng gỡ toàn bộ chi nhánh con liên quan.",
        "CURRENT_BRANCH_HAS_CHILDREN_BRANCHES",
        400,
      );
    }
    /**
     * ignore if parent of current branch is it's self
     */
    if (parentBranchId === currentBranchId) {
      throw new DomainError(
        "Không thể gán chi nhánh cha là chính chi nhánh hiện tại.",
        "PARENT_BRANCH_ID_MUST_NOT_SELF",
        400,
      );
    }

    if (branchChildMap.has(parentBranchId)) {
      throw new DomainError(
        "Không thể cập nhật chi nhánh cha nằm trong chi nhánh con của chi nhánh hiện tại",
        "PARENT_BRANCH_MUS_NOT_IN_CHILDREN_OF_CURRENT_BRANCH",
        400,
      );
    }
  }
  private async getManagedEmployee(recordId?: string) {
    if (!recordId) return null;

    const employee = await employeesRepository.getOneEmployeeById(recordId, this.organizationId);

    if (!employee) {
      throw new DomainError("Người quản lý không hợp lệ", "MANAGED_BY_ID_INVALID", 400);
    }
    return employee;
  }
}

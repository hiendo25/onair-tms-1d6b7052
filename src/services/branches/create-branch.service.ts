import { DomainError } from "@/lib/errors/DomainError";
import { branchRepository, employeesRepository, organizationsRepository } from "@/repository";

import { CreateBranchInput, CreateBranchResult } from "./branches.dto";
export class CreateBranchService {
  private organizationId: string;
  private authorId: string;
  private defaultBranchLevel = 1;

  private maxBranchLevel = 2;

  constructor(organizationId: string, authorId: string) {
    this.organizationId = organizationId;
    this.authorId = authorId;
  }

  async execute(createBranchInput: CreateBranchInput): Promise<CreateBranchResult> {
    const { managedById, parentId } = createBranchInput;
    const branchName = createBranchInput.name ? createBranchInput.name.trim() : "";
    const address = createBranchInput.address ? createBranchInput.address.trim() : "";

    const parentBranch = await this.getParentBranch(parentId);

    const branchLevel = parentBranch && parentBranch.level ? parentBranch.level + 1 : this.defaultBranchLevel;

    const manager = await this.getManagedEmployee(managedById);

    if (branchLevel > this.maxBranchLevel) {
      throw new DomainError(
        `Phân cấp chi nhánh tối đa cho phép là ${this.maxBranchLevel}`,
        "MAXIMUM_BRANCH_DEPTH_LEVEL",
        400,
      );
    }

    let path: string | null = null;
    if (parentBranch) {
      path = parentBranch.path ? `${parentBranch.path}/${parentBranch.id}` : parentBranch.id;
    }

    const lastPriority = await branchRepository.getLastPriorityBranch(parentId ?? undefined);
    const nextPriority = lastPriority + 1;

    let branchCode = createBranchInput.code;
    if (branchCode) {
      const existedBranchByCode = await branchRepository.getBranchByCodeOrName("code", branchCode);

      if (existedBranchByCode) {
        throw new DomainError("Mã chi nhánh đã tồn tại trên hệ thống.", "BRANCH_CODE_ALREADY_EXISTS", 409);
      }
    } else {
      branchCode = await this.generateBranchCode(nextPriority, branchLevel);
    }

    const data = await branchRepository.createBranch({
      address,
      code: branchCode,
      level: branchLevel,
      name: branchName,
      organization_id: this.organizationId,
      parent_id: parentBranch ? parentBranch.id : null,
      path,
      priority: nextPriority,
      status: "active",
      created_by: this.authorId,
      managed_by: manager ? manager.id : null,
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
      parentId: data.parent_id,
      organization: {
        id: data.organizations.id,
        name: data.organizations.name,
      },
    };
  }

  private async getParentBranch(recordId?: string) {
    if (!recordId) return null;

    const branch = await branchRepository.getBranchById(recordId, this.organizationId);

    if (!branch) {
      throw new DomainError("Chi nhánh cha không hợp lệ.", "PARENT_BRANCH_INVALID", 400);
    }
    return branch;
  }

  private async getManagedEmployee(recordId?: string) {
    if (!recordId) return null;

    const employee = await employeesRepository.getOneEmployeeById(recordId, this.organizationId);

    if (!employee) {
      throw new DomainError("Người quản lý không hợp lệ", "MANAGED_BY_ID_INVALID", 400);
    }
    return employee;
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
}

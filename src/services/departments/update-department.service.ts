import { DomainError } from "@/lib/errors/DomainError";
import { branchRepository, departmentsRepository, employeesRepository, organizationsRepository } from "@/repository";

import { UpdateDepartmentInput, UpdateDepartmentResult } from "./departments.dto";

export class UpdateDepartmentService {
  private organizationId: string;
  private authorId: string;
  private defaultDepartmentLevel = 1;

  private maxDepthLevel = 2;

  constructor(organizationId: string, authorId: string) {
    this.organizationId = organizationId;
    this.authorId = authorId;
  }

  async execute(createDepartmentInput: UpdateDepartmentInput): Promise<UpdateDepartmentResult> {
    const { managedById, parentId, branchId } = createDepartmentInput;
    const departmentName = createDepartmentInput.name ? createDepartmentInput.name.trim() : "";

    const parentDepartment = await this.getParentDepartment(parentId);

    const branch = await this.getBranch(branchId);

    const departmentLevel =
      parentDepartment && parentDepartment.level ? parentDepartment.level + 1 : this.defaultDepartmentLevel;

    const manager = await this.getManagedEmployee(managedById);

    if (departmentLevel > this.maxDepthLevel) {
      throw new DomainError(
        `Phân cấp chi nhánh tối đa cho phép là ${this.maxDepthLevel}`,
        "MAXIMUM_DEPARTMENT_DEPTH_LEVEL",
        400,
      );
    }

    let path: string | null = null;
    if (parentDepartment) {
      path = parentDepartment.path ? `${parentDepartment.path}/${parentDepartment.id}` : parentDepartment.id;
    }

    const lastPriority = await departmentsRepository.getLastPriorityDepartment(parentId ?? undefined);

    const nextPriority = lastPriority + 1;

    let departmentCode = createDepartmentInput.code;
    if (departmentCode) {
      const existedDepartmentCode = await departmentsRepository.getDepartmentByCodeOrName("code", departmentCode);

      if (existedDepartmentCode) {
        throw new DomainError("Mã phòng ban đã tồn tại trên hệ thống.", "DEPARTMENT_CODE_ALREADY_EXISTS", 409);
      }
    } else {
      departmentCode = await this.generateDepartmentCode(nextPriority, departmentLevel);
    }

    const data = await departmentsRepository.createDepartment({
      branch_id: branch ? branch.id : null,
      code: departmentCode,
      level: departmentLevel,
      name: departmentName,
      organization_id: this.organizationId,
      parent_id: parentDepartment ? parentDepartment.id : null,
      path,
      priority: nextPriority,
      status: "active",
      created_by: this.authorId,
      managed_by: manager ? manager.id : null,
    });

    return {
      id: data.id,
      name: data.name,
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
      parent: parentDepartment
        ? {
            id: parentDepartment.id,
            name: parentDepartment.name,
            code: parentDepartment.code,
            path: parentDepartment.path,
          }
        : null,
      parentId: data.parent_id,
      organization: {
        id: data.organizations.id,
        name: data.organizations.name,
      },
      branch: branch
        ? { id: branch.id, name: branch.name, path: branch.path, code: branch.code, level: branch.level }
        : null,
    };
  }

  private async getParentDepartment(departmentId?: string) {
    if (!departmentId) return null;

    const department = await departmentsRepository.getDepartmentById(departmentId, this.organizationId);

    if (!department) {
      throw new DomainError("Phòng ban cha không hợp lệ.", "PARENT_DEPARTMENT_INVALID", 400);
    }
    return department;
  }

  private async getManagedEmployee(departmentId?: string) {
    if (!departmentId) return null;

    const employee = await employeesRepository.getOneEmployeeById(departmentId, this.organizationId);

    if (!employee) {
      throw new DomainError("Người quản lý không hợp lệ", "MANAGED_BY_ID_INVALID", 400);
    }
    return employee;
  }

  private async generateDepartmentCode(nextPriority: number, departmentLevel: number) {
    const { code } = await organizationsRepository.getOrganizationById(this.organizationId);
    const numberString = [...Array.from({ length: departmentLevel }, (v, k) => k), nextPriority].join("");
    let departmentCode = numberString.padStart(4, "0");

    if (code) {
      departmentCode = code.concat("-", departmentCode);
    }

    return departmentCode;
  }

  private async getBranch(branchId?: string) {
    if (!branchId) return null;
    const branch = await branchRepository.getBranchById(branchId, this.organizationId);

    if (!branch) {
      throw new DomainError("Chi nhánh không hợp lệ", "BRANCH_IS_INVALID", 400, branchId);
    }

    return branch;
  }
}

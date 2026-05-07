import { DomainError } from "@/lib/errors/DomainError";
import { branchRepository, departmentsRepository, employeesRepository, organizationsRepository } from "@/repository";

import {
  CreateDepartmentGroupInput,
  CreateDepartmentGroupResult,
  CreateRootDepartmentInput,
  CreateRootDepartmentResult,
} from "./departments.dto";

export class CreateDepartmentService {
  private organizationId: string;
  private authorId: string;
  private defaultDepartmentLevel = 1;
  private rootDepartmentLevel = 1;

  private maxDepthLevel = 2;

  constructor(organizationId: string, authorId: string) {
    this.organizationId = organizationId;
    this.authorId = authorId;
  }

  async createRoot(createDepartmentRootInput: CreateRootDepartmentInput): Promise<CreateRootDepartmentResult> {
    const { managedById, branchId } = createDepartmentRootInput;

    const managedDepartment = await this.getManagedDepartment(managedById);

    const departmentName = createDepartmentRootInput.name ? createDepartmentRootInput.name.trim() : "";

    const rootDepartmentLevel = this.rootDepartmentLevel;
    const branch = await this.getBranch(branchId);

    const lastPriority = await departmentsRepository.getLastPriorityDepartment();

    const nextPriority = lastPriority + 1;

    let departmentCode = createDepartmentRootInput.code;

    if (departmentCode) {
      const existedDepartmentCode = await departmentsRepository.getDepartmentByCodeOrName("code", departmentCode);

      if (existedDepartmentCode) {
        throw new DomainError("Mã phòng ban đã tồn tại trên hệ thống.", "DEPARTMENT_CODE_ALREADY_EXISTS", 409);
      }
    } else {
      departmentCode = await this.generateDepartmentCode(nextPriority, rootDepartmentLevel);
    }

    const data = await departmentsRepository.createDepartment({
      branch_id: branch ? branch.id : null,
      code: departmentCode,
      level: rootDepartmentLevel,
      name: departmentName,
      organization_id: this.organizationId,
      parent_id: null,
      path: null,
      priority: nextPriority,
      status: "active",
      created_by: this.authorId,
      managed_by: managedDepartment ? managedDepartment.id : null,
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
      parent: null,
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

  async createChild(input: CreateDepartmentGroupInput): Promise<CreateDepartmentGroupResult> {
    const { managedById, parentId } = input;

    if (!parentId) {
      throw new DomainError("Thiếu parentId phòng ban", "INVALID_PARENT_DEPARTMENT_ID", 400, input);
    }

    const departmentName = input.name ? input.name.trim() : "";

    const parentDepartment = await this.getParentDepartment(parentId);

    console.log({ parentDepartment });
    const departmentLevel = parentDepartment.level ? parentDepartment.level + 1 : this.defaultDepartmentLevel;

    const manager = await this.getManagedDepartment(managedById);

    if (departmentLevel > this.maxDepthLevel) {
      throw new DomainError(
        `Phân cấp chi nhánh tối đa cho phép là ${this.maxDepthLevel}`,
        "MAXIMUM_DEPARTMENT_DEPTH_LEVEL",
        400,
      );
    }

    const path = parentDepartment.path ? `${parentDepartment.path}/${parentDepartment.id}` : parentDepartment.id;

    const lastPriority = await departmentsRepository.getLastPriorityDepartment(parentId);

    const nextPriority = lastPriority + 1;

    let departmentCode = input.code;

    if (departmentCode) {
      const existedDepartmentCode = await departmentsRepository.getDepartmentByCodeOrName("code", departmentCode);

      if (existedDepartmentCode) {
        throw new DomainError("Mã phòng ban đã tồn tại trên hệ thống.", "DEPARTMENT_CODE_ALREADY_EXISTS", 409);
      }
    } else {
      departmentCode = await this.generateDepartmentCode(nextPriority, departmentLevel);
    }

    const data = await departmentsRepository.createDepartment({
      branch_id: parentDepartment.branch_id,
      code: departmentCode,
      level: departmentLevel,
      name: departmentName,
      organization_id: this.organizationId,
      parent_id: parentDepartment.id,
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
      branch: data.branch
        ? {
            id: data.branch.id,
            name: data.branch.name,
            path: data.branch.path,
            code: data.branch.code,
            level: data.branch.level,
          }
        : null,
    };
  }

  private async getParentDepartment(departmentId: string) {
    const department = await departmentsRepository.getDepartmentById(departmentId, this.organizationId);

    if (!department) {
      throw new DomainError("Phòng ban cha không hợp lệ.", "PARENT_DEPARTMENT_INVALID", 400);
    }
    return department;
  }

  private async getManagedDepartment(departmentId?: string) {
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

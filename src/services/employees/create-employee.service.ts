import dayjs from "dayjs";

import { DomainError } from "@/lib/errors/DomainError";
import { EmployeeType } from "@/model/employee.model";
import {
  employeeDepartmentsRepository,
  employeesRepository,
  managersEmployeesRepository,
  organizationsRepository,
  profilesRepository,
  userPreferenceRepository,
} from "@/repository";
import { userRepository } from "@/repository";
import { employeeBranchesRepository } from "@/repository";
import { createServiceRoleClient } from "@/services/supabase/service-role-client";

import { CreateEmployeeInput, CreateEmployeeResult } from "./employee.dto";

type RollbackContext = {
  userId?: string;
  employeeId?: string;
  profileCreated?: boolean;
  userCreatedNew?: boolean;
  departmentCreated?: boolean;
  pivotDepartmentId?: string;
  branchCreated?: boolean;
  pivotBranchId?: string;
};

export class CreateEmployeeService {
  private organizationId: string;

  private minCodeNumberLength = 6;

  private temporaryPassword = "123456";

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  async execute(input: CreateEmployeeInput): Promise<CreateEmployeeResult> {
    const ctx: RollbackContext = {};

    try {
      /**
       * Create User
       */
      const existingUserId = await userRepository.getUserIdByEmail(input.email);

      if (existingUserId) {
        const employeeOrganization = await employeesRepository.getEmployeeIdByUserIdAndOrganizationId(
          existingUserId,
          this.organizationId,
        );
        if (employeeOrganization) {
          throw new DomainError(
            "Email đã tồn tại trên hệ thống doanh nghiệp.",
            "EMAIL_ALREADY_EXISTS_CURRENT_ORGANIZATION",
            409,
          );
        }
        ctx.userId = existingUserId;
      } else {
        const user = await userRepository.createUser({
          password: this.temporaryPassword,
          organizationId: this.organizationId,
          email: input.email,
        });

        ctx.userId = user.id;
        ctx.userCreatedNew = true;
      }

      /**
       * Create Employee
       */
      console.log("Start create employee");
      const lastOrder = (await employeesRepository.getLastEmployeeOrder(this.organizationId)) || 0;
      console.log({ lastOrder });

      const organizationCode = await this.getOrganizationCode(this.organizationId);

      const employeeCode = input.code
        ? `${organizationCode ?? ""}${input.code}`
        : await this.genEmployeeCode(input.type, lastOrder, organizationCode ?? undefined);

      const employeeData = await employeesRepository.createEmployee({
        user_id: ctx.userId,
        employee_code: employeeCode,
        employee_order: lastOrder + 1,
        start_date: input.startAt || dayjs().toISOString(),
        position_id: null,
        employee_type: input.type,
        organization_id: this.organizationId,
        status: "active",
      });
      ctx.employeeId = employeeData.id;

      console.log(`Employee record created: ${employeeData.id}`);

      /**
       * Create Profile
       */

      console.log(`Start create Profile: ${employeeData.id}`);
      const profileData = await profilesRepository.createProfile({
        employee_id: employeeData.id,
        email: input.email,
        full_name: input.fullName,
        phone_number: input.phoneNumber || "",
        gender: input.gender,
        birthday: input.dateOfBirth || null,
        avatar: null,
      });
      console.log(`Created Profile: ${employeeData.id}`);
      ctx.profileCreated = true;

      console.log(`Start create Department: ${employeeData.id}`);
      const department = await this.createDepartment(employeeData.id, input.departmentId);
      console.log(`Created Department: ${employeeData.id}`);

      if (department) {
        ctx.departmentCreated = true;
        ctx.pivotDepartmentId = department.id;
      }
      console.log(`Start create Branch: ${employeeData.id}`);
      const branch = await this.createBranch(employeeData.id, input.branchId);
      console.log(`Created branch: ${employeeData.id}`);

      if (branch) {
        ctx.branchCreated = true;
        ctx.pivotBranchId = branch.id;
      }

      if (input.managerId) {
        await managersEmployeesRepository.createManagerRelationship({
          employee_id: employeeData.id,
          manager_id: input.managerId,
        });
      }

      /**
       * if new user create role and preference
       */

      let roles: { id: string; name: string }[];
      if (!existingUserId) {
        console.log(`Start create Roles: ${employeeData.id}`);
        roles = await this.createUserRole(ctx.userId, input.type, input.roleId);
        console.log(`Created Roles: ${employeeData.id}`);
        await this.createUserReference(ctx.userId);
      }

      return {
        id: employeeData.id,
        employeeCode: employeeData.employee_code,
        startAt: employeeData.start_date ?? undefined,
        profile: {
          email: profileData.email,
          gender: profileData.gender,
          phoneNumber: profileData.phone_number,
          dateOfBirth: profileData.birthday ?? undefined,
          fullName: profileData.full_name,
        },
        branch,
        department,
        manager: undefined,
        type: employeeData.employee_type || input.type,
        roles: undefined,
        userId: ctx.userId,
        order: employeeData.employee_order ?? undefined,
        status: employeeData.status,
        createdAt: employeeData.created_at,
      };
    } catch (error) {
      await this.rollback(ctx);
      throw error;
    }
  }

  private getUserRoleByType(type: EmployeeType) {
    if (process.env.NODE_ENV === "production") {
      return type === "admin"
        ? "d8d83b31-7dd0-497a-a2b5-1767ef4968b0"
        : type === "teacher"
          ? "c4dbe633-cc64-4307-a5d3-409b0118e435"
          : "cf80f9a6-3362-496d-b158-93c4fc8b3a99";
    }

    return type === "admin"
      ? "ab7b2ebf-2ae4-49c0-aaea-cb8f7c144a4b"
      : type === "teacher"
        ? "af09f332-0256-4361-b0dd-3524bb5ebdb2"
        : "91be4b67-e292-420d-b6e7-b4619eec077f";
  }
  private async createUserReference(userId: string) {
    const { data: currentReferenceData, error: currentReferenceError } =
      await userPreferenceRepository.getUserPreferencesByUserId(userId);

    if (currentReferenceError) {
      throw new Error(currentReferenceError.message);
    }

    if (!currentReferenceData) {
      const { error: referenceError } = await userPreferenceRepository.createUserPreference({
        user_id: userId,
        default_organization_id: this.organizationId,
      });

      if (referenceError) {
        throw new Error(referenceError.message);
      }
    }
  }

  private async createUserRole(userId: string, type: EmployeeType, roleId?: string) {
    const supabaseAdmin = await createServiceRoleClient();

    const inputRoleId = roleId ? roleId : this.getUserRoleByType(type);

    const { data: roles, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert([
        {
          user_id: userId,
          role_id: inputRoleId,
        },
      ])
      .select(`*, roles(id, title)`);

    if (roleError) throw new Error(`Failed to assign role to user: ${roleError.message}`);

    return roles.map((role) => ({ id: role.roles.id, name: role.roles.title }));
  }

  private async createDepartment(employeeId: string, departmentId?: string) {
    if (!departmentId) return;

    const departments = await employeeDepartmentsRepository.create([
      {
        employee_id: employeeId,
        department_id: departmentId,
      },
    ]);
    console.log({ departments });

    return departments[0]
      ? { id: departments[0].id, departmentId: departments[0].department.id, name: departments[0].department.name }
      : undefined;
  }

  private async createBranch(employeeId: string, branchId?: string) {
    if (!branchId) return;

    const branches = await employeeBranchesRepository.create([
      {
        employee_id: employeeId,
        branch_id: branchId,
      },
    ]);
    console.log({ branches });
    return branches[0]
      ? { id: branches[0].id, branchId: branches[0].branches.id, name: branches[0].branches.name }
      : undefined;
  }

  private async genEmployeeCode(type: EmployeeType, lastOrder: number, organizationCode?: string) {
    let prefix = type === "student" ? "ST" : type === "admin" ? "AD" : "GV";

    if (organizationCode) {
      prefix = `${organizationCode}${prefix}`;
    }
    let nextOrder = lastOrder + 1;

    for (let attempt = 0; attempt < 5; attempt++) {
      const employeeCode = `${prefix}${String(nextOrder).padStart(this.minCodeNumberLength, "0")}`;

      try {
        const isExists = await employeesRepository.checkEmployeeCodeExists(employeeCode);

        if (isExists) {
          nextOrder++;
          continue;
        }

        return employeeCode;
      } catch (err) {
        console.log(err, attempt, employeeCode);
      }
    }
    throw new DomainError("Failed to generate unique employee code", "FAIL_TO_GENERATE_CODE", 404);
  }

  private async rollback(ctx: RollbackContext) {
    console.error("[CreateEmployeeService] rollback start", ctx);
    try {
      if (ctx.employeeId) {
        await employeeBranchesRepository.deleteByEmployeeId(ctx.employeeId);
        await employeeDepartmentsRepository.deleteByEmployeeId(ctx.employeeId);
        await managersEmployeesRepository.deleteManagerRelationshipsByEmployeeId(ctx.employeeId);
        if (ctx.profileCreated) {
          await profilesRepository.deleteProfileByEmployeeId(ctx.employeeId);
        }
        await employeesRepository.deleteEmployeeById(ctx.employeeId);
      }

      if (ctx.userCreatedNew && ctx.userId) {
        /**
         * Check user exists in another org before delete
         */
        const organizations = await organizationsRepository.getOrganizationsByUserId(ctx.userId);

        if (organizations.length === 1 && organizations[0]?.organization_id === this.organizationId) {
          await userRepository.deleteUser(ctx.userId);
        }
      }
    } catch (err) {
      console.error("[CreateEmployeeService] rollback failed", err);
    }
  }

  private async getOrganizationCode(organizationId: string) {
    const organization = await organizationsRepository.getOrganizationById(organizationId);

    return organization.code;
  }
}

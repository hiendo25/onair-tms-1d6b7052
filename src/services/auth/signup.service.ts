import dayjs from "dayjs";

import { DomainError } from "@/lib/errors/DomainError";
import { authRepository, profilesRepository, userPreferenceRepository } from "@/repository";
import { employeesRepository } from "@/repository";
import { SignUpDto, SignUpDtoResponse } from "@/types/dto/auth/signup.dto";
import { createServiceRoleClient } from "../supabase/service-role-client";
export class SignupService {
  async execute(dto: SignUpDto): Promise<SignUpDtoResponse> {
    const supabaseAdmin = await createServiceRoleClient();

    const { email, fullName, employeeType, password } = dto;

    let { data: userId } = await supabaseAdmin.rpc("get_user_id_by_email", {
      user_email: email,
    });

    const organizationId = await this.getRootOrganizationId();

    if (!userId) {
      // throw new DomainError("Email đã có trên hệ thông", "AUTH_EMAIL_EXISTS", 409);
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: {
          active_organization_id: organizationId,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!user) {
        throw new DomainError("Create user fail", "CREATE_USER_FAILED", 500);
      }
      userId = user.id;
    }

    /**
     * Check Employee exists on current organization
     */

    const isExistEmployee = await employeesRepository.isExistEmployee(userId, organizationId);

    if (isExistEmployee) {
      throw new DomainError("Tài khoản đã tồn tại", "EMPLOYEE_EXISTS", 409);
    }

    /**
     * Create Employee
     */
    const lastEmployeeOrder = await employeesRepository.getLastEmployeeOrder();
    const employeeNextOrder = lastEmployeeOrder + 1;
    const employeeCode = await this.generateEmployeeCode(employeeType);

    const employee = await employeesRepository.createEmployee({
      employee_code: employeeCode,
      employee_order: employeeNextOrder,
      employee_type: employeeType,
      organization_id: organizationId,
      position_id: null,
      status: "active",
      user_id: userId,
      start_date: dayjs().toISOString(),
    });

    /**
     * Link Default org for Employee
     */
    const { data: dataReference } = await userPreferenceRepository.getUserPreferencesByUserId(userId);

    if (!dataReference) {
      const { error: errorReference } = await userPreferenceRepository.createUserPreference({
        default_organization_id: organizationId,
        user_id: userId,
      });

      if (errorReference) {
        console.error("Create reference failed", errorReference?.message);
      }
    }
    /**
     * Create role default for employee
     */
    const roleId = await this.getDefaultRole(employeeType);

    const { error: errorRoles } = await supabaseAdmin.from("user_roles").insert({ role_id: roleId, user_id: userId });

    if (errorRoles) {
      throw new Error(errorRoles.message);
    }

    /**
     * Create profile for employee
     */
    const profile = await profilesRepository.createProfile({
      employee_id: employee.id,
      email: email,
      full_name: fullName,
      gender: "other",
    });

    return {
      userId: userId,
      organizationId,
      employeeId: employee.id,
      employeeCode: employee.employee_code,
      employeeOrder: employee.employee_order,
      employeeType: employeeType,
      status: employee.status,
      account: {
        email: email,
      },
      profile: {
        email: profile.email,
        fullName: profile.full_name,
        gender: profile.gender,
      },
    };
  }

  private async generateEmployeeCode(type: "student" | "teacher") {
    const prefix = type === "student" ? "ST" : "GV";

    let employeeCode = "";
    let nextOrder = await employeesRepository.getLastEmployeeOrder();
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        nextOrder++;
        employeeCode = `${prefix}${String(nextOrder).padStart(6, "0")}`;
        const isExists = await employeesRepository.checkEmployeeCodeExists(employeeCode);
        if (isExists) continue;
        return employeeCode;
      } catch (err) {
        console.log(err, { employeeCode });
        continue;
      }
    }
    throw new DomainError("Failed to generate unique employee code", "FAIL_TO_GENERATE_CODE", 404);
  }
  private async getRootOrganizationId() {
    return process.env.NODE_ENV === "production"
      ? "a5d6011c-3d62-4392-98af-435fe614ee8d"
      : "a889a152-0e29-43f1-b13d-0a699c2112b0";
  }

  private async getDefaultRole(type: "teacher" | "student") {
    if (process.env.NODE_ENV === "production") {
      return type === "teacher" ? "d8d83b31-7dd0-497a-a2b5-1767ef4968b0" : "cf80f9a6-3362-496d-b158-93c4fc8b3a99";
    }

    return type === "teacher" ? "af09f332-0256-4361-b0dd-3524bb5ebdb2" : "91be4b67-e292-420d-b6e7-b4619eec077f";
  }
}

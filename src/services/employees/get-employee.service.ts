import dayjs from "dayjs";

import { DomainError } from "@/lib/errors/DomainError";
import { EmployeeType } from "@/model/employee.model";
import {
  employeeDepartmentsRepository,
  employeesRepository,
  libraryRepository,
  managersEmployeesRepository,
  organizationsRepository,
  profilesRepository,
  userPreferenceRepository,
} from "@/repository";
import { userRepository } from "@/repository";
import { employeeBranchesRepository } from "@/repository";
import { employeeRepository } from "@/repository";

import { GetEmployeesInput, GetEmployeesResult } from "./employee.dto";

export class GetEmployeeService {
  private organizationId: string;
  private maxPageSize = 30;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  async getList(input: GetEmployeesInput): Promise<GetEmployeesResult> {
    const { organizationId, branchId, departmentId, employeeType, filter } = input;

    const page = input?.page && input?.page > 0 ? input.page : 1;
    const pageSize = input?.pageSize && input.pageSize > 0 ? Math.min(input.pageSize, this.maxPageSize) : 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    if (!organizationId) {
      throw new DomainError("organizationId in not defined", "BAD_REQUEST", 400);
    }

    if (filter && filter.field && filter.field !== "email" && filter.field !== "code" && filter.field !== "name") {
      throw new DomainError("Filter field Invalid", "FILTER_FIELD_INVALID", 400);
    }

    const { data, count } = await employeesRepository.getEmployeesV2({
      from,
      to,
      branchId,
      departmentId,
      employeeType,
      organizationId: this.organizationId,
      filterField: filter?.field,
      filterValue: filter?.value,
    });

    const employeeItems = data.map<GetEmployeesResult["data"][number]>((item) => ({
      id: item.id,
      status: item.status,
      createdAt: item.created_at,
      department: item.employee_departments[0]
        ? {
            id: item.employee_departments[0].department_id,
            name: item.employee_departments[0].departments.name,
          }
        : null,
      profile: item.profiles
        ? {
            fullName: item.profiles.full_name,
            gender: item.profiles.gender,
            phoneNumber: item.profiles.phone_number,
            email: item.profiles.email,
            dob: item.profiles.birthday,
            avatar: item.profiles.avatar,
          }
        : null,
      branch: item.employee_branches[0]
        ? { id: item.employee_branches[0].branch_id, name: item.employee_branches[0].branches.name }
        : null,
      employeeCode: item.employee_code,
      type: item.employee_type,
    }));

    return {
      data: employeeItems,
      page,
      pageSize,
      total: count ?? 0,
    };
  }

  async getOneByEmployeeId(employeeId: string) {}
}

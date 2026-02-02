import { Employee, EmployeeType } from "@/model/employee.model";
import { Gender } from "@/model/profile.model";

export interface EmployeeParseItem {
  index: number;
  code: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  dateOfBirth: string;
  startDate: string;
  employeeType: EmployeeType;
}

export interface EmployeeParseItemWithValidate {
  index: number;
  code: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  dateOfBirth: string;
  startDate: string;
  employeeType: EmployeeType;
  errors?: { path: string; message: string }[];
  existedEmail: boolean;
  existedCode: boolean;
}

export type EmployeeHeaderRowKey =
  | "code"
  | "fullName"
  | "email"
  | "phoneNumber"
  | "gender"
  | "dateOfBirth"
  | "startDate"
  | "employeeType";

export interface CreateEmployeeInput {
  fullName: string;
  code?: string;
  email: string;
  type: EmployeeType;
  gender: Gender;
  startAt?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  departmentId?: string;
  branchId?: string;
  managerId?: string;
  roleId?: string;
}

export interface CreateEmployeeResult {
  id: string;
  userId: string;
  employeeCode?: string;
  profile: {
    fullName?: string;
    email?: string;
    gender: Gender;
    dateOfBirth?: string;
    phoneNumber?: string;
  };
  type: EmployeeType;
  startAt?: string;
  department?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  manager?: {
    id: string;
    name: string;
  };
  roles?: { id: string; name: string }[];
  createdAt: string;
  order?: number;
  status: Employee["status"];
}

export interface GetEmployeesInput {
  page?: number;
  pageSize?: number;
  organizationId?: string;
  branchId?: string;
  departmentId?: string;
  employeeType?: EmployeeType;
  filter?: {
    field?: "name" | "email" | "code";
    value?: string;
  };
}

interface EmployeeItem {
  id: string;
  employeeCode: string;
  type: EmployeeType | null;
  status: Employee["status"];
  profile: {
    fullName: string;
    email: string;
    gender: Gender;
    avatar: string | null;
    phoneNumber: string | null;
    dob: string | null;
  } | null;
  department: { id: string; name: string } | null;
  branch: { id: string; name: string } | null;
}
export interface GetEmployeesResult {
  page: number;
  pageSize: number;
  total: number;
  data: EmployeeItem[];
}

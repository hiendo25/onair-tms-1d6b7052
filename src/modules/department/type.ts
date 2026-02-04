import { HttpResponse } from "@/lib/api/http-status";
import {
  CreateChildDepartmentInput,
  CreateDepartmentResult,
  CreateRootDepartmentInput,
  GetDepartmentsInput,
  GetDepartmentsResult,
  UpdateChildDepartmentInput,
  UpdateDepartmentInput,
  UpdateDepartmentResult,
  UpdateRootDepartmentInput,
} from "@/services/departments/departments.dto";

export type CreateRootDepartmentPayload = CreateRootDepartmentInput & { type: "root" };
export type CreateChildDepartmentPayload = CreateChildDepartmentInput & { type: "children" };

export type CreateDepartmentResponse = HttpResponse<CreateDepartmentResult>;

export type GetDepartmentsQueryParams = GetDepartmentsInput;
export type GetDepartmentsResponse = HttpResponse<GetDepartmentsResult>;

export type UpdateRootDepartmentPayload = UpdateRootDepartmentInput & { type: "root" };

export type UpdateChildDepartmentPayload = UpdateChildDepartmentInput & { type: "children" };

export type UpdateDepartmentResponse = HttpResponse<UpdateDepartmentResult>;

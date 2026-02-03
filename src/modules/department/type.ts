import { HttpResponse } from "@/lib/api/http-status";
import {
  CreateChildDepartmentInput,
  CreateDepartmentResult,
  CreateRootDepartmentInput,
  GetDepartmentsInput,
  GetDepartmentsResult,
  UpdateDepartmentInput,
  UpdateDepartmentResult,
} from "@/services/departments/departments.dto";

export type CreateRootDepartmentPayload = CreateRootDepartmentInput & { type: "root" };
export type CreateChildDepartmentPayload = CreateChildDepartmentInput & { type: "children" };

export type CreateDepartmentResponse = HttpResponse<CreateDepartmentResult>;

export type GetDepartmentsQueryParams = GetDepartmentsInput;
export type GetDepartmentsResponse = HttpResponse<GetDepartmentsResult>;

export type UpdateRootDepartmentPayload = Pick<
  UpdateDepartmentInput,
  "id" | "branchId" | "code" | "managedById" | "name"
>;

export type UpdateChildDepartmentPayload = Pick<
  UpdateDepartmentInput,
  "id" | "parentId" | "code" | "managedById" | "name"
>;

export type UpdateDepartmentResponse = HttpResponse<UpdateDepartmentResult>;

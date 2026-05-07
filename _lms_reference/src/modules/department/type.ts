import { HttpResponse } from "@/lib/api/http-status";
import {
  CreateDepartmentGroupInput,
  CreateDepartmentGroupResult,
  CreateDepartmentResult,
  CreateRootDepartmentInput,
  CreateRootDepartmentResult,
  GetDepartmentGroupsByIdsResult,
  GetDepartmentsInput,
  GetDepartmentsResult,
  UpdateDepartmentGroupInput,
  UpdateDepartmentResult,
  UpdateRootDepartmentInput,
} from "@/services/departments/departments.dto";

export type CreateRootDepartmentPayload = CreateRootDepartmentInput & { type: "root" };
export type CreateDepartmentGroupPayload = CreateDepartmentGroupInput & { type: "group" };

export type CreateDepartmentResponse = HttpResponse<CreateDepartmentResult>;

export type CreateRootDepartmentResponse = HttpResponse<CreateRootDepartmentResult>;

export type CreateDepartmentGroupResponse = HttpResponse<CreateDepartmentGroupResult>;

export type GetDepartmentsQueryParams = GetDepartmentsInput;
export type GetDepartmentsResponse = HttpResponse<GetDepartmentsResult>;

export type UpdateRootDepartmentPayload = UpdateRootDepartmentInput & { type: "root" };

export type UpdateDepartmentGroupPayload = UpdateDepartmentGroupInput & { type: "group" };

export type UpdateDepartmentResponse = HttpResponse<UpdateDepartmentResult>;

export type GetDepartmentGroupsQueryParams = {
  departmentId: string;
};
export type GetDepartmentGroupsResponse = HttpResponse<GetDepartmentGroupsByIdsResult>;

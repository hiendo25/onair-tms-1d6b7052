import { HttpResponse } from "@/lib/api/http-status";
import {
  CreateBranchInput,
  CreateBranchResult,
  DeleteBranchResult,
  GetBranchesResult,
  UpdateBranchInput,
  UpdateBranchResult,
  UpdateBranchStatusInput,
  UpdateBranchStatusResult,
} from "@/services/branches/branches.dto";

export type CreateBranchPayload = CreateBranchInput;
export type CreateBranchItem = CreateBranchResult;
export type DeleteBranchItem = DeleteBranchResult;

export type CreateBranchResponse = HttpResponse<CreateBranchItem>;
export type DeleteBranchResponse = HttpResponse<DeleteBranchItem>;

export type GetBranchesQueryParams = {
  page?: number;
  pageSize?: number;
  fieldName?: "code" | "name";
  organizationId: string;
  fieldValue?: string;
  excludes?: string[];
};

export type GetBranchesResponse = HttpResponse<GetBranchesResult>;

export type UpdateBranchPayload = UpdateBranchInput;
export type UpdateBranchStatusPayload = UpdateBranchStatusInput;
export type UpdateBranchStatusResponse = HttpResponse<UpdateBranchStatusResult>;
export type UpdateBranchResponse = HttpResponse<UpdateBranchResult>;

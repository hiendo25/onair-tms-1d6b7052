import { HttpResponse } from "@/lib/api/http-status";
import {
  CreateLevelInput,
  CreateLevelResult,
  DeleteLevelResult,
  GetLevelsResult,
  UpdateLevelInput,
  UpdateLevelResult,
  UpdateLevelStatusInput,
  UpdateLevelStatusResult,
} from "@/services/gamifications/levels/levels.dto";

export type GetLevelsQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type GetLevelsResponse = HttpResponse<GetLevelsResult>;

export type UpdateLevelPayload = Omit<UpdateLevelInput, "organizationId">;
export type UpdateLevelResponse = HttpResponse<UpdateLevelResult>;

export type CreateLevelPayload = Omit<CreateLevelInput, "organizationId">;
export type CreateLevelResponse = HttpResponse<CreateLevelResult>;

export type UpdateLevelStatusPayload = UpdateLevelStatusInput;

export type UpdateLevelStatusResponse = HttpResponse<UpdateLevelStatusResult>;

export type DeleteLevelResponse = HttpResponse<DeleteLevelResult>;

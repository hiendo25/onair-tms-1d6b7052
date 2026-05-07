import { PaginationParams } from "../pagination.dto";

export interface GetDepartmentsParams extends PaginationParams {
  search?: string;
  organizationId: string;
  branchId?: string;
}

import { PaginationParams } from "../pagination.dto";

export interface GetBranchesParams extends PaginationParams {
  search?: string;
  organizationId: string;
}

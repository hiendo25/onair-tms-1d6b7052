import { PaginationParams } from "../pagination.dto";

export class GetAssignmentsParams extends PaginationParams {
  search?: string;
  createdBy?: string;
  organizationId?: string;
}

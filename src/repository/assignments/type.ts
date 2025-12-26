export type GetAssignmentsQueryParams = {
  page?: number;
  pageSize?: number;
  organizationId?: string;
  excludes?: string[];
  search?: string;
  createdBy?: string;
};

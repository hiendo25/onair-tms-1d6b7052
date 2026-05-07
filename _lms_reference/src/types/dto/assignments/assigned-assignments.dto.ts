export type AssignmentAssignedStatus = "completed" | "in_progress" | "not_started";

export interface AssignedAssignmentCategoryDto {
  id: string;
  name: string;
}

export interface AssignedAssignmentItemDto {
  assignment_id: string;
  assignment_name: string;
  assignment_description: string;
  available_to: string | null;
  categories: AssignedAssignmentCategoryDto[];
  assigned_count: number;
  completed_count: number;
  completion_percentage: number;
  status: AssignmentAssignedStatus;
}

export interface AssignedAssignmentsSummaryDto {
  total_assigned: number;
  total_completed: number;
}

export type AssignmentAssignedStatusFilter = AssignmentAssignedStatus;

export interface GetAssignedAssignmentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AssignmentAssignedStatusFilter;
  organizationId?: string;
}

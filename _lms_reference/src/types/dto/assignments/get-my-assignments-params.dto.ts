import type { Database } from "@/types/supabase.types";
import { PaginationParams } from "../pagination.dto";

export type MyAssignmentStatusFilter = Database["public"]["Enums"]["assignment_attempt_status"];

export class GetMyAssignmentsParams extends PaginationParams {
  search?: string;
  status?: MyAssignmentStatusFilter;
  organizationId!: string;
}

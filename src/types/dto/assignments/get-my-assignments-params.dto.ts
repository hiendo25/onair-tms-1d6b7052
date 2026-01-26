import type { Database } from "@/types/supabase.types";
import { PaginationParams } from "../pagination.dto";

export type MyAssignmentStatusFilter = "not_submitted" | Database["public"]["Enums"]["test_attempt_status"];

export class GetMyAssignmentsParams extends PaginationParams {
  search?: string;
  status?: MyAssignmentStatusFilter;
  organizationId!: string;
}

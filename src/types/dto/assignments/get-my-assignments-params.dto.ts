import { PaginationParams } from "../pagination.dto";
import type { Database } from "@/types/supabase.types";

export type MyAssignmentStatusFilter = "not_submitted" | Database["public"]["Enums"]["assignment_result_status"];

export class GetMyAssignmentsParams extends PaginationParams {
  search?: string;
  status?: MyAssignmentStatusFilter;
}


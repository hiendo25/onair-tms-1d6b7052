import { createClient } from "@/services/supabase/client";
import type { Database } from "@/types/supabase.types";

type LearningPath = Database["public"]["Tables"]["learning_paths"]["Row"];

export interface LearningPathWithCounts extends LearningPath {
  phase_count: number;
  employee_count: number;
}

export interface GetLearningPathsParams {
  organizationId: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetLearningPathsResult {
  data: LearningPathWithCounts[];
  total: number;
}

/**
 * Fetch all learning paths for an organization with phase count and employee count
 */
export const getLearningPaths = async (
  params: GetLearningPathsParams
): Promise<GetLearningPathsResult> => {
  const supabase = createClient();
  const { organizationId, page = 1, limit = 10, search } = params;
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Build the query with counts
  let query = supabase
    .from("learning_paths")
    .select(
      `
      id,
      name,
      description,
      thumbnail_url,
      created_at,
      updated_at,
      created_by,
      organization_id,
      learning_path_phases(count),
      employee_learning_paths(count)
    `,
      { count: "exact" }
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .range(from, to);

  // Apply search filter if provided
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch learning paths: ${error.message}`);
  }

  // Transform the data to include counts
  const learningPathsWithCounts: LearningPathWithCounts[] = (data || []).map((item: any) => {
    const { learning_path_phases, employee_learning_paths, ...rest } = item;
    
    return {
      ...rest,
      phase_count: learning_path_phases?.[0]?.count || 0,
      employee_count: employee_learning_paths?.[0]?.count || 0,
    };
  });

  return {
    data: learningPathsWithCounts,
    total: count || 0,
  };
};

/**
 * Get a single learning path by ID
 */
export const getLearningPathById = async (id: string): Promise<LearningPath | null> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch learning path: ${error.message}`);
  }

  return data;
};

/**
 * Delete a learning path by ID
 */
export const deleteLearningPath = async (id: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from("learning_paths")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete learning path: ${error.message}`);
  }
};


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

/**
 * Create a learning path with phases and assignments
 */
export interface CreateLearningPathParams {
  name: string;
  description?: string;
  thumbnail_url?: string;
  organization_id: string;
  created_by: string;
  metadata: {
    assignmentMode: "auto" | "manual";
    sequentialLearning: boolean;
    completionCriteria: number;
    deadlineType: "none" | "hours";
    deadlineHours?: number;
    allowRetake: boolean;
  };
  phases: Array<{
    order_index: number;
    description?: string;
    class_room_ids: string[];
  }>;
  assigned_employee_ids?: string[]; // For manual assignment mode
}

export interface CreateLearningPathResult {
  learning_path_id: string;
}

export const createLearningPath = async (
  params: CreateLearningPathParams
): Promise<CreateLearningPathResult> => {
  const supabase = createClient();

  // Start transaction by creating the learning path
  const { data: learningPath, error: learningPathError } = await supabase
    .from("learning_paths")
    .insert({
      name: params.name,
      description: params.description || null,
      thumbnail_url: params.thumbnail_url || null,
      organization_id: params.organization_id,
      created_by: params.created_by,
      metadata: params.metadata as any,
    })
    .select()
    .single();

  if (learningPathError || !learningPath) {
    throw new Error(`Failed to create learning path: ${learningPathError?.message || "Unknown error"}`);
  }

  // Create phases
  let createdPhases: any[] = [];

  if (params.phases.length > 0) {
    const phasesData = params.phases.map((phase) => ({
      learning_path_id: learningPath.id,
      order_index: phase.order_index,
      description: phase.description || null,
    }));

    const { data: phasesResult, error: phasesError } = await supabase
      .from("learning_path_phases")
      .insert(phasesData)
      .select();

    if (phasesError || !phasesResult) {
      // Rollback by deleting the learning path
      await supabase.from("learning_paths").delete().eq("id", learningPath.id);
      throw new Error(`Failed to create phases: ${phasesError?.message || "Unknown error"}`);
    }

    createdPhases = phasesResult;

    // Create phase-classroom associations
    const phaseClassRoomsData: Array<{
      phase_id: string;
      class_room_id: string;
      order_index: number;
    }> = [];

    params.phases.forEach((phase, phaseIdx) => {
      const createdPhase = createdPhases[phaseIdx];
      if (!createdPhase) {
        return; // Skip if phase wasn't created
      }
      phase.class_room_ids.forEach((classRoomId, classRoomIdx) => {
        phaseClassRoomsData.push({
          phase_id: createdPhase.id,
          class_room_id: classRoomId,
          order_index: classRoomIdx + 1,
        });
      });
    });

    if (phaseClassRoomsData.length > 0) {
      const { error: phaseClassRoomsError } = await supabase
        .from("phase_class_rooms")
        .insert(phaseClassRoomsData);

      if (phaseClassRoomsError) {
        // Rollback by deleting phases and learning path
        await supabase.from("learning_path_phases").delete().eq("learning_path_id", learningPath.id);
        await supabase.from("learning_paths").delete().eq("id", learningPath.id);
        throw new Error(`Failed to create phase classrooms: ${phaseClassRoomsError.message}`);
      }
    }
  }

  // Create employee assignments for manual mode
  if (params.metadata.assignmentMode === "manual" && params.assigned_employee_ids && params.assigned_employee_ids.length > 0) {
    const employeeAssignments = params.assigned_employee_ids.map((employeeId) => ({
      learning_path_id: learningPath.id,
      employee_id: employeeId,
    }));

    const { error: assignmentsError } = await supabase
      .from("employee_learning_paths")
      .insert(employeeAssignments);

    if (assignmentsError) {
      // Rollback everything
      if (createdPhases.length > 0) {
        const phaseIds = createdPhases.map(phase => phase?.id).filter(Boolean);
        if (phaseIds.length > 0) {
          await supabase.from("phase_class_rooms").delete().in("phase_id", phaseIds);
        }
      }
      await supabase.from("learning_path_phases").delete().eq("learning_path_id", learningPath.id);
      await supabase.from("learning_paths").delete().eq("id", learningPath.id);
      throw new Error(`Failed to create employee assignments: ${assignmentsError.message}`);
    }
  }

  return {
    learning_path_id: learningPath.id,
  };
};


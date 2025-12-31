import { createClient } from "@/services/supabase/client";
import type { Database } from "@/types/supabase.types";

import type {
  EmployeeLearningPathWithDetails,
  LearningPathMetadata,
  PhaseClassRoomWithDetails,
  PhaseInput,
  PhaseWithClassRooms,
} from "./types";

// Re-export shared types for convenience
export type {
  LearningPathMetadata,
  PhaseInput,
  EmployeeLearningPathWithDetails,
  PhaseClassRoomWithDetails,
  PhaseWithClassRooms,
} from "./types";

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
 * Get learning path with full details including phases and classrooms
 */
export interface LearningPathWithDetails extends LearningPathWithCounts {
  learning_path_phases: PhaseWithClassRooms[];
  employee_learning_paths: EmployeeLearningPathWithDetails[];
}

export const getLearningPathWithDetails = async (id: string): Promise<LearningPathWithDetails | null> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("learning_paths")
    .select(`
      *,
      learning_path_phases (
        id,
        learning_path_id,
        order_index,
        description,
        created_at,
        phase_class_rooms (
          id,
          phase_id,
          class_room_id,
          order_index,
          class_room:class_room_id (
            id,
            title,
            description,
            room_type,
            slug,
            class_sessions (
              id,
              title,
              start_at,
              end_at,
              session_type,
              channel_provider,
              class_sessions_courses_period (
                id,
                course_id,
                teacher_id,
                start_at,
                end_at,
                courses (
                  id,
                  title
                ),
                teacher:teacher_id (
                  id,
                  profiles!inner (
                    full_name
                  )
                )
              ),
              class_session_teacher (
                teacher_id,
                teacher:teacher_id (
                  id,
                  profiles!inner (
                    full_name
                  )
                )
              )
            )
          )
        ),
        phase_class_rooms_count:phase_class_rooms(count)
      ),
      employee_learning_paths (
        employee_id,
        employee:employee_id (
          id,
          employee_code,
          employee_type,
          profiles!inner (
            full_name,
            email,
            avatar
          )
        )
      ),
      learning_path_phases_count:learning_path_phases(count),
      employee_learning_paths_count:employee_learning_paths(count)
    `)
    .eq("id", id)
    .order("order_index", { foreignTable: "learning_path_phases", ascending: true })
    .order("order_index", { foreignTable: "learning_path_phases.phase_class_rooms", ascending: true })
    .single();

  if (error) {
    throw new Error(`Failed to fetch learning path details: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  type LearningPathWithDetailsQuery = LearningPath & {
    learning_path_phases: PhaseWithClassRoomsQuery[];
    employee_learning_paths: EmployeeLearningPathWithDetails[];
    learning_path_phases_count?: Array<{ count: number }> | null;
    employee_learning_paths_count?: Array<{ count: number }> | null;
  };

  type PhaseWithClassRoomsQuery = Omit<PhaseWithClassRooms, "phase_class_rooms_count"> & {
    phase_class_rooms_count?: Array<{ count: number }> | null;
  };

  const { learning_path_phases_count, employee_learning_paths_count, ...rest } =
    data as LearningPathWithDetailsQuery;

  const phasesWithCounts = rest.learning_path_phases.map((phase) => {
    const { phase_class_rooms_count, ...phaseRest } = phase;

    return {
      ...phaseRest,
      phase_class_rooms_count: phase_class_rooms_count?.[0]?.count || 0,
    };
  });

  return {
    ...rest,
    learning_path_phases: phasesWithCounts,
    phase_count: learning_path_phases_count?.[0]?.count || 0,
    employee_count: employee_learning_paths_count?.[0]?.count || 0,
  } as LearningPathWithDetails;
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
  metadata: LearningPathMetadata;
  phases: PhaseInput[];
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

/**
 * Update learning path with phases and assignments
 */
export interface UpdateLearningPathParams {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  metadata: LearningPathMetadata;
  phases: PhaseInput[];
  assigned_employee_ids?: string[]; // For manual assignment mode
}

export interface UpdateLearningPathResult {
  learning_path_id: string;
}

export const updateLearningPath = async (
  params: UpdateLearningPathParams
): Promise<UpdateLearningPathResult> => {
  const supabase = createClient();

  // Update the learning path
  const { data: learningPath, error: learningPathError } = await supabase
    .from("learning_paths")
    .update({
      name: params.name,
      description: params.description || null,
      thumbnail_url: params.thumbnail_url || null,
      metadata: params.metadata as any,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select()
    .single();

  if (learningPathError || !learningPath) {
    throw new Error(`Failed to update learning path: ${learningPathError?.message || "Unknown error"}`);
  }

  // Delete existing phases and their associations
  // First, get all phase IDs for this learning path
  const { data: existingPhases, error: fetchPhasesError } = await supabase
    .from("learning_path_phases")
    .select("id")
    .eq("learning_path_id", params.id);

  if (fetchPhasesError) {
    throw new Error(`Failed to fetch existing phases: ${fetchPhasesError.message}`);
  }

  // Delete phase classrooms if there are any phases
  if (existingPhases && existingPhases.length > 0) {
    const phaseIds = existingPhases.map((phase) => phase.id);
    const { error: deletePhaseClassRoomsError } = await supabase
      .from("phase_class_rooms")
      .delete()
      .in("phase_id", phaseIds);

    if (deletePhaseClassRoomsError) {
      throw new Error(`Failed to delete phase classrooms: ${deletePhaseClassRoomsError.message}`);
    }
  }

  // Delete phases
  const { error: deletePhasesError } = await supabase
    .from("learning_path_phases")
    .delete()
    .eq("learning_path_id", params.id);

  if (deletePhasesError) {
    throw new Error(`Failed to delete phases: ${deletePhasesError.message}`);
  }

  // Create new phases
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
        throw new Error(`Failed to create phase classrooms: ${phaseClassRoomsError.message}`);
      }
    }
  }

  // Update employee assignments
  // First, delete existing assignments
  const { error: deleteAssignmentsError } = await supabase
    .from("employee_learning_paths")
    .delete()
    .eq("learning_path_id", params.id);

  if (deleteAssignmentsError) {
    throw new Error(`Failed to delete existing employee assignments: ${deleteAssignmentsError.message}`);
  }

  // Create new assignments for manual mode
  if (params.metadata.assignmentMode === "manual" && params.assigned_employee_ids && params.assigned_employee_ids.length > 0) {
    const employeeAssignments = params.assigned_employee_ids.map((employeeId) => ({
      learning_path_id: learningPath.id,
      employee_id: employeeId,
    }));

    const { error: assignmentsError } = await supabase
      .from("employee_learning_paths")
      .insert(employeeAssignments);

    if (assignmentsError) {
      throw new Error(`Failed to create employee assignments: ${assignmentsError.message}`);
    }
  }

  return {
    learning_path_id: learningPath.id,
  };
};

/**
 * Get the current (most recently assigned) learning path for an employee
 */
export const getCurrentLearningPathForEmployee = async (employeeId: string): Promise<LearningPath | null> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("employee_learning_paths")
    .select(`
      learning_path:learning_path_id (
        id,
        name,
        description,
        thumbnail_url,
        organization_id,
        created_by,
        metadata,
        created_at,
        updated_at
      )
    `)
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch current learning path: ${error.message}`);
  }

  // Extract the learning_path object from the nested structure
  return data?.learning_path as LearningPath | null;
};

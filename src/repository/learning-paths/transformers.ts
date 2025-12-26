/**
 * Transformation utilities for learning paths
 * Centralizes logic for transforming between different data representations
 */

import type { LearningPathFormSchema } from "@/modules/learning-paths/learning-path-form.schema";

import type { LearningPathMetadata, PhaseInput } from "./types";

/**
 * Transform form data to metadata object for repository
 */
export function transformFormToMetadata(
  formData: LearningPathFormSchema
): LearningPathMetadata {
  return {
    assignmentMode: formData.info.assignmentMode,
    sequentialLearning: formData.settings?.sequentialLearning ?? false,
    completionCriteria: formData.settings?.completionCriteria ?? 80,
    deadlineType: formData.settings?.deadlineType ?? "none",
    deadlineHours: formData.settings?.deadlineHours,
    allowRetake: formData.settings?.allowRetake ?? false,
  };
}

/**
 * Transform form phases to repository phase input format
 */
export function transformFormPhasesToInput(
  phases: LearningPathFormSchema["phases"]
): PhaseInput[] {
  return phases.map((phase) => ({
    order_index: phase.order,
    description: phase.description || undefined,
    class_room_ids: phase.class_rooms.map((cr) => cr.id),
  }));
}

/**
 * Safely parse metadata from unknown data (for data from database)
 */
export function parseMetadata(metadata: unknown): LearningPathMetadata | null {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const obj = metadata as Record<string, unknown>;

  return {
    assignmentMode: obj.assignmentMode === "manual" ? "manual" : "auto",
    sequentialLearning: typeof obj.sequentialLearning === "boolean" ? obj.sequentialLearning : false,
    completionCriteria: typeof obj.completionCriteria === "number" ? obj.completionCriteria : 80,
    deadlineType: obj.deadlineType === "hours" ? "hours" : "none",
    deadlineHours: typeof obj.deadlineHours === "number" ? obj.deadlineHours : undefined,
    allowRetake: typeof obj.allowRetake === "boolean" ? obj.allowRetake : false,
  };
}

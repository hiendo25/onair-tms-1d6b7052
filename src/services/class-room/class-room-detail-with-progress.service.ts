import { getClassRoomBySlugServer } from "@/repository/class-room/server";
import type { ClassRoomProgressWithRelations } from "@/types/progress.types";

import {
  type ClassRoomDetailWithProgress,
  mapClassRoomCoursesProgress,
} from "./class-room-progress-mapping.service";
import { getClassRoomProgressWithRelations } from "./class-room-progress-with-relations.service";

export interface GetClassRoomDetailWithProgressParams {
  slug: string;
  employeeId: string;
  learningPathId?: string | null;
}

export async function getClassRoomDetailWithProgressBySlug(
  params: GetClassRoomDetailWithProgressParams,
): Promise<ClassRoomDetailWithProgress | null> {
  const trimmedSlug = params.slug?.trim();
  if (!trimmedSlug) {
    return null;
  }

  if (!params.employeeId) {
    throw new Error("Employee ID is required");
  }

  const normalizedLearningPathId = params.learningPathId?.trim()
    ? params.learningPathId
    : null;

  const classRoomResponse = await getClassRoomBySlugServer(trimmedSlug);
  if (classRoomResponse.error) {
    throw new Error(classRoomResponse.error.message);
  }

  if (!classRoomResponse.data) {
    return null;
  }

  if (!classRoomResponse.data.id) {
    return mapClassRoomCoursesProgress(classRoomResponse.data, null);
  }

  let progress: ClassRoomProgressWithRelations | null = null;

  if (normalizedLearningPathId) {
    try {
      progress = await getClassRoomProgressWithRelations({
        classRoomId: classRoomResponse.data.id,
        employeeId: params.employeeId,
        learningPathId: normalizedLearningPathId,
      });
    } catch (error) {
      console.error("[ClassRoom] Failed to fetch progress with relations:", error);
    }
  }

  return mapClassRoomCoursesProgress(classRoomResponse.data, progress);
}

"use client";

import { useMemo } from "react";

import { useGetClassRoomsPriorityQuery } from "@/modules/class-room-management/operations/query";
import type { ClassRoom } from "@/modules/learning-paths/learning-path-form.schema";

export interface UseClassRoomsForSelectionParams {
  organizationId: string;
  search?: string;
}

/**
 * Hook to fetch class-rooms for selection in learning path phases
 * Returns a simplified list with just id, name, code, description
 */
export function useClassRoomsForSelection({ organizationId, search }: UseClassRoomsForSelectionParams) {
  const { data, isLoading, error } = useGetClassRoomsPriorityQuery({
    organizationId,
    q: search,
    limit: 100, // Get more results for selection
    page: 1,
  });

  const classRooms: ClassRoom[] = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((room) => ({
      id: room.id!,
      name: room.title || "",
      code: room.slug || undefined,
      description: room.description || undefined,
    }));
  }, [data]);

  return {
    classRooms,
    isLoading,
    error,
    total: data?.total || 0,
  };
}


"use client";

import { useMemo } from "react";

import { useGetClassRoomsPriorityQuery } from "./query";

export interface ClassRoomForSelection {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

export interface UseClassRoomsForSelectionParams {
  organizationId?: string;
  employeeId?: string;
  search?: string;
}

/**
 * Hook to fetch class-rooms for selection in various features
 * (learning paths, courses, assignments, etc.)
 *
 * Returns a simplified list with just id, name, code, description
 * suitable for selection components like pickers, dropdowns, etc.
 *
 * This hook works for both admins and teachers:
 * - Admins: Pass organizationId to get all class-rooms in the organization
 * - Teachers: Pass employeeId to get only class-rooms assigned to that teacher
 *
 * @param organizationId - Filter class-rooms by organization (for admins)
 * @param employeeId - Filter class-rooms by employee/teacher (for teachers)
 * @param search - Optional search term to filter class-rooms
 * @returns Object containing classRooms array, loading state, error, and total count
 */
export function useClassRoomsForSelection({ organizationId, employeeId, search }: UseClassRoomsForSelectionParams) {
  const { data, isLoading, error } = useGetClassRoomsPriorityQuery({
    organizationId,
    employeeId,
    q: search,
    limit: 100, // Get more results for selection
    page: 1,
  });

  const classRooms: ClassRoomForSelection[] = useMemo(() => {
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


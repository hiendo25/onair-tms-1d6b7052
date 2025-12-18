"use client";

import { useMemo } from "react";

import { ClassSessionModeFilter } from "@/repository/class-room";

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
  sessionMode?: ClassSessionModeFilter;
}

export function useClassRoomsForSelection({
                                            organizationId,
                                            employeeId,
                                            search,
                                            sessionMode,
                                          }: UseClassRoomsForSelectionParams) {
  const { data, isLoading, error } = useGetClassRoomsPriorityQuery({
    organizationId,
    employeeId,
    q: search,
    limit: 100, // Get more results for selection
    page: 1,
    sessionMode,
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


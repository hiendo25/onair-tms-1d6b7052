"use client";

import { useMemo } from "react";

import { ClassSessionModeFilter } from "@/repository/class-room";
import { Database } from "@/types/supabase.types";

import { useGetClassRoomsPriorityQuery } from "./query";

export interface ClassRoomForSelection {
  id: string;
  name: string;
  code?: string;
  description?: string;
  room_type?: Database["public"]["Enums"]["class_room_type"];
  session_type?: Database["public"]["Enums"]["class_session_type"];
  sessions_count?: number;
  courses_count?: number;
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

    return data.data.map((room) => {
      // Get first session's session_type
      const firstSession = room.class_sessions?.[0];
      const sessionType = firstSession?.session_type as Database["public"]["Enums"]["class_session_type"] | undefined;

      // Count sessions
      const sessionsCount = room.class_sessions?.length || 0;

      let coursesCount = 0;
      room.class_sessions?.forEach((session) => {
        // @ts-ignore
        coursesCount += (session?.courses_period || 0).length;
      });

      return {
        id: room.id!,
        name: room.title || "",
        code: room.slug || undefined,
        description: room.description || undefined,
        room_type: room.room_type as Database["public"]["Enums"]["class_room_type"] | undefined,
        session_type: sessionType,
        sessions_count: sessionsCount,
        courses_count: coursesCount,
      };
    });
  }, [data]);

  return {
    classRooms,
    isLoading,
    error,
    total: data?.total || 0,
  };
}


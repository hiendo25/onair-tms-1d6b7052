"use client";

import { useMemo } from "react";

import { ClassType } from "@/model/enum-type.model";
import { ClassSessionModeFilter } from "@/repository/class-room";
import { ClassRoomSession } from "@/shared/ui/ClassRoomPicker/types";
import { Database } from "@/types/supabase.types";

import { useGetClassRoomsPriorityQuery } from "./query";

const DEFAULT_CLASS_TYPE: ClassType = "learning_path";

export interface ClassRoomForSelection {
  id: string;
  name: string;
  code?: string;
  description?: string;
  room_type?: Database["public"]["Enums"]["class_room_type"];
  session_type?: Database["public"]["Enums"]["class_session_type"];
  sessions_count?: number;
  courses_count?: number;
  sessions?: ClassRoomSession[];
}

export interface UseClassRoomsForSelectionParams {
  organizationId?: string;
  employeeId?: string;
  search?: string;
  sessionMode?: ClassSessionModeFilter;
  classType?: ClassType;
}

export function useClassRoomsForSelection({
                                            organizationId,
                                            employeeId,
                                            search,
                                            sessionMode,
                                            classType = DEFAULT_CLASS_TYPE,
                                          }: UseClassRoomsForSelectionParams) {
  const { data, isLoading, error } = useGetClassRoomsPriorityQuery({
    organizationId,
    employeeId,
    q: search,
    limit: 100, // Get more results for selection
    page: 1,
    sessionMode,
    classType,
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

      // Flatten sessions by course periods
      const sessions: ClassRoomSession[] = (room.class_sessions || []).flatMap((session) => {
        // @ts-ignore
        const coursePeriods = session?.courses_period || [];

        // If no course periods, return the session without course info
        if (coursePeriods.length === 0) {
          // Fallback to teacherAssignments
          // @ts-ignore
          const teacherAssignments = session?.teacherAssignments || [];
          const teacherFromAssignment = teacherAssignments[0]?.teacher;

          return [{
            id: session.id!,
            title: session.title || "",
            start_at: session.start_at || undefined,
            end_at: session.end_at || undefined,
            session_type: session.session_type as Database["public"]["Enums"]["class_session_type"] | undefined,
            channel_provider: session.channel_provider || undefined,
            course: undefined,
            teacher: teacherFromAssignment
              ? {
                  id: teacherFromAssignment.id || "",
                  full_name: teacherFromAssignment.profile?.full_name || "",
                }
              : undefined,
          }];
        }

        // Map each course period as a separate session
        return coursePeriods.map((cp: any) => {
          const teacherFromCoursePeriod = cp?.teacher;

          // Fallback to teacherAssignments if course period doesn't have teacher
          // @ts-ignore
          const teacherAssignments = session?.teacherAssignments || [];
          const teacherFromAssignment = teacherAssignments[0]?.teacher;

          // Prioritize teacher from courses_period, fallback to teacherAssignments
          const teacher = teacherFromCoursePeriod || teacherFromAssignment;

          return {
            id: `${session.id}-${cp?.id || Math.random()}`,
            title: session.title || "",
            start_at: cp?.start_at || session.start_at || undefined,
            end_at: cp?.end_at || session.end_at || undefined,
            session_type: session.session_type as Database["public"]["Enums"]["class_session_type"] | undefined,
            channel_provider: session.channel_provider || undefined,
            course: cp?.course
              ? {
                  id: cp.course.id || "",
                  title: cp.course.title || "",
                }
              : undefined,
            teacher: teacher
              ? {
                  id: teacher.id || "",
                  full_name: teacher.profile?.full_name || "",
                }
              : undefined,
          };
        });
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
        sessions,
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

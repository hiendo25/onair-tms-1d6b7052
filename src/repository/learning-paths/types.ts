/**
 * Shared types for learning paths module
 * This file contains all reusable type definitions to avoid duplication
 */

import type { Database } from "@/types/supabase.types";

/**
 * Learning path metadata configuration
 */
export interface LearningPathMetadata {
  assignmentMode: "auto" | "manual";
  sequentialLearning: boolean;
  completionCriteria: number;
  deadlineType: "none" | "hours";
  deadlineHours?: number;
  allowRetake: boolean;
}

/**
 * Phase definition for creating/updating learning paths
 */
export interface PhaseInput {
  order_index: number;
  description?: string;
  class_room_ids: string[];
}

/**
 * Employee with profile information for learning path assignment
 */
export interface EmployeeLearningPathWithDetails {
  employee_id: string;
  employee: {
    id: string;
    employee_code: string;
    employee_type: Database["public"]["Enums"]["employee_type"] | null;
    profiles: {
      full_name: string;
      email: string;
      avatar: string | null;
    };
  };
}

/**
 * Phase with class rooms and full details
 */
export interface PhaseClassRoomWithDetails {
  id: string;
  phase_id: string;
  class_room_id: string;
  order_index: number;
  class_room: {
    id: string;
    title: string | null;
    description: string | null;
    room_type: Database["public"]["Enums"]["class_room_type"] | null;
    slug: string | null;
    class_sessions: Array<{
      id: string;
      title: string | null;
      start_at: string | null;
      end_at: string | null;
      session_type: Database["public"]["Enums"]["class_session_type"] | null;
      channel_provider: Database["public"]["Enums"]["channel_provider"] | null;
      class_sessions_courses_period: Array<{
        id: number;
        course_id: string;
        teacher_id: string | null;
        start_at: string | null;
        end_at: string | null;
        courses: {
          id: string;
          title: string;
        };
        teacher: {
          id: string;
          profiles: {
            full_name: string;
          };
        } | null;
      }>;
      class_session_teacher: Array<{
        teacher_id: string;
        teacher: {
          id: string;
          profiles: {
            full_name: string;
          };
        };
      }>;
    }>;
  };
}

/**
 * Phase with class rooms
 */
export interface PhaseWithClassRooms {
  id: string;
  learning_path_id: string;
  order_index: number | null;
  description: string | null;
  created_at: string;
  phase_class_rooms: PhaseClassRoomWithDetails[];
  phase_class_rooms_count?: number;
}

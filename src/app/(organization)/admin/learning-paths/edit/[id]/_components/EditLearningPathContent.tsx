"use client";

import { useMemo } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import LearningPathForm from "@/app/(organization)/admin/learning-paths/create/_components/LearningPathForm";
import { PATHS } from "@/constants/path.constant";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import type { LearningPathFormSchema } from "@/modules/learning-paths/learning-path-form.schema";
import { useUpdateLearningPathMutation } from "@/modules/learning-paths/operations/mutation";
import { useGetLearningPathQuery } from "@/modules/learning-paths/operations/query";
import type { LearningPathWithDetails } from "@/repository/learning-paths";
import { parseMetadata } from "@/repository/learning-paths/transformers";
import PageContainer from "@/shared/ui/PageContainer";

interface EditLearningPathContentProps {
  learningPathId: string;
}

/**
 * Transform API data to form data structure
 */
function transformLearningPathToFormData(
  learningPath: LearningPathWithDetails
): Partial<LearningPathFormSchema> {
  const metadata = parseMetadata(learningPath.metadata);

  return {
    info: {
      name: learningPath.name,
      description: learningPath.description || "",
      thumbnail: learningPath.thumbnail_url || null,
      assignmentMode: metadata?.assignmentMode || "auto",
      assignedEmployees: learningPath.employee_learning_paths?.map((emp) => ({
        id: emp.employee.id,
        fullName: emp.employee.profiles.full_name,
        email: emp.employee.profiles.email,
        employeeCode: emp.employee.employee_code,
        avatar: emp.employee.profiles.avatar || undefined,
        empoyeeType: emp.employee.employee_type || undefined,
      })) || [],
    },
    phases: learningPath.learning_path_phases?.map((phase) => ({
      id: phase.id,
      order: phase.order_index ?? 0,
      description: phase.description || "",
      class_rooms: phase.phase_class_rooms?.map((pcr) => {
        const dbSessions = pcr.class_room.class_sessions || [];
        const firstSession = dbSessions[0];
        const sessionType = firstSession?.session_type;

        // Calculate courses count
        let coursesCount = 0;
        dbSessions.forEach((session) => {
          coursesCount += (session.class_sessions_courses_period || []).length;
        });

        // Define session type for consistency
        type SessionItem = {
          id: string;
          title: string;
          start_at?: string;
          end_at?: string;
          session_type?: string;
          channel_provider?: string;
          course?: {
            id: string;
            title: string;
          };
          teacher?: {
            id: string;
            full_name: string;
          };
        };

        // Flatten sessions by course periods (same logic as useClassRoomsForSelection)
        const sessions: SessionItem[] = dbSessions.flatMap((session): SessionItem[] => {
          const coursePeriods = session.class_sessions_courses_period || [];

          // If no course periods, return the session without course info
          if (coursePeriods.length === 0) {
            // Fallback to teacher assignments
            const teacherAssignments = session.class_session_teacher || [];
            const teacherFromAssignment = teacherAssignments[0]?.teacher;

            return [{
              id: session.id,
              title: session.title || "",
              start_at: session.start_at || undefined,
              end_at: session.end_at || undefined,
              session_type: session.session_type || undefined,
              channel_provider: session.channel_provider || undefined,
              course: undefined,
              teacher: teacherFromAssignment
                ? {
                    id: teacherFromAssignment.id,
                    full_name: teacherFromAssignment.profiles.full_name,
                  }
                : undefined,
            }];
          }

          // Map each course period as a separate session
          return coursePeriods.map((cp): SessionItem => {
            const teacherFromCoursePeriod = cp.teacher;

            // Fallback to teacher assignments if course period doesn't have teacher
            const teacherAssignments = session.class_session_teacher || [];
            const teacherFromAssignment = teacherAssignments[0]?.teacher;

            // Prioritize teacher from courses_period, fallback to teacher assignments
            const teacher = teacherFromCoursePeriod || teacherFromAssignment;

            return {
              id: `${session.id}-${cp.id}`,
              title: session.title || "",
              start_at: cp.start_at || session.start_at || undefined,
              end_at: cp.end_at || session.end_at || undefined,
              session_type: session.session_type || undefined,
              channel_provider: session.channel_provider || undefined,
              course: {
                id: cp.courses.id,
                title: cp.courses.title,
              },
              teacher: teacher
                ? {
                    id: teacher.id,
                    full_name: teacher.profiles.full_name,
                  }
                : undefined,
            };
          });
        });

        return {
          id: pcr.class_room.id,
          name: pcr.class_room.title || "",
          code: pcr.class_room.slug || undefined,
          description: pcr.class_room.description || undefined,
          room_type: (pcr.class_room.room_type as string) || undefined,
          session_type: (sessionType as string) || undefined,
          sessions_count: dbSessions.length,
          courses_count: coursesCount,
          sessions,
        };
      }) || [],
    })) || [],
    settings: {
      sequentialLearning: metadata?.sequentialLearning ?? false,
      completionCriteria: metadata?.completionCriteria ?? 80,
      deadlineType: metadata?.deadlineType || "none",
      deadlineHours: metadata?.deadlineHours,
      allowRetake: metadata?.allowRetake ?? false,
    },
  };
}

export default function EditLearningPathContent({ learningPathId }: EditLearningPathContentProps) {
  const router = useRouter();
  const notifications = useNotifications();
  const { data, isLoading, isError, error } = useGetLearningPathQuery(learningPathId);
  const { mutateAsync: updateLearningPath, isPending } = useUpdateLearningPathMutation();

  const initialData = useMemo(() => {
    if (!data?.data) return undefined;
    return transformLearningPathToFormData(data.data);
  }, [data]);

  const handleSubmit = async (formData: LearningPathFormSchema) => {
    try {
      const result = await updateLearningPath({
        id: learningPathId,
        data: formData,
      });
      notifications.show(result.message || "Cập nhật lộ trình học tập thành công!", {
        severity: "success",
      });
      router.push(PATHS.LEARNING_PATHS.ROOT);
    } catch (error) {
      // Error is already thrown by mutation, just rethrow it
      throw error;
    }
  };

  if (isLoading) {
    return (
      <PageContainer
        title="Chỉnh sửa lộ trình học tập"
        breadcrumbs={[
          { title: "Lộ trình học tập", path: PATHS.LEARNING_PATHS.ROOT },
          { title: "Chỉnh sửa lộ trình học tập" },
        ]}
      >
        <Box
          sx={{
            background: "white",
            borderRadius: 2,
            p: { xs: 2.5, md: 3 },
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer
        title="Chỉnh sửa lộ trình học tập"
        breadcrumbs={[
          { title: "Lộ trình học tập", path: PATHS.LEARNING_PATHS.ROOT },
          { title: "Chỉnh sửa lộ trình học tập" },
        ]}
      >
        <Box
          sx={{
            background: "white",
            borderRadius: 2,
            p: { xs: 2.5, md: 3 },
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" color="error">
            {error instanceof Error ? error.message : "Có lỗi xảy ra khi tải dữ liệu"}
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Chỉnh sửa lộ trình học tập"
      breadcrumbs={[
        { title: "Lộ trình học tập", path: PATHS.LEARNING_PATHS.ROOT },
        { title: "Chỉnh sửa lộ trình học tập" },
      ]}
    >
      <LearningPathForm
        mode="edit"
        learningPathId={learningPathId}
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </PageContainer>
  );
}


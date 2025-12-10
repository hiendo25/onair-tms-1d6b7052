"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { useGetPlanCourseOptionsQuery } from "@/modules/plans/operations/query";
import { useCreatePlanDraftCourseMutation } from "@/modules/plans/operations/mutation";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { usePlanFormContext } from "@/modules/plans/use-plan-form-context";
import { useSnackbar } from "notistack";
import CreateCourseDialog from "./CreateCourseDialog";
import ProgramCard from "./ProgramCard";

interface StepAssignCoursesProps {
  onBack: () => void;
  onContinue: () => void;
  isLoading?: boolean;
}

export default function StepAssignCourses({
  onBack,
  onContinue,
  isLoading = false,
}: StepAssignCoursesProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { control } = usePlanFormContext();
  const organizationId = useUserOrganization((state) => state.data.organization.id);
  const userId = useUserOrganization((state) => state.data.id);
  const { data: availableCourses = [] } = useGetPlanCourseOptionsQuery(organizationId);
  const { mutateAsync: createDraftCourse, isPending: isCreatingCourse } = useCreatePlanDraftCourseMutation();
  const { fields: programs } = useFieldArray({
    control,
    name: "programs",
  });

  const handleCreateCourse = async (course: { title: string; description?: string }) => {
    if (!organizationId || !userId) {
      enqueueSnackbar("Thiếu thông tin tổ chức hoặc người dùng để tạo môn học.", { variant: "error" });
      return;
    }

    try {
      await createDraftCourse({
        organizationId,
        createdBy: userId,
        title: course.title,
        description: course.description,
      });
      enqueueSnackbar("Đã tạo môn học nháp. Cần hoàn thiện tài liệu trước khi xuất bản.", { variant: "success" });
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Không thể tạo môn học nháp", { variant: "error" });
    }
  };

  return (
    <Card sx={{ boxShadow: "0 14px 44px rgba(9, 30, 66, 0.08)", border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box>
            <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: 0.6 }}>
              Bước 4
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Gán môn học
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Gán môn học cho từng chủ đề hoặc trực tiếp vào chương trình khi sẵn sàng.
              Bạn có thể bỏ qua nếu chưa cần gán môn.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => setIsCreateDialogOpen(true)}
              disabled={isLoading}
            >
              Tạo môn học nháp
            </Button>
            <Chip label="Tùy chọn" color="default" variant="outlined" size="small" />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          {programs.map((program, programIndex) => (
            <ProgramCard
              key={program.id}
              program={program}
              programIndex={programIndex}
              availableCourses={availableCourses}
            />
          ))}
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onBack}
            disabled={isLoading}
          >
            Quay lại
          </Button>
          <Button
            variant="contained"
            onClick={onContinue}
            disabled={isLoading}
          >
            Tiếp tục
          </Button>
        </Box>
      </CardContent>
      <CreateCourseDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateCourse={handleCreateCourse}
        isSubmitting={isCreatingCourse}
      />
    </Card>
  );
}

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
import { useFieldArray } from "react-hook-form";
import { useGetPlanCourseOptionsQuery } from "@/modules/plans/operations/query";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { usePlanFormContext } from "@/modules/plans/use-plan-form-context";
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
  const { control } = usePlanFormContext();
  const organizationId = useUserOrganization((state) => state.data.organization.id);
  const { data: availableCourses = [] } = useGetPlanCourseOptionsQuery(organizationId);
  const { fields: programs } = useFieldArray({
    control,
    name: "programs",
  });

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
              Gán môn học cho từng chủ đề hoặc trực tiếp vào chương trình.
            </Typography>
          </Box>
          <Chip label="Bắt buộc trước khi gửi duyệt" color="primary" variant="outlined" size="small" />
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
    </Card>
  );
}

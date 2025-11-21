"use client";

import { Card, CardContent, Typography } from "@mui/material";
import { Control, FieldErrors } from "react-hook-form";
import { PlanFormSchema } from "@/modules/plans/plan-form.schema";

interface StepAssignCoursesProps {
  control: Control<PlanFormSchema>;
  errors: FieldErrors<PlanFormSchema>;
}

export default function StepAssignCourses({
  control,
  errors,
}: StepAssignCoursesProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Bước 5: Gán môn học
        </Typography>
        <Typography color="text.secondary">
          Coming soon...
        </Typography>
      </CardContent>
    </Card>
  );
}


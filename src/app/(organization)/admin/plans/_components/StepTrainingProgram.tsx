"use client";

import { Card, CardContent, Typography } from "@mui/material";
import { Control, FieldErrors } from "react-hook-form";
import { PlanFormSchema } from "@/modules/plans/plan-form.schema";

interface StepTrainingProgramProps {
  control: Control<PlanFormSchema>;
  errors: FieldErrors<PlanFormSchema>;
}

export default function StepTrainingProgram({
  control,
  errors,
}: StepTrainingProgramProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Bước 2: Chương trình đào tạo
        </Typography>
        <Typography color="text.secondary">
          Coming soon...
        </Typography>
      </CardContent>
    </Card>
  );
}


"use client";

import { Card, CardContent, Typography } from "@mui/material";
import { Control, FieldErrors } from "react-hook-form";

import { PlanFormSchema } from "@/modules/plans/plan-form.schema";

interface StepTopicsProps {
  control: Control<PlanFormSchema>;
  errors: FieldErrors<PlanFormSchema>;
}

export default function StepTopics({
  control,
  errors,
}: StepTopicsProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Bước 3: Chủ đề
        </Typography>
        <Typography color="text.secondary">
          Coming soon...
        </Typography>
      </CardContent>
    </Card>
  );
}


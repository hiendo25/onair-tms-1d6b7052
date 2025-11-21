"use client";

import { Card, CardContent, Typography } from "@mui/material";
import { Control, FieldErrors } from "react-hook-form";
import { PlanFormSchema } from "@/modules/plans/plan-form.schema";

interface StepApprovalProps {
  control: Control<PlanFormSchema>;
  errors: FieldErrors<PlanFormSchema>;
}

export default function StepApproval({
  control,
  errors,
}: StepApprovalProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Bước 4: Gửi duyệt đề xuất
        </Typography>
        <Typography color="text.secondary">
          Coming soon...
        </Typography>
      </CardContent>
    </Card>
  );
}


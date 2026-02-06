import React, { memo } from "react";
import { Card, Stack, Typography } from "@mui/material";

import type { StudentSelectedItem } from "@/modules/class-room-management/store/class-room-store";
import StudentDataTransfer from "@/modules/student/container/StudentsDataTransfer";

interface AssignmentBankAssignEmployeeCardProps {
  selectedEmployees: StudentSelectedItem[];
  onChange: (employees: StudentSelectedItem[]) => void;
  errorMessage?: string;
}

const AssignmentBankAssignEmployeeCard = ({
  selectedEmployees,
  onChange,
  errorMessage,
}: AssignmentBankAssignEmployeeCardProps) => {
  return (
    <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", boxShadow: "none" }}>
      <Stack spacing={2} sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
          Giao bài kiểm tra
        </Typography>
        <StudentDataTransfer selectedItems={selectedEmployees} onChange={onChange} />
        {errorMessage ? (
          <Typography variant="caption" color="error">
            {errorMessage}
          </Typography>
        ) : null}
      </Stack>
    </Card>
  );
};

export default memo(AssignmentBankAssignEmployeeCard);

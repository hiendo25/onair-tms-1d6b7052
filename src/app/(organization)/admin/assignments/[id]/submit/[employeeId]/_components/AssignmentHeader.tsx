import * as React from "react";
import { Box, Typography, Stack } from "@mui/material";
import type { AssignmentDto } from "@/types/dto/assignments";
import type { EmployeeDto } from "@/types/dto/employees";

interface AssignmentHeaderProps {
  assignment?: AssignmentDto;
  employee?: EmployeeDto;
}

export default function AssignmentHeader({ assignment, employee }: AssignmentHeaderProps) {
  if (!assignment && !employee) {
    return null;
  }

  return (
    <Box sx={{ mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
      {assignment && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          {assignment.name}
        </Typography>
      )}
      {employee && (
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Học viên:
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {employee.profiles?.full_name} ({employee.employee_code})
          </Typography>
        </Stack>
      )}
    </Box>
  );
}


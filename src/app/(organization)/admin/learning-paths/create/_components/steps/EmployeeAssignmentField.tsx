"use client";

import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import Stack from "@mui/material/Stack";
import { Control, useController } from "react-hook-form";

import { StudentSelectedItem } from "@/modules/class-room-management/store/class-room-store";
import type { EmployeeItem, LearningPathFormSchema } from "@/modules/learning-paths/learning-path-form.schema";
import StudentDataTransfer from "@/modules/student/container/StudentsDataTransfer";

export interface EmployeeAssignmentFieldProps {
  control: Control<LearningPathFormSchema>;
}

const ASSIGNMENT_MODE = {
  AUTO: "auto",
  MANUAL: "manual",
} as const;

export default function EmployeeAssignmentField({ control }: EmployeeAssignmentFieldProps) {
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);

  // Controller for assignment mode
  const {
    field: { value: mode, onChange: onModeChange },
  } = useController({ control, name: "info.assignmentMode" });

  // Controller for assigned employees
  const {
    field: { value: assignedEmployees, onChange: onEmployeesChange },
    fieldState: { error: assignedEmployeesError },
  } = useController({ control, name: "info.assignedEmployees" });

  const normalizedAssignedEmployees = assignedEmployees ?? [];
  const assignedEmployeeCount = normalizedAssignedEmployees.length;
  const isManualMode = mode === ASSIGNMENT_MODE.MANUAL;

  const handleEmployeeChange = (students: StudentSelectedItem[]) => {
    // Convert StudentSelectedItem to EmployeeItem
    const employees: EmployeeItem[] = students.map((student) => ({
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      employeeCode: student.employeeCode,
      avatar: student.avatar || undefined,
      employeeType: student.employeeType,
    }));
    onEmployeesChange(employees);
  };

  const handleRemoveEmployee = (employeeId: string) => {
    if (!normalizedAssignedEmployees.length) return;

    const nextEmployees = normalizedAssignedEmployees.filter((employee) => employee.id !== employeeId);
    if (nextEmployees.length === normalizedAssignedEmployees.length) return;

    onEmployeesChange(nextEmployees);
  };

  const handleConfirmSelection = () => {
    setShowEmployeeDialog(false);
  };

  const handleCloseDialog = () => {
    setShowEmployeeDialog(false);
  };

  return (
    <>
      <FormControl component="fieldset" error={isManualMode && Boolean(assignedEmployeesError)}>
        <FormLabel component="legend" required sx={{ mb: 2 }}>
          Đối tượng áp dụng
        </FormLabel>

        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <RadioGroup
            value={mode}
            onChange={(e) => {
              onModeChange(e.target.value);
              // Clear assigned employees when switching to auto mode
              if (e.target.value === ASSIGNMENT_MODE.AUTO) {
                onEmployeesChange([]);
              }
            }}
          >
            <FormControlLabel
              value={ASSIGNMENT_MODE.MANUAL}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Gán thủ công
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              value={ASSIGNMENT_MODE.AUTO}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Gán tự động
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
          <Box>
            <Box>
              <Button variant="fill" onClick={() => setShowEmployeeDialog(true)} disabled={!isManualMode}>
                Chọn học viên
              </Button>
            </Box>
          </Box>
        </Stack>

        {/* If auto mode, show text 'Tất cả học viên' */}
        {mode === ASSIGNMENT_MODE.AUTO && (
          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2, mt: 1 }}>
            <Typography variant="subtitle2">Gán người mới tự động</Typography>

            <Typography variant="body2" color="text.secondary">
              Tự động gán học viên mới vào lộ trình này
            </Typography>
          </Box>
        )}

        {isManualMode && (
          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2, mt: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2">Học viên đã chọn</Typography>
              <FormHelperText error={false} sx={{ m: 0 }}>
                {`${assignedEmployeeCount} học viên`}
              </FormHelperText>
            </Box>

            {!assignedEmployeeCount ? (
              <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                <PersonAddIcon fontSize="small" />
                <Typography variant="body2">Chưa chọn học viên. Vui lòng bấm "Chọn học viên".</Typography>
              </Box>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {normalizedAssignedEmployees.map((employee) => (
                  <Chip
                    key={employee.id}
                    label={`${employee.employeeCode} - ${employee.fullName}`}
                    onDelete={() => handleRemoveEmployee(employee.id)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            )}

            {assignedEmployeesError?.message && (
              <FormHelperText error sx={{ mt: 1 }}>
                {assignedEmployeesError.message}
              </FormHelperText>
            )}
          </Box>
        )}
      </FormControl>

      {/* Employee Selection Dialog */}
      <Dialog
        open={showEmployeeDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: "90vh",
            maxHeight: "800px",
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" component="div">
              Chọn học viên
            </Typography>
            <IconButton edge="end" color="inherit" onClick={handleCloseDialog} aria-label="close" size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <StudentDataTransfer
            selectedItems={normalizedAssignedEmployees.map((emp: EmployeeItem) => ({
              id: emp.id,
              fullName: emp.fullName,
              email: emp.email,
              employeeCode: emp.employeeCode,
              avatar: emp.avatar || null,
              employeeType: emp.employeeType as "student",
            }))}
            onChange={handleEmployeeChange}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">
            Hủy
          </Button>
          <Button onClick={handleConfirmSelection} variant="contained">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

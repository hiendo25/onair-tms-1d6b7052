"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Control, FieldErrors, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { PlanFormSchema, TrainingProgram, trainingProgramSchema } from "@/modules/plans/plan-form.schema";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFDatePicker from "@/shared/ui/form/RHFDatePicker";
import dayjs, { Dayjs } from "dayjs";

interface StepTrainingProgramProps {
  control: Control<PlanFormSchema>;
  errors: FieldErrors<PlanFormSchema>;
  onContinue: () => void;
}

export default function StepTrainingProgram({
  control,
  errors,
  onContinue,
}: StepTrainingProgramProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "programs",
  });

  const programForm = useForm<TrainingProgram>({
    resolver: zodResolver(trainingProgramSchema),
    defaultValues: {
      name: "",
      startDate: undefined,
      endDate: undefined,
      description: "",
      topics: [],
    },
  });

  const handleShowForm = () => {
    programForm.reset({
      name: "",
      startDate: "",
      endDate: "",
      description: "",
      topics: [],
    });
    setEditingIndex(null);
    setShowForm(true);
  };

  const handleEditProgram = (index: number) => {
    const program = fields[index];
    programForm.reset(program);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingIndex(null);
    programForm.reset();
  };

  const handleSaveProgram = programForm.handleSubmit((data) => {
    if (editingIndex !== null) {
      update(editingIndex, data);
    } else {
      append(data);
    }
    handleCancelForm();
  });

  const handleDeleteProgram = (index: number) => {
    remove(index);
  };

  const formatDateRange = (startDate?: string | Dayjs, endDate?: string | Dayjs) => {
    if (!startDate || !endDate) return null;

    // Convert to Dayjs if it's a string, or use directly if it's already a Dayjs object
    const start = typeof startDate === "string" ? dayjs(startDate) : startDate;
    const end = typeof endDate === "string" ? dayjs(endDate) : endDate;

    if (!start.isValid() || !end.isValid()) return null;
    return `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Bước 2: Chương trình đào tạo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Có ít nhất 1 chương trình đào tạo
        </Typography>

        <Stack spacing={2}>
          {/* Program List - Render form inline when editing */}
          {fields.map((field, index) => {
            const dateRange = formatDateRange(field.startDate, field.endDate);
            const isEditing = editingIndex === index;

            // If this program is being edited, show the edit form instead of the card
            if (isEditing) {
              return (
                <Box
                  key={field.id}
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "common.white",
                  }}
                >
                  <Stack spacing={2}>
                    <RHFTextField
                      control={programForm.control}
                      name="name"
                      label="Tên chương trình"
                      placeholder="VD: Kế hoạch đào tạo 2026 cho khối B2B Edtech"
                      required
                    />

                    <RHFTextAreaField
                      control={programForm.control}
                      name="description"
                      label="Thông tin mô tả"
                      placeholder="Mô tả mục tiêu ngắn của kế hoạch đào tạo"
                      minRows={3}
                      maxRows={6}
                    />

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}>
                          Ngày bắt đầu
                        </Typography>
                        <RHFDatePicker
                          control={programForm.control}
                          name="startDate"
                          placeholder="22/12/2025"
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}>
                          Ngày kết thúc
                        </Typography>
                        <RHFDatePicker
                          control={programForm.control}
                          name="endDate"
                          placeholder="22/12/2026"
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-start" }}>
                      <Button
                        onClick={handleSaveProgram}
                        variant="contained"
                        size="medium"
                      >
                        Lưu chương trình
                      </Button>
                      <Button
                        onClick={handleCancelForm}
                        variant="outlined"
                        size="medium"
                      >
                        Hủy
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              );
            }

            // Otherwise, show the program card
            return (
              <Box
                key={field.id}
                sx={{
                  p: 2.5,
                  border: "1px solid",
                  borderColor: "#1976d2",
                  borderRadius: 1,
                  bgcolor: "#e3f2fd",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      fontSize: "1rem",
                      color: "text.primary",
                    }}
                  >
                    {field.name}
                  </Typography>
                  {dateRange && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.875rem",
                      }}
                    >
                      {dateRange}
                    </Typography>
                  )}
                  {field.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        color: "text.secondary",
                        fontSize: "0.875rem",
                      }}
                    >
                      {field.description}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditProgram(index)}
                    sx={{
                      color: "text.secondary",
                      "&:hover": {
                        color: "text.primary",
                        bgcolor: "rgba(0, 0, 0, 0.04)",
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteProgram(index)}
                    sx={{
                      color: "text.secondary",
                      "&:hover": {
                        color: "error.main",
                        bgcolor: "rgba(0, 0, 0, 0.04)",
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            );
          })}

          {/* Inline Add Form - Show at bottom when adding new program (not editing) */}
          {showForm && editingIndex === null && (
            <Box
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "common.white",
              }}
            >
              <Stack spacing={2}>
                <RHFTextField
                  control={programForm.control}
                  name="name"
                  label="Tên chương trình"
                  placeholder="VD: Kế hoạch đào tạo 2026 cho khối B2B Edtech"
                  required
                />

                <RHFTextAreaField
                  control={programForm.control}
                  name="description"
                  label="Thông tin mô tả"
                  placeholder="Mô tả mục tiêu ngắn của kế hoạch đào tạo"
                  minRows={3}
                  maxRows={6}
                />

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}>
                      Ngày bắt đầu
                    </Typography>
                    <RHFDatePicker
                      control={programForm.control}
                      name="startDate"
                      placeholder="22/12/2025"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}>
                      Ngày kết thúc
                    </Typography>
                    <RHFDatePicker
                      control={programForm.control}
                      name="endDate"
                      placeholder="22/12/2026"
                    />
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-start" }}>
                  <Button
                    onClick={handleSaveProgram}
                    variant="contained"
                    size="medium"
                  >
                    Lưu chương trình
                  </Button>
                  <Button
                    onClick={handleCancelForm}
                    variant="outlined"
                    size="medium"
                  >
                    Hủy
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Add Program Button - Only show when form is not visible */}
          {!showForm && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleShowForm}
              sx={{
                py: 1.5,
                bgcolor: "common.white",
                borderRadius: 1,
                borderColor: "text.primary",
                color: "text.primary",
              }}
            >
              Thêm chương trình
            </Button>
          )}

          {errors.programs?.message && (
            <Typography color="error" variant="body2">
              {errors.programs.message}
            </Typography>
          )}
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button variant="contained" onClick={onContinue}>
            Tiếp tục
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}


"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EventNoteIcon from "@mui/icons-material/EventNote";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { TrainingProgram, trainingProgramSchema } from "@/modules/plans/plan-form.schema";
import { usePlanFormContext } from "@/modules/plans/use-plan-form-context";
import RHFDateTimePicker from "@/shared/ui/form/RHFDateTimePicker";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { formatDateRange } from "../../helper";

interface StepTrainingProgramProps {
  onContinue: () => void;
}

export default function StepTrainingProgram({
  onContinue,
}: StepTrainingProgramProps) {
  const {
    control,
    formState: { errors },
  } = usePlanFormContext();
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
      courses: [],
    },
  });

  const infoEndDate = useWatch({
    control: control,
    name: "info.endDate",
  });

  const infoStartDate = useWatch({
    control: control,
    name: "info.startDate",
  });

  const programStartDate = useWatch({
    control: programForm.control,
    name: "startDate",
  });

  const handleShowForm = () => {
    programForm.reset({
      name: "",
      startDate: undefined,
      endDate: undefined,
      description: "",
      topics: [],
      courses: [],
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
      const current = fields[editingIndex];
      update(editingIndex, {
        ...current,
        ...data,
        topics: current?.topics || [],
        courses: current?.courses || [],
      });
    } else {
      append({
        ...data,
        topics: data.topics || [],
        courses: data.courses || [],
      });
    }
    handleCancelForm();
  });

  const handleDeleteProgram = (index: number) => {
    remove(index);
  };

  const renderProgramForm = (actionLabel: string) => (
    <Box
      sx={{
        p: 3,
        border: "1px dashed",
        borderColor: "primary.200",
        borderRadius: 2,
        bgcolor: "primary.50",
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

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <Box>
            <Typography sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}>
              Ngày bắt đầu
            </Typography>
            <RHFDateTimePicker
              control={programForm.control}
              name="startDate"
              minDateTime={dayjs(infoStartDate)}
              maxDateTime={dayjs(infoEndDate)}
            />
          </Box>
          <Box>
            <Typography sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}>
              Ngày kết thúc
            </Typography>
            <RHFDateTimePicker
              control={programForm.control}
              name="endDate"
              minDateTime={dayjs(programStartDate)}
              maxDateTime={dayjs(infoEndDate)}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-start" }}>
          <Button
            onClick={handleSaveProgram}
            variant="contained"
            size="medium"
            sx={{ minWidth: 160 }}
          >
            {actionLabel}
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

  return (
    <Card sx={{ boxShadow: "0 14px 44px rgba(9, 30, 66, 0.08)", border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box>
            <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: 0.6 }}>
              Bước 2
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Chương trình đào tạo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Tạo các chương trình chính trước khi thêm chủ đề và môn học.
            </Typography>
          </Box>
          <Chip label="Tối thiểu 1" color="warning" size="small" />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2.5}>
          {fields.length === 0 && !showForm && (
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                border: "1px dashed",
                borderColor: "divider",
                bgcolor: "grey.50",
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <EventNoteIcon sx={{ color: "text.disabled" }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Chưa có chương trình nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tạo chương trình đầu tiên để mở khóa bước chủ đề và gán môn học.
                </Typography>
              </Box>
            </Box>
          )}

          {fields.map((field, index) => {
            const dateRange = formatDateRange(field.startDate, field.endDate);
            const isEditing = editingIndex === index;

            if (isEditing) {
              return (
                <Box key={field.id}>{renderProgramForm("Cập nhật chương trình")}</Box>
              );
            }

            return (
              <Box
                key={field.id}
                sx={{
                  p: 2.75,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #f6f8ff 0%, #eef3ff 100%)",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Chip label={`Chương trình ${index + 1}`} color="primary" size="small" />
                    <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                      {field.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.75 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditProgram(index)}
                      sx={{ bgcolor: "common.white", border: "1px solid", borderColor: "divider" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteProgram(index)}
                      sx={{
                        bgcolor: "common.white",
                        border: "1px solid",
                        borderColor: "divider",
                        color: "text.secondary",
                        "&:hover": { color: "error.main" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Chip
                    label={dateRange || "Chưa có lịch"}
                    variant="outlined"
                    size="small"
                    sx={{ borderColor: "primary.200" }}
                  />
                </Box>

                {field.description && (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {field.description}
                  </Typography>
                )}
              </Box>
            );
          })}

          {showForm && editingIndex === null && renderProgramForm("Lưu chương trình")}

          {!showForm && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleShowForm}
              sx={{ alignSelf: "flex-start", borderRadius: 2, px: 2.5 }}
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
          <Button variant="contained" onClick={onContinue} sx={{ px: 3 }}>
            Tiếp tục
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

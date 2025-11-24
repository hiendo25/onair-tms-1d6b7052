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
import { PlanFormSchema, Topic, topicSchema } from "@/modules/plans/plan-form.schema";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import dayjs, { Dayjs } from "dayjs";
import TopicCard from "./shared/TopicCard";

interface StepTrainingTopicsProps {
  control: Control<PlanFormSchema>;
  errors: FieldErrors<PlanFormSchema>;
  onContinue: () => void;
  onBack: () => void;
}

export default function StepTrainingTopics({
  control,
  errors,
  onContinue,
  onBack,
}: StepTrainingTopicsProps) {
  // Track which program has the add form visible
  const [showFormForProgram, setShowFormForProgram] = useState<number | null>(null);
  // Track which topic is being edited: { programIndex, topicIndex }
  const [editingTopic, setEditingTopic] = useState<{ programIndex: number; topicIndex: number } | null>(null);

  const { fields: programs } = useFieldArray({
    control,
    name: "programs",
  });

  const topicForm = useForm<Topic>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const formatDateRange = (startDate?: string | Dayjs, endDate?: string | Dayjs) => {
    if (!startDate || !endDate) return null;
    
    const start = typeof startDate === "string" ? dayjs(startDate) : startDate;
    const end = typeof endDate === "string" ? dayjs(endDate) : endDate;
    
    if (!start.isValid() || !end.isValid()) return null;
    return `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`;
  };

  const handleShowAddForm = (programIndex: number) => {
    topicForm.reset({
      name: "",
      description: "",
    });
    setShowFormForProgram(programIndex);
    setEditingTopic(null);
  };

  const handleEditTopic = (programIndex: number, topicIndex: number, topic: Topic) => {
    topicForm.reset(topic);
    setEditingTopic({ programIndex, topicIndex });
    setShowFormForProgram(null);
  };

  const handleCancelForm = () => {
    setShowFormForProgram(null);
    setEditingTopic(null);
    topicForm.reset();
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Bước 3: Chủ đề
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Có ít nhất {programs.length} chương trình đào tạo
        </Typography>

        <Stack spacing={2}>
          {programs.map((program, programIndex) => {
            const dateRange = formatDateRange(program.startDate, program.endDate);

            return (
              <ProgramCard
                key={program.id}
                program={program}
                programIndex={programIndex}
                dateRange={dateRange}
                control={control}
                errors={errors}
                showFormForProgram={showFormForProgram}
                editingTopic={editingTopic}
                topicForm={topicForm}
                onShowAddForm={handleShowAddForm}
                onEditTopic={handleEditTopic}
                onCancelForm={handleCancelForm}
              />
            );
          })}
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button variant="outlined" onClick={onBack}>
            Quay lại
          </Button>
          <Button variant="contained" onClick={onContinue}>
            Tiếp tục
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

interface ProgramCardProps {
  program: any;
  programIndex: number;
  dateRange: string | null;
  control: Control<PlanFormSchema>;
  errors: FieldErrors<PlanFormSchema>;
  showFormForProgram: number | null;
  editingTopic: { programIndex: number; topicIndex: number } | null;
  topicForm: any;
  onShowAddForm: (programIndex: number) => void;
  onEditTopic: (programIndex: number, topicIndex: number, topic: Topic) => void;
  onCancelForm: () => void;
}

function ProgramCard({
  program,
  programIndex,
  dateRange,
  control,
  errors,
  showFormForProgram,
  editingTopic,
  topicForm,
  onShowAddForm,
  onEditTopic,
  onCancelForm,
}: ProgramCardProps) {
  const { fields: topics, append, update, remove } = useFieldArray({
    control,
    name: `programs.${programIndex}.topics` as const,
  });

  const handleSaveTopic = topicForm.handleSubmit((data: Topic) => {
    if (editingTopic && editingTopic.programIndex === programIndex) {
      update(editingTopic.topicIndex, data);
    } else {
      append(data);
    }
    onCancelForm();
  });

  const handleDeleteTopic = (topicIndex: number) => {
    remove(topicIndex);
  };

  const isShowingAddForm = showFormForProgram === programIndex;
  const topicsError = errors.programs?.[programIndex]?.topics?.message;
  const hasError = !!topicsError;

  return (
    <Box
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: hasError ? "error.main" : "#1976d2",
        borderRadius: 1,
        bgcolor: hasError ? "#ffebee" : "#e3f2fd",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {program.name}
        </Typography>
        {dateRange && (
          <Typography variant="body2" color="text.secondary">
            {dateRange}
          </Typography>
        )}
        {hasError && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {topicsError}
          </Typography>
        )}
      </Box>

      <Stack spacing={2}>
        {/* Topic List */}
        {topics.map((topic, topicIndex) => {
          const isEditing = editingTopic?.programIndex === programIndex && editingTopic?.topicIndex === topicIndex;

          if (isEditing) {
            // Show edit form inline
            return (
              <Box
                key={topic.id}
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
                    control={topicForm.control}
                    name="name"
                    label="Tên chủ đề"
                    placeholder="VD: Kỹ năng giao tiếp"
                    required
                  />

                  <RHFTextAreaField
                    control={topicForm.control}
                    name="description"
                    label="Thông tin mô tả"
                    placeholder="Mô tả mục tiêu ngắn của kế hoạch đào tạo"
                    minRows={3}
                    maxRows={6}
                  />

                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-start" }}>
                    <Button
                      onClick={handleSaveTopic}
                      variant="contained"
                      size="medium"
                    >
                      Lưu chủ đề
                    </Button>
                    <Button
                      onClick={onCancelForm}
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

          // Show topic card
          return (
            <TopicCard
              key={topic.id}
              topic={topic}
              mode="editable"
              onEdit={() => onEditTopic(programIndex, topicIndex, topic)}
              onDelete={() => handleDeleteTopic(topicIndex)}
            />
          );
        })}

        {/* Add Form */}
        {isShowingAddForm && (
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
                control={topicForm.control}
                name="name"
                label="Tên chủ đề"
                placeholder="VD: Kỹ năng giao tiếp"
                required
              />

              <RHFTextAreaField
                control={topicForm.control}
                name="description"
                label="Thông tin mô tả"
                placeholder="Mô tả mục tiêu ngắn của kế hoạch đào tạo"
                minRows={3}
                maxRows={6}
              />

              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-start" }}>
                <Button
                  onClick={handleSaveTopic}
                  variant="contained"
                  size="medium"
                >
                  Lưu chủ đề
                </Button>
                <Button
                  onClick={onCancelForm}
                  variant="outlined"
                  size="medium"
                >
                  Hủy
                </Button>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Add Topic Button */}
        {!isShowingAddForm && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => onShowAddForm(programIndex)}
            sx={{
              bgcolor: "common.white",
              borderColor: "text.primary",
              color: "text.primary",
              borderRadius: 1,
              "&:hover": {
                bgcolor: "grey.50",
                borderColor: "text.primary",
              },
            }}
          >
            Thêm chủ đề
          </Button>
        )}
      </Stack>
    </Box>
  );
}


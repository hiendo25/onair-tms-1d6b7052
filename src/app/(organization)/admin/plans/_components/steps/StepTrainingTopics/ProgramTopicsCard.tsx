"use client";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { FieldArrayWithId, useFieldArray, UseFormReturn } from "react-hook-form";
import { PlanFormSchema, Topic } from "@/modules/plans/plan-form.schema";
import { TopicForm } from "./TopicForm";
import { EditingTopicState } from "./types";
import TopicCard from "../../TopicCard";
import { usePlanFormContext } from "@/modules/plans/use-plan-form-context";

interface ProgramTopicsCardProps {
  program: FieldArrayWithId<PlanFormSchema, "programs", "id">;
  programIndex: number;
  dateRange: string | null;
  showFormForProgram: number | null;
  editingTopic: EditingTopicState;
  topicForm: UseFormReturn<Topic>;
  onShowAddForm: (programIndex: number) => void;
  onEditTopic: (programIndex: number, topicIndex: number, topic: Topic) => void;
  onCancelForm: () => void;
}

export default function ProgramTopicsCard({
  program,
  programIndex,
  dateRange,
  showFormForProgram,
  editingTopic,
  topicForm,
  onShowAddForm,
  onEditTopic,
  onCancelForm,
}: ProgramTopicsCardProps) {
  const {
    control,
    formState: { errors },
  } = usePlanFormContext();
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
        p: 2.75,
        border: "1px solid",
        borderColor: hasError ? "error.main" : "divider",
        borderRadius: 2,
        background: hasError ? "#fff5f5" : "linear-gradient(135deg, #f9fafb 0%, #eef2ff 100%)",
        boxShadow: "0 12px 28px rgba(0,0,0,0.06)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 1.5 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label={`Chương trình ${programIndex + 1}`} size="small" color="primary" />
            {dateRange && (
              <Chip label={dateRange} size="small" variant="outlined" sx={{ borderColor: "primary.200" }} />
            )}
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.4 }}>
            {program.name}
          </Typography>
          {hasError && (
            <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
              {topicsError}
            </Typography>
          )}
        </Box>
      </Box>

      <Stack spacing={2}>
        {topics.map((topic, topicIndex) => {
          const isEditing = editingTopic?.programIndex === programIndex
            && editingTopic?.topicIndex === topicIndex;

          if (isEditing) {
            return (
              <TopicForm
                key={topic.id}
                form={topicForm}
                onSubmit={handleSaveTopic}
                onCancel={onCancelForm}
              />
            );
          }

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

        {isShowingAddForm && (
          <TopicForm
            form={topicForm}
            onSubmit={handleSaveTopic}
            onCancel={onCancelForm}
          />
        )}

        {!isShowingAddForm && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onShowAddForm(programIndex)}
            sx={{
              alignSelf: "flex-start",
              borderRadius: 2,
              "&:hover": {
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
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

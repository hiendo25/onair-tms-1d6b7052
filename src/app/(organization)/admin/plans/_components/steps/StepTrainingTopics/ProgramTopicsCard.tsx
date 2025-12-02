"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { FieldArrayWithId, useFieldArray, UseFormReturn } from "react-hook-form";
import { PlanFormSchema, Topic } from "@/modules/plans/plan-form.schema";
import { TopicForm } from "./TopicForm";
import { EditingTopicState } from "./types";
import TopicCard from "../../shared/TopicCard";
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

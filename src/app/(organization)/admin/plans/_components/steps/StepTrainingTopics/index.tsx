"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { useFieldArray } from "react-hook-form";
import { Topic, topicSchema } from "@/modules/plans/plan-form.schema";
import { usePlanInlineForm } from "@/modules/plans/use-plan-inline-form";
import { formatDateRange } from "../../../helper";
import ProgramTopicsCard from "./ProgramTopicsCard";
import { EditingTopicState } from "./types";
import { usePlanFormContext } from "@/modules/plans/use-plan-form-context";

interface StepTrainingTopicsProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function StepTrainingTopics({
  onContinue,
  onBack,
}: StepTrainingTopicsProps) {
  const {
    control,
    formState: { errors },
  } = usePlanFormContext();
  const [showFormForProgram, setShowFormForProgram] = useState<number | null>(null);
  const [editingTopic, setEditingTopic] = useState<EditingTopicState>(null);

  const { fields: programs } = useFieldArray({
    control,
    name: "programs",
  });

  const { form: topicForm, resetToDefault: resetTopicForm } = usePlanInlineForm<Topic>({
    schema: topicSchema,
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleShowAddForm = (programIndex: number) => {
    resetTopicForm();
    setShowFormForProgram(programIndex);
    setEditingTopic(null);
  };

  const handleEditTopic = (programIndex: number, topicIndex: number, topic: Topic) => {
    const { ...topicValues } = topic as Topic & { id?: string };
    resetTopicForm(topicValues);
    setEditingTopic({ programIndex, topicIndex });
    setShowFormForProgram(null);
  };

  const handleCancelForm = () => {
    setShowFormForProgram(null);
    setEditingTopic(null);
    resetTopicForm();
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Bước 3: Chủ đề (không bắt buộc)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Bạn có thể bỏ qua bước này nếu chương trình không cần phân tách chủ đề
        </Typography>

        <Stack spacing={2}>
          {programs.map((program, programIndex) => {
            const dateRange = formatDateRange(program.startDate, program.endDate);

            return (
              <ProgramTopicsCard
                key={program.id}
                program={program}
                programIndex={programIndex}
                dateRange={dateRange}
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

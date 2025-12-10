"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useFieldArray } from "react-hook-form";
import { Topic, topicSchema } from "@/modules/plans/plan-form.schema";
import { usePlanInlineForm } from "@/modules/plans/use-plan-inline-form";
import { formatDateRange } from "../../../helper";
import ProgramTopicsCard, { EditingTopicState } from "./ProgramTopicsCard";
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
    <Card sx={{ boxShadow: "0 14px 44px rgba(9, 30, 66, 0.08)", border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box>
            <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: 0.6 }}>
              Bước 3
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Chủ đề (không bắt buộc)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Thêm chủ đề giúp bạn gán môn học chi tiết hơn cho từng chương trình.
            </Typography>
          </Box>
          <Chip label="Tùy chọn" color="default" size="small" />
        </Box>

        <Divider sx={{ my: 2 }} />

        {programs.length === 0 ? (
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "divider",
              bgcolor: "grey.50",
              color: "text.secondary",
            }}
          >
            Chưa có chương trình để gán chủ đề. Hãy tạo ít nhất một chương trình ở bước trước.
          </Box>
        ) : (
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
        )}

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

"use client";

import React from "react";
import {
  Card,
  Box,
  TextField,
  FormHelperText,
} from "@mui/material";
import { QuestionGradeDetail } from "@/types/dto/assignments";
import { Control, Controller } from "react-hook-form";
import QuestionHeader from "../../../_components/QuestionHeader";
import QuestionAttachments from "../../../_components/QuestionAttachments";
import RadioAnswerDisplay from "../../../_components/RadioAnswerDisplay";
import CheckboxAnswerDisplay from "../../../_components/CheckboxAnswerDisplay";
import TextAnswerDisplay from "../../../_components/TextAnswerDisplay";
import FileAnswerDisplay from "../../../_components/FileAnswerDisplay";
import AnswerAttachments from "../../../_components/AnswerAttachments";

interface GradeQuestionCardProps {
  question: QuestionGradeDetail;
  questionNumber: number;
  control?: Control<any>;
}

interface ScoreAndFeedbackInputProps {
  questionId: string;
  maxScore: number;
  control: Control<any>;
}

const ScoreAndFeedbackInput: React.FC<ScoreAndFeedbackInputProps> = ({
  questionId,
  maxScore,
  control,
}) => {
  return (
    <>
      <Controller
        name={`grades.${questionId}` as any}
        control={control}
        rules={{
          required: "Vui lòng nhập điểm",
          validate: (value) => {
            if (value === "" || value === null || value === undefined) {
              return "Vui lòng nhập điểm";
            }
            const num = typeof value === "number" ? value : parseFloat(value);
            if (isNaN(num)) {
              return "Điểm không hợp lệ";
            }
            if (num < 0) {
              return "Điểm không được nhỏ hơn 0";
            }
            if (num > maxScore) {
              return `Điểm không được lớn hơn ${maxScore}`;
            }
            return true;
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <Box>
            <TextField
              {...field}
              value={field.value ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === "" ? "" : parseFloat(value) || 0);
              }}
              label="Điểm"
              type="number"
              fullWidth
              error={!!error}
              inputProps={{ min: 0, max: maxScore, step: 0.5 }}
            />
            {error?.message && <FormHelperText error>{error.message}</FormHelperText>}
            {!error?.message && (
              <FormHelperText>Điểm tối đa: {maxScore}</FormHelperText>
            )}
          </Box>
        )}
      />
      <Controller
        name={`feedbacks.${questionId}` as any}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            value={field.value ?? ""}
            label="Nhận xét"
            multiline
            rows={3}
            fullWidth
            placeholder="Nhập nhận xét cho câu trả lời này (không bắt buộc)"
            sx={{ mt: 2 }}
          />
        )}
      />
    </>
  );
};

const GradeQuestionCard: React.FC<GradeQuestionCardProps> = ({
  question,
  questionNumber,
  control,
}) => {
  return (
    <Card variant="outlined" sx={{ p: 2.5 }}>
      <QuestionHeader
        questionNumber={questionNumber}
        questionLabel={question.label}
        maxScore={question.maxScore}
        earnedScore={question.earnedScore}
        isAutoGraded={question.isAutoGraded}
      />

      {question.attachments && question.attachments.length > 0 && (
        <QuestionAttachments attachments={question.attachments} />
      )}

      {question.type === "radio" && (
        <RadioAnswerDisplay
          selectedOptionId={question.answer.selectedOptionId}
          options={question.options}
        />
      )}

      {question.type === "checkbox" && (
        <CheckboxAnswerDisplay
          selectedOptionIds={question.answer.selectedOptionIds}
          options={question.options}
        />
      )}

      {question.type === "text" && (
        <Box>
          <TextAnswerDisplay text={question.answer.text} />

          {question.answerAttachments && question.answerAttachments.length > 0 && (
            <AnswerAttachments attachments={question.answerAttachments} />
          )}

          {control && (
            <ScoreAndFeedbackInput
              questionId={question.id}
              maxScore={question.maxScore}
              control={control}
            />
          )}
        </Box>
      )}

      {question.type === "file" && (
        <Box>
          <FileAnswerDisplay files={question.answer.files} />

          {control && (
            <ScoreAndFeedbackInput
              questionId={question.id}
              maxScore={question.maxScore}
              control={control}
            />
          )}
        </Box>
      )}
    </Card>
  );
};

export default React.memo(GradeQuestionCard);


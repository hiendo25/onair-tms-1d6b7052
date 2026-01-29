"use client";

import * as React from "react";
import { Box, LinearProgress, Stack, Typography } from "@mui/material";

import type { QuestionAnswer, SubmissionFormData } from "@/modules/assignment-management/types/assignment-submission.types";
import type { AssignmentQuestionDto } from "@/types/dto/assignments";

import QuestionCard from "./QuestionCard";
import SubmissionActions from "./SubmissionActions";

interface AssignmentQuestionsFormProps {
  questions: AssignmentQuestionDto[];
  answers: QuestionAnswer[];
  handleSubmit: (callback: (data: SubmissionFormData) => void) => (event?: React.BaseSyntheticEvent) => void;
  onSubmit: (data: SubmissionFormData) => void;
  isSubmitting: boolean;
  uploadProgress: number;
  hasAnyAnswers: boolean;
  isSubmitDisabled: boolean;
  onCancel: () => void;
  hideCancelButton: boolean;
  handlers: {
    handleFileSelect: (questionId: string, files: FileList | null) => void;
    handleRemoveFile: (questionId: string, fileIndex: number) => void;
    handleTextChange: (questionId: string, text: string) => void;
    handleRadioChange: (questionId: string, optionId: string) => void;
    handleCheckboxChange: (questionId: string, optionIds: string[]) => void;
    handleMatchingChange: (questionId: string, mappings: Array<{ columnAId: string; columnBId: string }>) => void;
    handleOrderChange: (questionId: string, orderedItems: Array<{ id: string; position: number }>) => void;
    handleTrueFalseChange: (questionId: string, answer: boolean) => void;
    handleAttachmentSelect: (questionId: string, files: FileList | null) => void;
    handleRemoveAttachment: (questionId: string, fileIndex: number) => void;
  };
}

const AssignmentQuestionsForm = ({
  questions,
  answers,
  handleSubmit,
  onSubmit,
  isSubmitting,
  uploadProgress,
  hasAnyAnswers,
  isSubmitDisabled,
  onCancel,
  hideCancelButton,
  handlers,
}: AssignmentQuestionsFormProps) => {
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {isSubmitting && uploadProgress > 0 && (
          <Box>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Đang tải lên... {uploadProgress}%
            </Typography>
          </Box>
        )}

        {questions.map((question, index) => {
          const answer = answers?.find((item) => item.questionId === question.id);

          return (
            <QuestionCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
              files={answer?.files}
              onFileSelect={(files) => handlers.handleFileSelect(question.id, files)}
              onRemoveFile={(fileIndex) => handlers.handleRemoveFile(question.id, fileIndex)}
              textAnswer={answer?.textAnswer}
              onTextChange={(text) => handlers.handleTextChange(question.id, text)}
              radioAnswer={answer?.radioAnswer}
              onRadioChange={(optionId) => handlers.handleRadioChange(question.id, optionId)}
              checkboxAnswers={answer?.checkboxAnswers}
              onCheckboxChange={(optionIds) => handlers.handleCheckboxChange(question.id, optionIds)}
              matchingMappings={answer?.matchingMappings}
              onMatchingChange={(mappings) => handlers.handleMatchingChange(question.id, mappings)}
              orderedItems={answer?.orderedItems}
              onOrderChange={(orderedItems) => handlers.handleOrderChange(question.id, orderedItems)}
              trueFalseAnswer={answer?.trueFalseAnswer}
              onTrueFalseChange={(answerValue) => handlers.handleTrueFalseChange(question.id, answerValue)}
              attachments={answer?.attachments}
              onAttachmentSelect={(files) => handlers.handleAttachmentSelect(question.id, files)}
              onRemoveAttachment={(fileIndex) => handlers.handleRemoveAttachment(question.id, fileIndex)}
            />
          );
        })}

        <SubmissionActions
          onCancel={onCancel}
          isSubmitDisabled={isSubmitDisabled || !hasAnyAnswers || isSubmitting}
          isSubmitting={isSubmitting}
          hideCancelButton={hideCancelButton}
        />
      </Stack>
    </form>
  );
};

export default React.memo(AssignmentQuestionsForm);

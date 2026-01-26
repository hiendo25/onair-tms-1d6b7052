import React, { memo, useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";

import { QuestionType } from "@/modules/assignment-management/constants/question.constants";
import { buildQuestionOptionList } from "@/modules/assignment-management/utils/question-bank.utils";
import type { QuestionBankDto } from "@/types/dto/question-bank";

import AssignmentBankQuestionOptionItem from "./AssignmentBankQuestionOptionItem";

interface AssignmentBankQuestionAnswerListProps {
  questionType: QuestionType;
  options: QuestionBankDto["options"];
}

const CHOICE_TYPES: QuestionType[] = ["checkbox", "radio", "true_false", "matching", "order"];

const AssignmentBankQuestionAnswerList = ({
  questionType,
  options,
}: AssignmentBankQuestionAnswerListProps) => {
  const optionList = useMemo(() => buildQuestionOptionList(options), [options]);
  const showChoiceSection = CHOICE_TYPES.includes(questionType);

  const renderEmptyState = () => {
    if (questionType === "text") {
      return "Câu hỏi tự luận: học viên sẽ nhập câu trả lời bằng văn bản.";
    }

    if (questionType === "file") {
      return "Câu hỏi tải file: học viên sẽ nộp tệp đính kèm.";
    }

    return "Không có đáp án lựa chọn cho loại câu hỏi này.";
  };

  return (
    <Stack spacing={2} sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} color="text.primary">
        Đáp án
      </Typography>
      {!showChoiceSection ? (
        <Box sx={{ borderRadius: 2, border: "1px solid", borderColor: "grey.100", backgroundColor: "grey.50", p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {renderEmptyState()}
          </Typography>
        </Box>
      ) : optionList.length === 0 ? (
        <Box sx={{ borderRadius: 2, border: "1px solid", borderColor: "grey.100", backgroundColor: "grey.50", p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Chưa có lựa chọn nào.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {optionList.map((option) => (
            <AssignmentBankQuestionOptionItem key={option.id} option={option} />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default memo(AssignmentBankQuestionAnswerList);

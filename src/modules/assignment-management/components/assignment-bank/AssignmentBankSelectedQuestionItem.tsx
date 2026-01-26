import React, { memo } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Stack, Typography } from "@mui/material";

import {
  getCategoryNames,
  getDifficultyLabel,
  getQuestionTypeBadgeLabel,
} from "@/modules/assignment-management/utils/question-bank.utils";
import type { QuestionBankDto } from "@/types/dto/question-bank";

import QuestionBankTag, { TagTone } from "@/app/(organization)/admin/assignments/question-bank/_components/QuestionBankTag";

const difficultyToneMap: Record<string, TagTone> = {
  easy: "green",
  medium: "orange",
  hard: "pink",
};

interface AssignmentBankSelectedQuestionItemProps {
  question: QuestionBankDto;
  index: number;
  onRemove: () => void;
}

const AssignmentBankSelectedQuestionItem = ({
  question,
  index,
  onRemove,
}: AssignmentBankSelectedQuestionItemProps) => {
  const difficultyLabel = getDifficultyLabel(question.difficulty);
  const typeLabel = getQuestionTypeBadgeLabel(question.type);
  const categoryNames = getCategoryNames(question);
  const displayCategories = categoryNames.slice(0, 2);
  const extraCategoryCount = Math.max(categoryNames.length - displayCategories.length, 0);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        px: 2,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "grey.100",
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          backgroundColor: "grey.100",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 600,
          color: "text.secondary",
          flexShrink: 0,
        }}
      >
        {index}
      </Box>
      <Stack spacing={1} flex={1}>
        <Typography variant="body2" fontWeight={600}>
          {question.label}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {difficultyLabel ? (
            <QuestionBankTag label={difficultyLabel} tone={difficultyToneMap[question.difficulty || ""] || "gray"} />
          ) : null}
          <QuestionBankTag label={typeLabel} tone="gray" />
          {displayCategories.map((name) => (
            <QuestionBankTag key={name} label={name} tone="gray" />
          ))}
          {extraCategoryCount > 0 ? <QuestionBankTag label={`+${extraCategoryCount}`} tone="gray" /> : null}
          <QuestionBankTag label={`${question.score} điểm`} tone="gray" />
        </Stack>
      </Stack>
      <IconButton
        size="small"
        onClick={onRemove}
        sx={{ border: "1px solid", borderColor: "grey.200" }}
        aria-label="Xóa câu hỏi"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default memo(AssignmentBankSelectedQuestionItem);

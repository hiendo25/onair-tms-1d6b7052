import React, { memo } from "react";
import { Typography } from "@mui/material";

import {
  getCategoryNames,
  getDifficultyLabel,
  getQuestionTypeBadgeLabel,
} from "@/modules/assignment-management/utils/question-bank.utils";
import type { QuestionBankDto } from "@/types/dto/question-bank";

import QuestionBankActionMenu from "./QuestionBankActionMenu";
import QuestionBankTag, { TagTone } from "./QuestionBankTag";

interface QuestionBankListItemProps {
  index?: number;
  question: QuestionBankDto;
  onEdit?: () => void;
  onDelete?: () => void;
  showIndex?: boolean;
  showActions?: boolean;
}

const difficultyToneMap: Record<string, TagTone> = {
  easy: "green",
  medium: "orange",
  hard: "pink",
};

const QuestionBankListItem = ({
  index = 0,
  question,
  onEdit,
  onDelete,
  showIndex = true,
  showActions = true,
}: QuestionBankListItemProps) => {
  const difficultyLabel = getDifficultyLabel(question.difficulty);
  const typeLabel = getQuestionTypeBadgeLabel(question.type);
  const categoryNames = getCategoryNames(question);
  const displayCategories = categoryNames.slice(0, 2);
  const extraCategoryCount = Math.max(categoryNames.length - displayCategories.length, 0);

  return (
    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        {showIndex ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
            {index}
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          <Typography className="text-sm font-semibold text-gray-900">{question.label}</Typography>
          <div className="flex flex-wrap gap-2">
            {difficultyLabel ? (
              <QuestionBankTag label={difficultyLabel} tone={difficultyToneMap[question.difficulty || ""] || "gray"} />
            ) : null}
            <QuestionBankTag label={typeLabel} tone="gray" />
            {displayCategories.map((name) => (
              <QuestionBankTag key={name} label={name} tone="gray" />
            ))}
            {extraCategoryCount > 0 ? (
              <QuestionBankTag label={`+${extraCategoryCount}`} tone="gray" />
            ) : null}
            <QuestionBankTag label={`${question.score} điểm`} tone="gray" />
          </div>
        </div>
      </div>
      {showActions && onEdit ? <QuestionBankActionMenu onEdit={onEdit} onDelete={onDelete} /> : null}
    </div>
  );
};

export default memo(QuestionBankListItem);

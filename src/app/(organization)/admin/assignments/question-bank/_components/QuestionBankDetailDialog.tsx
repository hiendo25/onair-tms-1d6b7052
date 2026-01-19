import React, { memo, useMemo } from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import { Dialog, IconButton, Typography } from "@mui/material";

import { QuestionDifficulty, QuestionType } from "@/modules/assignment-management/constants/question.constants";
import {
  getCategoryNames,
  getDifficultyLabel,
  getQuestionTypeBadgeLabel,
} from "@/modules/assignment-management/utils/question-bank.utils";
import type { MatchingQuestionData, OrderItem } from "@/types/dto/assignments/create-assignment.dto";
import type { QuestionOption } from "@/types/dto/assignments/question-option.dto";
import type { QuestionBankDto } from "@/types/dto/question-bank";

import QuestionBankTag from "./QuestionBankTag";

interface QuestionBankDetailDialogProps {
  open: boolean;
  question?: QuestionBankDto | null;
  onClose: () => void;
}

type OptionListItem = {
  id: string;
  label: string;
  isCorrect?: boolean;
  prefix?: string;
};

const difficultyToneMap: Record<QuestionDifficulty, "green" | "orange" | "pink"> = {
  easy: "green",
  medium: "orange",
  hard: "pink",
};

const isOptionArray = (value: unknown): value is QuestionOption[] => Array.isArray(value);

const isMatchingOptions = (value: unknown): value is MatchingQuestionData => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "columnAItems" in value && "columnBItems" in value && "correctMappings" in value;
};

const isOrderOptions = (value: unknown): value is { orderItems: OrderItem[] } => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "orderItems" in value;
};

const buildOptionList = (question: QuestionBankDto): OptionListItem[] => {
  const options = question.options;

  if (isOptionArray(options)) {
    return options.map((option, index) => ({
      id: option.id || `${index}`,
      label: option.label,
      isCorrect: option.correct,
      prefix: String.fromCharCode(65 + index),
    }));
  }

  if (isMatchingOptions(options)) {
    const columnA = new Map(options.columnAItems.map((item) => [item.id, item.content]));
    const columnB = new Map(options.columnBItems.map((item) => [item.id, item.content]));

    return options.correctMappings.map((mapping, index) => ({
      id: `${mapping.columnAId}-${mapping.columnBId}-${index}`,
      label: `${columnA.get(mapping.columnAId) || ""} - ${columnB.get(mapping.columnBId) || ""}`.trim(),
      prefix: `${index + 1}`,
    }));
  }

  if (isOrderOptions(options)) {
    const sortedItems = [...options.orderItems].sort((a, b) => a.correctOrder - b.correctOrder);
    return sortedItems.map((item, index) => ({
      id: item.id || `${index}`,
      label: item.content,
      prefix: `${index + 1}`,
    }));
  }

  return [];
};

const QuestionBankDetailDialog = ({ open, question, onClose }: QuestionBankDetailDialogProps) => {
  const detailQuestion = question || undefined;

  const categories = useMemo(() => (detailQuestion ? getCategoryNames(detailQuestion) : []), [detailQuestion]);
  const typeLabel = detailQuestion ? getQuestionTypeBadgeLabel(detailQuestion.type) : "";
  const difficultyLabel = detailQuestion ? getDifficultyLabel(detailQuestion.difficulty) : "";
  const difficultyTone = detailQuestion?.difficulty ? difficultyToneMap[detailQuestion.difficulty] : "gray";

  const options = useMemo(() => (detailQuestion ? buildOptionList(detailQuestion) : []), [detailQuestion]);
  const showOptions = options.length > 0;

  const typeNeedsOptionSection: QuestionType[] = [
    "checkbox",
    "radio",
    "true_false",
    "matching",
    "order",
  ];
  const questionType = detailQuestion?.type;
  const showChoiceSection = questionType ? typeNeedsOptionSection.includes(questionType) : false;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <div className="relative p-6 sm:p-8">
        <IconButton onClick={onClose} className="absolute right-4 top-4">
          <CloseIcon />
        </IconButton>

        <div className="flex flex-col gap-1">
          <Typography className="text-2xl font-semibold text-gray-900">Chi tiết câu hỏi</Typography>
          <Typography className="text-sm text-gray-500">Xem toàn bộ thông tin và đáp án của câu hỏi</Typography>
        </div>

        <div className="mt-6 rounded-2xl bg-gray-50 p-4">
          <Typography className="text-xs font-semibold text-gray-600">Tiêu đề câu hỏi</Typography>
          <Typography className="text-base font-semibold text-gray-900 mt-2">
            {detailQuestion?.label || "-"}
          </Typography>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Typography className="text-sm font-semibold text-gray-700">Loại câu hỏi</Typography>
            {typeLabel ? <QuestionBankTag label={typeLabel} tone="gray" /> : null}
          </div>

          <div>
            <Typography className="text-sm font-semibold text-gray-700">Độ khó</Typography>
            {difficultyLabel ? <QuestionBankTag label={difficultyLabel} tone={difficultyTone} /> : null}
          </div>

          <div className="flex flex-col gap-2">
            <Typography className="text-sm font-semibold text-gray-700">Lĩnh vực</Typography>
            <div className="flex flex-wrap gap-2">
              {categories.length > 0 ? categories.map((name) => <QuestionBankTag key={name} label={name} />) : "-"}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Typography className="text-sm font-semibold text-gray-700">Điểm số</Typography>
            <Typography className="text-lg font-semibold text-blue-600">
              {detailQuestion?.score ?? 0} điểm
            </Typography>
          </div>
        </div>

        <div className="mt-8">
          <Typography className="text-lg font-semibold text-gray-900">Các lựa chọn</Typography>

          {!showChoiceSection ? (
            <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <Typography className="text-sm text-gray-600">
                {detailQuestion?.type === "text"
                  ? "Câu hỏi tự luận: học viên sẽ nhập câu trả lời bằng văn bản."
                  : detailQuestion?.type === "file"
                    ? "Câu hỏi tải file: học viên sẽ nộp tệp đính kèm."
                    : "Không có đáp án lựa chọn cho loại câu hỏi này."}
              </Typography>
            </div>
          ) : !showOptions ? (
            <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <Typography className="text-sm text-gray-600">Chưa có lựa chọn nào.</Typography>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${option.isCorrect ? "border-green-600 bg-green-50" : "border-gray-200 bg-white"
                    }`}
                >
                  {option.isCorrect === true ? (
                    <CheckCircleOutlineIcon fontSize="small" className="text-green-600 mt-0.5" />
                  ) : option.isCorrect === false ? (
                    <div className="h-5 w-5 rounded-full border border-gray-300" />
                  ) : (
                    <div className="mt-2 h-2 w-2 rounded-full bg-gray-300" />
                  )}
                  <Typography className="text-sm text-gray-800">
                    {option.prefix ? `${option.prefix}. ` : ""}
                    {option.label || "-"}
                  </Typography>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default memo(QuestionBankDetailDialog);

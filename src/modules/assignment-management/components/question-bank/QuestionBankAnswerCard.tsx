import React, { memo } from "react";
import { Stack, Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";

import type { MatchingQuestionData } from "@/modules/assignment-management/components/assignment-form.schema";
import useQuestionEditorHandlers from "@/modules/assignment-management/hooks/useQuestionEditorHandlers";
import MatchingQuestionEditor from "../ManageAssignmentForm/TabAssignmentContent/MatchingQuestionEditor";

import { QuestionBankFormValues } from "./question-bank.schema";
import QuestionBankAnswerHint from "./QuestionBankAnswerHint";
import QuestionBankOptionList from "./QuestionBankOptionList";
import QuestionBankOrderOptions from "./QuestionBankOrderOptions";
import QuestionBankTrueFalseOptions from "./QuestionBankTrueFalseOptions";

interface QuestionBankAnswerCardProps {
  questionIndex?: number;
}

const QuestionBankAnswerCard = ({ questionIndex = 0 }: QuestionBankAnswerCardProps) => {
  const { control, setValue } = useFormContext<QuestionBankFormValues>();
  const questionType = useWatch({ control, name: `questions.${questionIndex}.type` }) || "file";
  const matchingData = useWatch({ control, name: `questions.${questionIndex}.matchingData` });

  const { handleMatchingDataChange } = useQuestionEditorHandlers({ setValue });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <Typography className="text-lg font-semibold text-gray-900">Đáp án</Typography>

      <Stack spacing={2} sx={{ mt: 3 }}>
        {questionType === "checkbox" || questionType === "radio" ? (
          <QuestionBankOptionList questionIndex={questionIndex} questionType={questionType} />
        ) : null}

        {questionType === "true_false" ? <QuestionBankTrueFalseOptions questionIndex={questionIndex} /> : null}

        {questionType === "matching" ? (
          <MatchingQuestionEditor
            matchingData={
              matchingData ||
              ({
                columnAItems: [],
                columnBItems: [],
                correctMappings: [],
              } as MatchingQuestionData)
            }
            onChange={(data) => handleMatchingDataChange(questionIndex, data)}
          />
        ) : null}

        {questionType === "order" ? <QuestionBankOrderOptions questionIndex={questionIndex} /> : null}

        {questionType === "text" ? (
          <QuestionBankAnswerHint
            title="Câu hỏi tự luận"
            description="Học viên sẽ nhập câu trả lời bằng văn bản khi làm bài."
          />
        ) : null}

        {questionType === "file" ? (
          <QuestionBankAnswerHint
            title="Câu hỏi tải tệp"
            description="Học viên sẽ tải tệp lên khi làm bài kiểm tra."
          />
        ) : null}
      </Stack>
    </div>
  );
};

export default memo(QuestionBankAnswerCard);

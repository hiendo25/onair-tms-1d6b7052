"use client";

import React from "react";
import {
  Card,
  Box,
  Typography,
} from "@mui/material";
import { QuestionGradeDetail } from "@/types/dto/assignments";
import QuestionHeader from "../../../_components/QuestionHeader";
import QuestionAttachments from "../../../_components/QuestionAttachments";
import RadioAnswerDisplay from "../../../_components/RadioAnswerDisplay";
import CheckboxAnswerDisplay from "../../../_components/CheckboxAnswerDisplay";
import TextAnswerDisplay from "../../../_components/TextAnswerDisplay";
import FileAnswerDisplay from "../../../_components/FileAnswerDisplay";
import AnswerAttachments from "../../../_components/AnswerAttachments";

interface ResultQuestionCardProps {
  question: QuestionGradeDetail;
  questionNumber: number;
}

interface ScoreDisplayProps {
  earnedScore: number | null;
  maxScore: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ earnedScore, maxScore }) => {
  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Điểm đạt được:
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {earnedScore}/{maxScore} điểm
      </Typography>
    </Box>
  );
};

interface FeedbackDisplayProps {
  feedback: string;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback }) => {
  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: "info.50", borderRadius: 1, border: "1px solid", borderColor: "grey.400" }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
        Nhận xét của giáo viên:
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
        {feedback}
      </Typography>
    </Box>
  );
};

const ResultQuestionCard: React.FC<ResultQuestionCardProps> = ({
  question,
  questionNumber,
}) => {
  return (
    <Card variant="outlined" sx={{ p: 2.5 }}>
      <QuestionHeader
        questionNumber={questionNumber}
        questionLabel={question.label}
        maxScore={question.maxScore}
        earnedScore={question.earnedScore}
        isAutoGraded={true}
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

          <ScoreDisplay earnedScore={question.earnedScore} maxScore={question.maxScore} />

          {question.feedback && <FeedbackDisplay feedback={question.feedback} />}
        </Box>
      )}

      {question.type === "file" && (
        <Box>
          <FileAnswerDisplay files={question.answer.files} />

          <ScoreDisplay earnedScore={question.earnedScore} maxScore={question.maxScore} />

          {question.feedback && <FeedbackDisplay feedback={question.feedback} />}
        </Box>
      )}
    </Card>
  );
};

export default React.memo(ResultQuestionCard);


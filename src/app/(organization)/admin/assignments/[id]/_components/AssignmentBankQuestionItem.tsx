import React, { memo, useMemo } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from "@mui/material";

import { getAssignmentBankQuestionScore } from "@/modules/assignment-management/utils/assignment-bank.utils";
import {
  getCategoryNames,
  getDifficultyLabel,
  getQuestionTypeBadgeLabel,
} from "@/modules/assignment-management/utils/question-bank.utils";
import type { AssignmentBankDto } from "@/types/dto/assignment-bank";
import QuestionBankTag, { TagTone } from "../../question-bank/_components/QuestionBankTag";

import AssignmentBankQuestionAnswerList from "./AssignmentBankQuestionAnswerList";

interface AssignmentBankQuestionItemProps {
  question: NonNullable<AssignmentBankDto["assignment_questions"]>[number];
  index: number;
  showTopBorder?: boolean;
}

const difficultyToneMap: Record<string, TagTone> = {
  easy: "green",
  medium: "orange",
  hard: "pink",
};

const AssignmentBankQuestionItem = ({ question, index, showTopBorder = false }: AssignmentBankQuestionItemProps) => {
  const questionBank = question.question_bank;

  const headerContent = useMemo(() => {
    if (!questionBank) {
      return null;
    }

    const difficultyLabel = getDifficultyLabel(questionBank.difficulty);
    const typeLabel = getQuestionTypeBadgeLabel(questionBank.type);
    const categoryNames = getCategoryNames(questionBank);
    const displayCategories = categoryNames.slice(0, 1);
    const extraCategoryCount = Math.max(categoryNames.length - displayCategories.length, 0);
    const scoreLabel = `${getAssignmentBankQuestionScore(question)} điểm`;

    return {
      label: questionBank.label,
      difficultyLabel,
      typeLabel,
      displayCategories,
      extraCategoryCount,
      difficultyTone: difficultyToneMap[questionBank.difficulty || ""] || "gray",
      scoreLabel,
      questionType: questionBank.type,
      options: questionBank.options,
    };
  }, [question, questionBank]);

  if (!headerContent) {
    return null;
  }

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "grey.200",
        backgroundColor: "transparent",
        "&::before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "text.secondary" }} />}
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.5,
          "& .MuiAccordionSummary-content": { my: 0 },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: "100%" }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: "grey.100",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
              fontWeight: 600,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {index}
          </Box>
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
              {headerContent.label}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
              {headerContent.difficultyLabel ? (
                <QuestionBankTag label={headerContent.difficultyLabel} tone={headerContent.difficultyTone} />
              ) : null}
              <QuestionBankTag label={headerContent.typeLabel} tone="gray" />
              {headerContent.displayCategories.map((name) => (
                <QuestionBankTag key={name} label={name} tone="gray" />
              ))}
              {headerContent.extraCategoryCount > 0 ? (
                <QuestionBankTag label={`+${headerContent.extraCategoryCount}`} tone="gray" />
              ) : null}
              <QuestionBankTag label={headerContent.scoreLabel} tone="gray" />
            </Stack>
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 0, pb: 2, borderTop: "1px solid", borderColor: "grey.100" }}>
        <AssignmentBankQuestionAnswerList
          questionType={headerContent.questionType}
          options={headerContent.options}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default memo(AssignmentBankQuestionItem);

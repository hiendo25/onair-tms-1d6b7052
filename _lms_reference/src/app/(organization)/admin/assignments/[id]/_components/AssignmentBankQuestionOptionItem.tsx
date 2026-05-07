import React, { memo } from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Box, Typography } from "@mui/material";

import type { QuestionOptionListItem } from "@/modules/assignment-management/utils/question-bank.utils";

interface AssignmentBankQuestionOptionItemProps {
  option: QuestionOptionListItem;
}

const AssignmentBankQuestionOptionItem = ({ option }: AssignmentBankQuestionOptionItemProps) => {
  const isCorrect = option.isCorrect === true;
  const showRadio = option.isCorrect === true || option.isCorrect === false;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: isCorrect ? "success.main" : "grey.200",
        backgroundColor: isCorrect ? "#ECFDF3" : "common.white",
        px: 2,
        py: 1.5,
      }}
    >
      {showRadio ? (
        isCorrect ? (
          <CheckCircleOutlineIcon sx={{ color: "success.main", mt: 0.2 }} fontSize="small" />
        ) : (
          <RadioButtonUncheckedIcon sx={{ color: "grey.400", mt: 0.2 }} fontSize="small" />
        )
      ) : (
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "grey.300", mt: 0.9 }} />
      )}
      <Typography variant="body2" color="text.primary">
        {option.prefix ? `${option.prefix}. ` : ""}
        {option.label || "-"}
      </Typography>
    </Box>
  );
};

export default memo(AssignmentBankQuestionOptionItem);

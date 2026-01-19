import React, { memo } from "react";
import { Grid } from "@mui/material";

import QuestionBankAnswerCard from "./QuestionBankAnswerCard";
import QuestionBankConfigCard from "./QuestionBankConfigCard";
import QuestionBankContentCard from "./QuestionBankContentCard";

const QuestionBankFormLayout = () => {
  return (
    <div className="flex flex-col gap-6">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <QuestionBankContentCard />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <QuestionBankConfigCard />
        </Grid>
      </Grid>
      <QuestionBankAnswerCard />
    </div>
  );
};

export default memo(QuestionBankFormLayout);

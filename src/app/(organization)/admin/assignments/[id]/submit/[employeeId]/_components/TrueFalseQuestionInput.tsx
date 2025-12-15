"use client";

import React from "react";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";

interface TrueFalseQuestionInputProps {
  answer: boolean | undefined;
  onAnswerChange: (answer: boolean) => void;
}

export default function TrueFalseQuestionInput({
  answer,
  onAnswerChange,
}: TrueFalseQuestionInputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAnswerChange(event.target.value === "true");
  };

  return (
    <FormControl component="fieldset" sx={{ mt: 2 }}>
      <RadioGroup
        value={answer === undefined ? "" : answer ? "true" : "false"}
        onChange={handleChange}
      >
        <FormControlLabel value="true" control={<Radio />} label="Đúng" />
        <FormControlLabel value="false" control={<Radio />} label="Sai" />
      </RadioGroup>
    </FormControl>
  );
}


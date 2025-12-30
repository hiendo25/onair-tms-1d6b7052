import React, { memo, useMemo } from "react";
import { FormHelperText, Rating } from "@mui/material";
import Box from "@mui/material/Box";
import { Control, Controller, useFormContext } from "react-hook-form";

import { Star01Icon } from "@/shared/assets/icons";
import { QuestionWithRatingFormData, SurveySubmissionFormData } from "../survey-submission.schema";

interface RatingItemTypeProps {
  questionIndex: number;
  control: Control<SurveySubmissionFormData>;
}
const RatingItemType: React.FC<RatingItemTypeProps> = ({ questionIndex, control }) => {
  return (
    <Controller
      control={control}
      name={`questions.${questionIndex}.answer.value`}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <>
          <HoverRating value={value as QuestionWithRatingFormData["answer"]["value"]} onChange={onChange} />
          {error?.message ? <FormHelperText error>{error.message}</FormHelperText> : null}
        </>
      )}
    />
  );
};
export default memo(RatingItemType);
const labels: { [index: string]: string } = {
  1: "Useless",
  2: "Poor",
  3: "Ok",
  4: "Good",
  5: "Excellent",
};

function getLabelText(value: number) {
  return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
}

interface HoverRatingProps {
  value?: number;
  onChange: (value: number) => void;
}
const HoverRating: React.FC<HoverRatingProps> = ({ value, onChange }) => {
  // const [value, setValue] = React.useState<number | null>(2);
  // const [hover, setHover] = React.useState(-1);

  const handleChange = (newValue: number | null) => {
    if (newValue) onChange(newValue);
  };

  return (
    <Box sx={{ width: 200, display: "flex", alignItems: "center" }}>
      <Rating
        name="hover-feedback"
        value={value ?? null}
        getLabelText={getLabelText}
        onChange={(event, newValue) => {
          handleChange(newValue);
        }}
        // onChangeActive={(event, newHover) => {
        //   setHover(newHover);
        // }}
        max={5}
        icon={<Star01Icon fill="#faaf03" />}
        emptyIcon={<Star01Icon />}
      />
      {/* {value !== null && <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : value]}</Box>} */}
    </Box>
  );
};

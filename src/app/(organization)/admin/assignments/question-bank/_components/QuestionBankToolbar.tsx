import React, { memo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, InputAdornment, TextField } from "@mui/material";

import QuestionBankFilterSelect, { QuestionBankFilterOption } from "./QuestionBankFilterSelect";

interface QuestionBankToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  questionTypeValue: string;
  categoryValue: string;
  questionTypeOptions: QuestionBankFilterOption[];
  categoryOptions: QuestionBankFilterOption[];
  onQuestionTypeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCreate: () => void;
}

const QuestionBankToolbar = ({
  searchValue,
  onSearchChange,
  questionTypeValue,
  categoryValue,
  questionTypeOptions,
  categoryOptions,
  onQuestionTypeChange,
  onCategoryChange,
  onCreate,
}: QuestionBankToolbarProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        alignItems: { xs: "stretch", md: "center" },
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gap: 2,
          width: "100%",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "minmax(240px, 320px) 200px 200px",
          },
        }}
      >
        <TextField
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm kiếm"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "grey.200",
            },
          }}
        />

        <QuestionBankFilterSelect
          value={questionTypeValue}
          placeholder="Loại câu hỏi"
          options={questionTypeOptions}
          onChange={onQuestionTypeChange}
        />

        <QuestionBankFilterSelect
          value={categoryValue}
          placeholder="Lĩnh vực"
          options={categoryOptions}
          onChange={onCategoryChange}
        />
      </Box>

      <Button
        variant="contained"
        onClick={onCreate}
        sx={{
          width: { xs: "100%", md: "auto" },
          minWidth: { md: 160 },
          whiteSpace: "nowrap",
          px: 3,
        }}
      >
        Tạo câu hỏi mới
      </Button>
    </Box>
  );
};

export default memo(QuestionBankToolbar);

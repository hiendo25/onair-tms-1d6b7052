import React, { memo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, InputAdornment, TextField } from "@mui/material";

import QuestionBankFilterSelect, {
  QuestionBankFilterOption,
} from "@/app/(organization)/admin/assignments/question-bank/_components/QuestionBankFilterSelect";
import SearchTextField from "@/shared/ui/filters/SearchTextField";
import SelectOption from "@/shared/ui/filters/SelectOption";

interface AssignmentBankToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  categoryValue: string;
  categoryOptions: QuestionBankFilterOption[];
  onCategoryChange: (value: string) => void;
  onCreate: () => void;
}

const AssignmentBankToolbar = ({
  searchValue,
  onSearchChange,
  categoryValue,
  categoryOptions,
  onCategoryChange,
  onCreate,
}: AssignmentBankToolbarProps) => {
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
            lg: "minmax(240px, 320px) 240px",
          },
        }}
      >

        <SearchTextField value={searchValue} onChange={onSearchChange} placeholder="Tìm kiếm" />
        <QuestionBankFilterSelect
          value={categoryValue}
          placeholder="Tất cả các lĩnh vực"
          options={categoryOptions}
          onChange={onCategoryChange}
        />
      </Box>

      <Button
        variant="contained"
        onClick={onCreate}
        sx={{
          width: { xs: "100%", md: "auto" },
          minWidth: { md: 180 },
          whiteSpace: "nowrap",
          px: 3,
        }}
      >
        Tạo bài kiểm tra mới
      </Button>
    </Box>
  );
};

export default memo(AssignmentBankToolbar);

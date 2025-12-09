"use client";

import { Autocomplete, Box, Checkbox, TextField, Typography } from "@mui/material";
import { Course } from "@/modules/plans/plan-form.schema";
import { renderCourseTags } from "./courseTags";

interface ProgramCourseSelectorProps {
  courses: Course[];
  availableCourses: Course[];
  onChange: (courses: Course[]) => void;
}

export default function ProgramCourseSelector({
  courses,
  availableCourses,
  onChange,
}: ProgramCourseSelectorProps) {
  return (
    <Box
      sx={{
        p: 2.5,
        border: "1px dashed",
        borderColor: "primary.100",
        borderRadius: 2,
        bgcolor: "white",
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
        Gán môn học cho chương trình (không có chủ đề)
      </Typography>
      <Autocomplete
        multiple
        options={availableCourses}
        disableCloseOnSelect
        getOptionLabel={(option) => option.title}
        value={courses || []}
        onChange={(_e, newValue) => onChange(newValue)}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderTags={(value) => renderCourseTags(value as Course[])}
        size="small"
        renderOption={(props, option, { selected }) => {
          const { key, ...rest } = props;
          return (
            <li key={key} {...rest}>
              <Checkbox
                style={{ marginRight: 8 }}
                checked={selected}
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
                <Typography variant="body2">{option.title}</Typography>
              </Box>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Chọn môn học"
            size="small"
          />
        )}
      />
    </Box>
  );
}

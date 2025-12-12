"use client";

import { Autocomplete, Box, Checkbox, TextField, Typography } from "@mui/material";
import { useFieldArray, useWatch } from "react-hook-form";
import { Course } from "@/modules/plans/plan-form.schema";
import { usePlanFormContext } from "@/modules/plans/use-plan-form-context";
import TopicCard from "../../TopicCard";
import { renderCourseTags } from "../../../helper";

interface TopicCourseSelectorProps {
  topic: any;
  programIndex: number;
  topicIndex: number;
  availableCourses: Course[];
}

export default function TopicCourseSelector({
  topic,
  programIndex,
  topicIndex,
  availableCourses,
}: TopicCourseSelectorProps) {
  const { control } = usePlanFormContext();
  const { replace } = useFieldArray({
    control,
    name: `programs.${programIndex}.topics.${topicIndex}.courses` as const,
  });

  const selectedCourses = useWatch({
    control,
    name: `programs.${programIndex}.topics.${topicIndex}.courses`,
  }) as Course[] | undefined;

  const handleCoursesChange = (_event: any, newValue: Course[]) => {
    replace(newValue);
  };

  return (
    <TopicCard topic={topic} mode="readonly">
      <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, border: "1px dashed", borderColor: "divider", bgcolor: "grey.50" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Môn học được gán
          </Typography>
        </Box>

        <Autocomplete
          multiple
          options={availableCourses}
          disableCloseOnSelect
          getOptionLabel={(option) => option.title}
          value={selectedCourses || []}
          onChange={handleCoursesChange}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderValue={(value) => renderCourseTags(value as Course[])}
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
    </TopicCard>
  );
}

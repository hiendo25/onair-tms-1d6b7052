"use client";

import { Box, Chip, Stack, Typography } from "@mui/material";
import { useFieldArray, useWatch } from "react-hook-form";

import { Course } from "@/modules/plans/plan-form.schema";
import { usePlanFormContext } from "@/modules/plans/use-plan-form-context";
import { formatDateRange } from "../../../helper";

import ProgramCourseSelector from "./ProgramCourseSelector";
import TopicCourseSelector from "./TopicCourseSelector";

interface ProgramCardProps {
  program: any;
  programIndex: number;
  availableCourses: Course[];
}

export default function ProgramCard({
  program,
  programIndex,
  availableCourses,
}: ProgramCardProps) {
  const { control } = usePlanFormContext();
  const { fields: topics } = useFieldArray({
    control,
    name: `programs.${programIndex}.topics` as const,
  });

  const programCoursesArray = useFieldArray({
    control,
    name: `programs.${programIndex}.courses` as const,
  });

  const programCourses = useWatch({
    control,
    name: `programs.${programIndex}.courses`,
  }) as Course[] | undefined;

  const dateRange = formatDateRange(program.startDate, program.endDate);

  return (
    <Box
      sx={{
        p: 2.75,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        background: "linear-gradient(135deg, #f6f8ff 0%, #eef3ff 100%)",
        boxShadow: "0 12px 26px rgba(0,0,0,0.06)",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip label={`Chương trình ${programIndex + 1}`} size="small" color="primary" />
          {dateRange && (
            <Chip label={dateRange} size="small" variant="outlined" sx={{ borderColor: "primary.200" }} />
          )}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
          {program.name}
        </Typography>
      </Box>

      <Stack spacing={2}>
        {topics.length > 0 ? (
          topics.map((topic, topicIndex) => (
            <TopicCourseSelector
              key={topic.id}
              topic={topic}
              programIndex={programIndex}
              topicIndex={topicIndex}
              availableCourses={availableCourses}
            />
          ))
        ) : (
          <ProgramCourseSelector
            courses={programCourses || []}
            availableCourses={availableCourses}
            onChange={(newValue) => programCoursesArray.replace(newValue)}
          />
        )}
      </Stack>
    </Box>
  );
}

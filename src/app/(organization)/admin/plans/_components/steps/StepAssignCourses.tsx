"use client";

import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Control, FieldErrors, useFieldArray, useWatch } from "react-hook-form";
import { Course, PlanFormSchema } from "@/modules/plans/plan-form.schema";
import TopicCard from "../shared/TopicCard";
import { useGetPlanCourseOptionsQuery } from "@/modules/plans/operations/query";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { formatDateRange } from "../../helper";

interface StepAssignCoursesProps {
  control: Control<PlanFormSchema>;
  errors: FieldErrors<PlanFormSchema>;
  onBack: () => void;
  onSave: () => void;
  isLoading?: boolean;
}

export default function StepAssignCourses({
  control,
  errors,
  onBack,
  onSave,
  isLoading = false,
}: StepAssignCoursesProps) {
  const organizationId = useUserOrganization((state) => state.data.organization.id);
  const { data: availableCourses = [] } = useGetPlanCourseOptionsQuery(organizationId);
  const { fields: programs } = useFieldArray({
    control,
    name: "programs",
  });
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Bước 5: Gán môn học
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Gán môn học cho từng chủ đề (hoặc trực tiếp vào chương trình nếu không có chủ đề)
        </Typography>

        <Stack spacing={2}>
          {programs.map((program, programIndex) => {
            const dateRange = formatDateRange(program.startDate, program.endDate);

            return (
              <ProgramCard
                key={program.id}
                program={program}
                programIndex={programIndex}
                dateRange={dateRange}
                control={control}
                errors={errors}
                availableCourses={availableCourses}
              />
            );
          })}
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onBack}
            disabled={isLoading}
          >
            Quay lại
          </Button>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={isLoading}
          >
            Lưu
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

interface ProgramCardProps {
  program: any;
  programIndex: number;
  dateRange: string | null;
  control: Control<PlanFormSchema>;
  errors: FieldErrors<PlanFormSchema>;
  availableCourses: Course[];
}

function ProgramCard({
  program,
  programIndex,
  dateRange,
  control,
  errors,
  availableCourses,
}: ProgramCardProps) {
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

  const renderTags = (value: Course[]) => {
    if (!value || value.length === 0) return null;
    if (value.length === 1) return value[0]?.title || "";
    if (value.length === 2) return `${value[0]?.title || ""}, ${value[1]?.title || ""}`;
    return `${value[0]?.title || ""}, ${value[1]?.title || ""} +${value.length - 2}`;
  };

  return (
    <Box
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: "#1976d2",
        borderRadius: 1,
        bgcolor: "#e3f2fd",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {program.name}
        </Typography>
        {dateRange && (
          <Typography variant="body2" color="text.secondary">
            {dateRange}
          </Typography>
        )}
      </Box>

      <Stack spacing={2}>
        {topics.length > 0 ? (
          topics.map((topic, topicIndex) => (
            <TopicCardWithCourses
              key={topic.id}
              topic={topic}
              programIndex={programIndex}
              topicIndex={topicIndex}
              control={control}
              availableCourses={availableCourses}
            />
          ))
        ) : (
          <Box
            sx={{
              p: 2,
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "common.white",
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Gán môn học cho chương trình (không có chủ đề)
            </Typography>
            <Autocomplete
              multiple
              options={availableCourses}
              disableCloseOnSelect
              getOptionLabel={(option) => option.title}
              value={programCourses || []}
              onChange={(_e, newValue) => programCoursesArray.replace(newValue)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderValue={(value) => renderTags(value)}
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
        )}
      </Stack>
    </Box>
  );
}


interface TopicCardProps {
  topic: any;
  programIndex: number;
  topicIndex: number;
  control: Control<PlanFormSchema>;
  availableCourses: Course[];
}

function TopicCardWithCourses({
  topic,
  programIndex,
  topicIndex,
  control,
  availableCourses,
}: TopicCardProps) {
  const { replace } = useFieldArray({
    control,
    name: `programs.${programIndex}.topics.${topicIndex}.courses` as const,
  });

  // Get the actual course values from the form (without react-hook-form's internal id)
  const selectedCourses = useWatch({
    control,
    name: `programs.${programIndex}.topics.${topicIndex}.courses`,
  }) as Course[] | undefined;

  const handleCoursesChange = (_event: any, newValue: Course[]) => {
    replace(newValue);
  };

  // Custom renderTags to show selected courses as text with +N indicator
  const renderTags = (value: Course[]) => {
    if (!value || value.length === 0) return null;

    if (value.length === 1) {
      return value[0]?.title || "";
    }

    if (value.length === 2) {
      return `${value[0]?.title || ""}, ${value[1]?.title || ""}`;
    }

    // Show first two courses and +N for the rest
    return `${value[0]?.title || ""}, ${value[1]?.title || ""} +${value.length - 2}`;
  };

  return (
    <TopicCard topic={topic} mode="readonly">
      {/* Course Assignment Section */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Môn học được gán
          </Typography>
        </Box>

        {/* Course Selection Autocomplete with Checkboxes */}
        <Autocomplete
          multiple
          options={availableCourses}
          disableCloseOnSelect
          getOptionLabel={(option) => option.title}
          value={selectedCourses || []}
          onChange={handleCoursesChange}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderValue={(value) => renderTags(value)}
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

"use client";

import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useFieldArray, useWatch } from "react-hook-form";
import { Course } from "@/modules/plans/plan-form.schema";
import TopicCard from "../TopicCard";
import { useGetPlanCourseOptionsQuery } from "@/modules/plans/operations/query";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { formatDateRange } from "../../helper";
import { usePlanFormContext } from "@/modules/plans/use-plan-form-context";

interface StepAssignCoursesProps {
  onBack: () => void;
  onSave: () => void;
  isLoading?: boolean;
}

export default function StepAssignCourses({
  onBack,
  onSave,
  isLoading = false,
}: StepAssignCoursesProps) {
  const { control } = usePlanFormContext();
  const organizationId = useUserOrganization((state) => state.data.organization.id);
  const { data: availableCourses = [] } = useGetPlanCourseOptionsQuery(organizationId);
  const { fields: programs } = useFieldArray({
    control,
    name: "programs",
  });
  return (
    <Card sx={{ boxShadow: "0 14px 44px rgba(9, 30, 66, 0.08)", border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box>
            <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: 0.6 }}>
              Bước 5
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Gán môn học
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Gán môn học cho từng chủ đề hoặc trực tiếp vào chương trình.
            </Typography>
          </Box>
          <Chip label="Hoàn tất" color="primary" variant="outlined" size="small" />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          {programs.map((program, programIndex) => {
            const dateRange = formatDateRange(program.startDate, program.endDate);

            return (
              <ProgramCard
                key={program.id}
                program={program}
                programIndex={programIndex}
                dateRange={dateRange}
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
  availableCourses: Course[];
}

function ProgramCard({
  program,
  programIndex,
  dateRange,
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

  const renderTags = (value: Course[]) => {
    if (!value || value.length === 0) return null;
    if (value.length === 1) return value[0]?.title || "";
    if (value.length === 2) return `${value[0]?.title || ""}, ${value[1]?.title || ""}`;
    return `${value[0]?.title || ""}, ${value[1]?.title || ""} +${value.length - 2}`;
  };

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
            <TopicCardWithCourses
              key={topic.id}
              topic={topic}
              programIndex={programIndex}
              topicIndex={topicIndex}
              availableCourses={availableCourses}
            />
          ))
        ) : (
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
              value={programCourses || []}
              onChange={(_e, newValue) => programCoursesArray.replace(newValue)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderValue={(value) => renderTags(value)}
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
        )}
      </Stack>
    </Box>
  );
}


interface TopicCardProps {
  topic: any;
  programIndex: number;
  topicIndex: number;
  availableCourses: Course[];
}

function TopicCardWithCourses({
  topic,
  programIndex,
  topicIndex,
  availableCourses,
}: TopicCardProps) {
  const { control } = usePlanFormContext();
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
      <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, border: "1px dashed", borderColor: "divider", bgcolor: "grey.50" }}>
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

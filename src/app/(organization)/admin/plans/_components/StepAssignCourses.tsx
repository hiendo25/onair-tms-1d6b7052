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
import dayjs, { Dayjs } from "dayjs";
import TopicCard from "./shared/TopicCard";

interface StepAssignCoursesProps {
  control: Control<PlanFormSchema>;
  errors: FieldErrors<PlanFormSchema>;
  onBack: () => void;
  onSave: () => void;
  isLoading?: boolean;
}

// Mock data for available courses
const MOCK_COURSES: Course[] = [
  { id: "1", title: "4 buổi làm sao quản lý kỹ năng giao tiếp" },
  { id: "2", title: "Môn học Kỹ năng làm việc đội nhóm" },
  { id: "3", title: "Môn học làm sao chuyển đổi số" },
  { id: "4", title: "Kỹ năng lãnh đạo cơ bản" },
  { id: "5", title: "Quản lý thời gian hiệu quả" },
  { id: "6", title: "Kỹ năng thuyết trình" },
  { id: "7", title: "Tư duy phản biện" },
  { id: "8", title: "Kỹ năng giải quyết vấn đề" },
  { id: "9", title: "Làm việc nhóm hiệu quả" },
  { id: "10", title: "Kỹ năng đàm phán" },
];

export default function StepAssignCourses({
  control,
  errors,
  onBack,
  onSave,
  isLoading = false,
}: StepAssignCoursesProps) {
  const { fields: programs } = useFieldArray({
    control,
    name: "programs",
  });

  const formatDateRange = (startDate?: string | Dayjs, endDate?: string | Dayjs) => {
    if (!startDate || !endDate) return null;

    const start = typeof startDate === "string" ? dayjs(startDate, "DD/MM/YYYY") : startDate;
    const end = typeof endDate === "string" ? dayjs(endDate, "DD/MM/YYYY") : endDate;

    if (!start.isValid() || !end.isValid()) return null;
    return `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Bước 5: Gán môn học
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Gán môn học cho từng chủ đề trong chương trình đào tạo
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
}

function ProgramCard({
  program,
  programIndex,
  dateRange,
  control,
  errors,
}: ProgramCardProps) {
  const { fields: topics } = useFieldArray({
    control,
    name: `programs.${programIndex}.topics` as const,
  });

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
        {topics.map((topic, topicIndex) => (
          <TopicCardWithCourses
            key={topic.id}
            topic={topic}
            programIndex={programIndex}
            topicIndex={topicIndex}
            control={control}
          />
        ))}
      </Stack>
    </Box>
  );
}


interface TopicCardProps {
  topic: any;
  programIndex: number;
  topicIndex: number;
  control: Control<PlanFormSchema>;
}

function TopicCardWithCourses({
  topic,
  programIndex,
  topicIndex,
  control,
}: TopicCardProps) {
  const { fields: courses, replace } = useFieldArray({
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

  const handleCreateCourse = () => {
    // TODO: Implement create course functionality
    console.log("Create course clicked - to be implemented");
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
          <Button
            variant="outlined"
            size="small"
            onClick={handleCreateCourse}
            sx={{ textTransform: "none" }}
          >
            Tạo môn học
          </Button>
        </Box>

        {/* Course Selection Autocomplete with Checkboxes */}
        <Autocomplete
          multiple
          options={MOCK_COURSES}
          disableCloseOnSelect
          getOptionLabel={(option) => option.title}
          value={selectedCourses || []}
          onChange={handleCoursesChange}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderTags={(value) => renderTags(value)}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                style={{ marginRight: 8 }}
                checked={selected}
              />
              {option.title}
            </li>
          )}
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



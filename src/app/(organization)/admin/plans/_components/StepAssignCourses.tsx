"use client";

import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Control, FieldErrors, useFieldArray, useWatch } from "react-hook-form";
import { Course, PlanFormSchema } from "@/modules/plans/plan-form.schema";
import dayjs, { Dayjs } from "dayjs";
import TopicCard from "./shared/TopicCard";
import CreateCourseDialog from "./CreateCourseDialog";
import { useState } from "react";

interface StepAssignCoursesProps {
  control: Control<PlanFormSchema>;
  errors: FieldErrors<PlanFormSchema>;
  onBack: () => void;
  onSave: () => void;
  isLoading?: boolean;
}

// Initial mock data for available courses
const INITIAL_MOCK_COURSES: Course[] = [
  { id: "1", title: "4 buổi làm sao quản lý kỹ năng giao tiếp" },
  { id: "2", title: "Môn học Kỹ năng làm việc đội nhóm" },
  { id: "3", title: "Môn học làm sao chuyển đổi số", labels: ["Lớp Sáng", "Lớp Tối", "Lớp 2,4,6"] },
  { id: "4", title: "Môn học làm sao sử dụng AI doanh nghiệp B2B", labels: ["Lớp Sáng", "Lớp Tối", "Lớp 2,4,6", "Lớp 2,4,6"] },
  { id: "5", title: "Ứng dụng AI vào tối ưu giao tiếp", labels: ["Lớp Sáng", "Lớp Tối", "Lớp 2,4,6", "Lớp 2,4,6"] },
  { id: "6", title: "Làm sao chuyển đổi được nhân viên" },
  { id: "7", title: "Kỹ năng lãnh đạo cơ bản" },
  { id: "8", title: "Quản lý thời gian hiệu quả" },
  { id: "9", title: "Kỹ năng thuyết trình" },
  { id: "10", title: "Tư duy phản biện" },
];

export default function StepAssignCourses({
  control,
  errors,
  onBack,
  onSave,
  isLoading = false,
}: StepAssignCoursesProps) {
  // State for available courses (allows adding new courses)
  const [availableCourses, setAvailableCourses] = useState<Course[]>(INITIAL_MOCK_COURSES);

  const { fields: programs } = useFieldArray({
    control,
    name: "programs",
  });

  const handleAddCourse = (course: Course) => {
    setAvailableCourses((prev) => [...prev, course]);
  };

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
                availableCourses={availableCourses}
                onAddCourse={handleAddCourse}
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
  onAddCourse: (course: Course) => void;
}

function ProgramCard({
  program,
  programIndex,
  dateRange,
  control,
  errors,
  availableCourses,
  onAddCourse,
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
            availableCourses={availableCourses}
            onAddCourse={onAddCourse}
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
  availableCourses: Course[];
  onAddCourse: (course: Course) => void;
}

function TopicCardWithCourses({
  topic,
  programIndex,
  topicIndex,
  control,
  availableCourses,
  onAddCourse,
}: TopicCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleCreateCourseSubmit = (courseData: Omit<Course, "id">) => {
    // Generate unique ID for new course
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      ...courseData,
    };

    // Add to available courses list
    onAddCourse(newCourse);

    // Auto-select the new course in current topic
    const updatedCourses = [...(selectedCourses || []), newCourse];
    replace(updatedCourses);
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
          options={availableCourses}
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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
                <Typography variant="body2">{option.title}</Typography>
                {option.labels && option.labels.length > 0 && (
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {option.labels.map((label, index) => (
                      <Chip
                        key={`${option.id}-${label}-${index}`}
                        label={label}
                        size="small"
                        color="success"
                      />
                    ))}
                  </Box>
                )}
              </Box>
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

      {/* Create Course Dialog */}
      <CreateCourseDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onCreateCourse={handleCreateCourseSubmit}
      />
    </TopicCard>
  );
}



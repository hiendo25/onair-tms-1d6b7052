"use client";

import React, { useCallback } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import { QUESTION_TYPE_OPTIONS } from "@/constants/survey.constant";
import { SurveyFormSchema, surveySchema } from "@/modules/surveys/survey-form.schema";
import { TrashIcon1 } from "@/shared/assets/icons";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { QuestionType, Survey } from "@/types/survey.types";

import SortableQuestionItem from "./SortableQuestionItem";

interface QuestionOptionsSectionProps {
  control: any;
  questionIndex: number;
}

function QuestionOptionsSection({ control, questionIndex }: QuestionOptionsSectionProps) {
  const questionType = useWatch({
    control,
    name: `questions.${questionIndex}.type`,
  }) as QuestionType;

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
    replace,
  } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  const shouldShowOptions = questionType === "radio" || questionType === "checkbox" || questionType === "select";

  React.useEffect(() => {
    if (shouldShowOptions && (!optionFields || optionFields.length === 0)) {
      replace(["", ""]);
    } else if (!shouldShowOptions && optionFields && optionFields.length > 0) {
      replace([]);
    }
  }, [shouldShowOptions, optionFields, replace]);

  if (!shouldShowOptions) {
    return null;
  }

  const handleAddOption = () => {
    appendOption("");
  };

  return (
    <Box>
      <FormLabel>
        Tùy chọn <span className="text-red-600">*</span>
      </FormLabel>
      <Stack spacing={1} sx={{ mt: 1 }}>
        {optionFields.map((field, optionIndex) => (
          <Box key={field.id} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Controller
              control={control}
              name={`questions.${questionIndex}.options.${optionIndex}`}
              render={({ field: optionField, fieldState: { error } }) => (
                <TextField
                  {...optionField}
                  placeholder={`Tùy chọn ${optionIndex + 1}`}
                  size="small"
                  fullWidth
                  error={!!error}
                  sx={{ background: "white" }}
                />
              )}
            />
            <IconButton
              color="error"
              size="small"
              onClick={() => removeOption(optionIndex)}
              disabled={optionFields.length <= 2}
            >
              <TrashIcon1 />
            </IconButton>
          </Box>
        ))}
        <Button
          variant="outlined"
          size="small"
          startIcon={<PlusIcon />}
          onClick={handleAddOption}
          sx={{ alignSelf: "flex-start" }}
        >
          Thêm tùy chọn
        </Button>
        {/* <Controller
          control={control}
          name={`questions.${questionIndex}.options`}
          render={({ fieldState: { error } }) =>
            error?.message ? (
              <FormHelperText error>{error.message}</FormHelperText>
            ) : null
          }
        /> */}
      </Stack>
    </Box>
  );
}

interface SurveyFormProps {
  initialData?: Survey;
  onSubmit: (data: SurveyFormSchema) => void;
  isLoading?: boolean;
}

export default function SurveyForm({ initialData, onSubmit, isLoading = false }: SurveyFormProps) {
  const router = useRouter();

  const defaultValues: SurveyFormSchema = initialData
    ? {
        name: initialData.name,
        description: initialData.description,
        questions: initialData.questions,
      }
    : {
        name: "",
        description: "",
        questions: [{ id: uuidv4(), label: "", type: "text", is_required: false }],
      };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SurveyFormSchema>({
    resolver: zodResolver(surveySchema),
    defaultValues,
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "questions",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id;
    const overId = over?.id;

    if (!over || activeId === overId) return;

    const activeIndex = fields.findIndex((field) => field.id === activeId);
    const overIndex = fields.findIndex((field) => field.id === overId);

    move(activeIndex, overIndex);
  };

  const handleAddQuestion = () => {
    append({ id: uuidv4(), label: "", type: "text", is_required: false });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <RHFTextField
                control={control}
                name="name"
                label="Tên khảo sát"
                placeholder="Nhập tên khảo sát"
                required
              />

              <RHFTextAreaField
                control={control}
                name="description"
                label="Mô tả"
                placeholder="Nhập mô tả khảo sát"
                required
                minRows={3}
                maxRows={6}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">Câu hỏi</Typography>
                <Button variant="outlined" startIcon={<PlusIcon />} onClick={handleAddQuestion} size="small">
                  Thêm câu hỏi
                </Button>
              </Box>

              {errors.questions?.message && (
                <Typography color="error" variant="body2">
                  {errors.questions.message}
                </Typography>
              )}

              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
                  <Stack spacing={2}>
                    {fields.map((field, index) => (
                      <SortableQuestionItem key={field.id} id={field.id}>
                        <Stack spacing={2}>
                          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                            <Box sx={{ flex: 1 }}>
                              <Controller
                                control={control}
                                name={`questions.${index}.label`}
                                render={({ field: inputField, fieldState: { error } }) => (
                                  <FormControl fullWidth error={!!error}>
                                    <FormLabel>
                                      Câu hỏi <span className="text-red-600">*</span>
                                    </FormLabel>
                                    <TextField
                                      {...inputField}
                                      placeholder="Nhập câu hỏi"
                                      size="small"
                                      error={!!error}
                                      sx={{ background: "white" }}
                                    />
                                    {error && <FormHelperText error>{error.message}</FormHelperText>}
                                  </FormControl>
                                )}
                              />
                            </Box>

                            <Box sx={{ minWidth: 200 }}>
                              <Controller
                                control={control}
                                name={`questions.${index}.type`}
                                render={({ field: selectField }) => (
                                  <FormControl fullWidth size="small">
                                    <FormLabel>Loại câu hỏi</FormLabel>
                                    <Select {...selectField}>
                                      {QUESTION_TYPE_OPTIONS.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                          {option.label}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                )}
                              />
                            </Box>

                            <IconButton
                              color="error"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                              sx={{ mt: 3 }}
                            >
                              <TrashIcon1 />
                            </IconButton>
                          </Box>

                          <QuestionOptionsSection control={control} questionIndex={index} />

                          <Controller
                            control={control}
                            name={`questions.${index}.is_required`}
                            render={({ field: checkboxField }) => (
                              <FormControlLabel
                                control={<Checkbox checked={checkboxField.value} onChange={checkboxField.onChange} />}
                                label="Bắt buộc"
                              />
                            )}
                          />
                        </Stack>
                      </SortableQuestionItem>
                    ))}
                  </Stack>
                </SortableContext>
              </DndContext>
            </Stack>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={handleCancel} disabled={isLoading}>
            Hủy
          </Button>
          <Button variant="contained" type="submit" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : initialData ? "Cập nhật" : "Tạo khảo sát"}
          </Button>
        </Box>
      </Stack>
    </form>
  );
}

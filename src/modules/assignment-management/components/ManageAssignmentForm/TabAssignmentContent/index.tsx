"use client";
import { memo, useCallback } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { type Assignment, type Question, type QuestionOption } from "../../assignment-form.schema";
import { Button, Checkbox, Divider, FormControl, FormControlLabel, FormLabel, IconButton, MenuItem, Select, Typography } from "@mui/material";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import { TrashIcon1 } from "@/shared/assets/icons";
import { v4 as uuidv4 } from "uuid";
import { Database } from "@/types/supabase.types";
import FileUpload from "@/shared/ui/form/FileUpload";

interface TabAssignmentContentProps {}

type QuestionType = Database["public"]["Enums"]["question_type"];

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  file: "Tệp tin",
  text: "Tự luận",
  checkbox: "Trắc nghiệm (nhiều câu trả lời đúng)",
  radio: "Trắc nghiệm (1 câu trả lời đúng)",
};

const getQuestionInitData = (): Question => {
  return {
    type: "file",
    label: "",
    score: 1,
  };
};

const TabAssignmentContent: React.FC<TabAssignmentContentProps> = () => {
  const { control, setValue } = useFormContext<Assignment>();

  const {
    fields: questionFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "questions",
    keyName: "_questionId",
  });

  const watchedQuestions = useWatch({ control, name: "questions" }) || [];

  const handleAddQuestion = useCallback(() => {
    append(getQuestionInitData());
  }, [append]);

  const handleQuestionTypeChange = useCallback((index: number, newType: QuestionType) => {
    setValue(`questions.${index}.type`, newType);

    if (newType === "checkbox" || newType === "radio") {
      setValue(`questions.${index}.options`, [
        { id: uuidv4(), label: "", correct: false }
      ]);
    } else {
      setValue(`questions.${index}.options`, undefined);
    }
  }, [setValue]);

  const handleAddOption = useCallback((questionIndex: number, currentOptions: QuestionOption[] = []) => {
    const newOption: QuestionOption = {
      id: uuidv4(),
      label: "",
      correct: false,
    };
    setValue(`questions.${questionIndex}.options`, [...currentOptions, newOption]);
  }, [setValue]);

  const handleRemoveOption = useCallback((questionIndex: number, optionIndex: number, currentOptions: QuestionOption[] = []) => {
    const newOptions = currentOptions.filter((_, idx) => idx !== optionIndex);
    setValue(`questions.${questionIndex}.options`, newOptions);
  }, [setValue]);

  const handleOptionCorrectChange = useCallback((questionIndex: number, optionIndex: number, checked: boolean, currentOptions: QuestionOption[] = [], questionType?: QuestionType) => {
    const newOptions = [...currentOptions];

    if (questionType === "radio" && checked) {
      newOptions.forEach((opt, idx) => {
        if (idx !== optionIndex) {
          newOptions[idx] = { ...opt, correct: false };
        }
      });
    }

    const currentOption = newOptions[optionIndex];
    newOptions[optionIndex] = {
      id: currentOption?.id || uuidv4(),
      label: currentOption?.label || "",
      correct: checked
    };
    setValue(`questions.${questionIndex}.options`, newOptions);
  }, [setValue]);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-xl p-6">
        <div className="mb-4">
          <Typography variant="h6" className="text-base font-semibold">
            Danh sách câu hỏi
          </Typography>
          <Typography className="text-xs text-gray-600 mt-1">
            Tạo ít nhất 1 câu hỏi cho bài kiểm tra.
          </Typography>
        </div>

        {questionFields.length > 0 && (
          <div className="flex flex-col gap-4 mb-6">
            {questionFields.map((field, index) => {
              const questionType = watchedQuestions[index]?.type || "file";
              const questionOptions = watchedQuestions[index]?.options || [];

              return (
                <div key={field._questionId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <Typography className="text-sm font-medium text-gray-700">Câu hỏi {index + 1}</Typography>
                    <IconButton
                      size="small"
                      className="p-0 bg-transparent"
                      onClick={() => remove(index)}
                      disabled={questionFields.length === 1}
                    >
                      <TrashIcon1 className="w-4 h-4" />
                    </IconButton>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                      <FormControl sx={{ width: '75%' }}>
                        <FormLabel className="text-sm mb-2">
                          Loại câu hỏi <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          value={questionType || "file"}
                          onChange={(e) => handleQuestionTypeChange(index, e.target.value as QuestionType)}
                          size="small"
                        >
                          <MenuItem value="file">{QUESTION_TYPE_LABELS.file}</MenuItem>
                          <MenuItem value="text">{QUESTION_TYPE_LABELS.text}</MenuItem>
                          <MenuItem value="checkbox">{QUESTION_TYPE_LABELS.checkbox}</MenuItem>
                          <MenuItem value="radio">{QUESTION_TYPE_LABELS.radio}</MenuItem>
                        </Select>
                      </FormControl>

                      <RHFTextField
                        control={control}
                        name={`questions.${index}.score`}
                        label="Điểm"
                        placeholder="0"
                        type="number"
                        required
                        sx={{ width: '25%' }}
                        inputProps={{ min: 0.1, step: 0.1 }}
                      />
                    </div>

                    <RHFTextField
                      control={control}
                      name={`questions.${index}.label`}
                      label="Nội dung câu hỏi"
                      placeholder="Nhập nội dung câu hỏi"
                      required
                    />

                    <FileUpload
                      value={watchedQuestions[index]?.attachments}
                      onChange={(urls) => setValue(`questions.${index}.attachments`, urls)}
                      label="Đính kèm tệp tin (không bắt buộc)"
                    />

                    {(questionType === "checkbox" || questionType === "radio") && (
                      <div className="flex flex-col gap-3">
                        <FormLabel className="text-sm">
                          Các tùy chọn <span className="text-red-500">*</span>
                        </FormLabel>

                        {questionOptions && questionOptions.length > 0 && (
                          <div className="flex flex-col gap-2">
                            {questionOptions.map((option, optionIndex) => (
                              <div key={option.id} className="flex items-start gap-2">
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={option.correct}
                                      onChange={(e) => handleOptionCorrectChange(index, optionIndex, e.target.checked, questionOptions, questionType)}
                                      size="small"
                                    />
                                  }
                                  label={
                                    <Typography className="text-xs text-gray-600">
                                      Đáp án đúng
                                    </Typography>
                                  }
                                  className="mr-2 mt-2"
                                />
                                <RHFTextField
                                  control={control}
                                  name={`questions.${index}.options.${optionIndex}.label`}
                                  placeholder={`Tùy chọn ${optionIndex + 1}`}
                                  className="flex-1"
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveOption(index, optionIndex, questionOptions)}
                                  disabled={questionOptions.length === 1}
                                  className="mt-2"
                                >
                                  <TrashIcon1 className="w-4 h-4" />
                                </IconButton>
                              </div>
                            ))}
                          </div>
                        )}

                        <Button
                          onClick={() => handleAddOption(index, questionOptions)}
                          startIcon={<PlusIcon />}
                          variant="outlined"
                          size="small"
                          className="self-start"
                        >
                          Thêm tùy chọn
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Divider>
          <Button onClick={handleAddQuestion} startIcon={<PlusIcon />} variant="outlined" size="small">
            Thêm câu hỏi
          </Button>
        </Divider>
      </div>
    </div>
  );
};

export default memo(TabAssignmentContent);


"use client";
import React, { memo, useCallback } from "react";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { QUESTION_TYPE_LABELS, QuestionType } from "@/modules/assignment-management/constants/question.constants";
import useQuestionEditorHandlers from "@/modules/assignment-management/hooks/useQuestionEditorHandlers";
import { createDefaultQuestion } from "@/modules/assignment-management/utils/question.utils";
import { TrashIcon1 } from "@/shared/assets/icons";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import FileUpload from "@/shared/ui/form/FileUpload";
import RHFNumberField from "@/shared/ui/form/RHFNumberField";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { type MatchingQuestionData, type Question } from "../assignment-form.schema";
import MatchingQuestionEditor from "../ManageAssignmentForm/TabAssignmentContent/MatchingQuestionEditor";
import SortableOrderItem from "../ManageAssignmentForm/TabAssignmentContent/SortableOrderItem";

interface QuestionsEditorProps {
  title?: string;
  description?: string;
  allowAddQuestion?: boolean;
  allowRemoveQuestion?: boolean;
  minQuestions?: number;
}

type QuestionFormValues = {
  questions: Question[];
};

const QuestionsEditor: React.FC<QuestionsEditorProps> = ({
  title = "Danh sách câu hỏi",
  description = "Tạo ít nhất 1 câu hỏi cho bài kiểm tra.",
  allowAddQuestion = true,
  allowRemoveQuestion = true,
  minQuestions = 1,
}) => {
  const { control, setValue } = useFormContext<QuestionFormValues>();

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

  // Initialize sensors for drag-and-drop at the top level (used by all order questions)
  const sensors = useSensors(useSensor(PointerSensor));

  const {
    handleQuestionTypeChange,
    handleAddOption,
    handleRemoveOption,
    handleOptionCorrectChange,
    handleMatchingDataChange,
    handleAddOrderItem,
    handleRemoveOrderItem,
    handleDragEndOrderItem,
  } = useQuestionEditorHandlers({ setValue });

  const handleAddQuestion = useCallback(() => {
    if (!allowAddQuestion) {
      return;
    }
    append(createDefaultQuestion());
  }, [append, allowAddQuestion]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl px-3 md:p-6 flex flex-col gap-6 border border-gray-200">
        <div className="mb-4">
          <Typography variant="h6" className="text-base font-semibold">
            {title}
          </Typography>
          <Typography className="text-xs text-gray-600 mt-1">{description}</Typography>
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
                      disabled={!allowRemoveQuestion || questionFields.length <= minQuestions}
                    >
                      <TrashIcon1 className="w-4 h-4" />
                    </IconButton>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                      <FormControl sx={{ width: "75%" }}>
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
                          <MenuItem value="matching">{QUESTION_TYPE_LABELS.matching}</MenuItem>
                          <MenuItem value="true_false">{QUESTION_TYPE_LABELS.true_false}</MenuItem>
                          <MenuItem value="order">{QUESTION_TYPE_LABELS.order}</MenuItem>
                        </Select>
                      </FormControl>

                      <RHFNumberField
                        control={control}
                        name={`questions.${index}.score`}
                        label="Điểm"
                        placeholder="0"
                        required
                        sx={{ width: "25%" }}
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
                                      onChange={(e) =>
                                        handleOptionCorrectChange(
                                          index,
                                          optionIndex,
                                          e.target.checked,
                                          questionOptions,
                                          questionType,
                                        )
                                      }
                                      size="small"
                                    />
                                  }
                                  label={<Typography className="text-xs text-gray-600">Đáp án đúng</Typography>}
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

                    {/* True/False Question Type */}
                    {questionType === "true_false" && (
                      <div className="flex flex-col gap-3">
                        <FormLabel className="text-sm">
                          Chọn đáp án đúng <span className="text-red-500">*</span>
                        </FormLabel>

                        {questionOptions && questionOptions.length === 2 && (
                          <div className="flex flex-col gap-2">
                            {questionOptions.map((option, optionIndex) => (
                              <div key={option.id} className="flex items-center gap-2">
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={option.correct}
                                      onChange={(e) =>
                                        handleOptionCorrectChange(
                                          index,
                                          optionIndex,
                                          e.target.checked,
                                          questionOptions,
                                          questionType,
                                        )
                                      }
                                      size="small"
                                    />
                                  }
                                  label={<Typography className="text-sm font-medium">{option.label}</Typography>}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Matching Question Type */}
                    {questionType === "matching" &&
                      (() => {
                        const matchingData = watchedQuestions[index]?.matchingData;

                        // Provide default structure if matchingData is undefined
                        const defaultMatchingData: MatchingQuestionData = {
                          columnAItems: [],
                          columnBItems: [],
                          correctMappings: [],
                        };

                        return (
                          <MatchingQuestionEditor
                            matchingData={matchingData || defaultMatchingData}
                            onChange={(data) => handleMatchingDataChange(index, data)}
                          />
                        );
                      })()}

                    {/* Order Question Type */}
                    {questionType === "order" &&
                      (() => {
                        const orderItems = watchedQuestions[index]?.orderItems || [];

                        return (
                          <div className="flex flex-col gap-3">
                            <FormLabel className="text-sm">
                              Các mục cần sắp xếp <span className="text-red-500">*</span>
                            </FormLabel>
                            <Typography className="text-xs text-gray-600">
                              Kéo thả để sắp xếp các mục theo thứ tự đúng từ trên xuống dưới
                            </Typography>

                            {orderItems && orderItems.length > 0 && (
                              <DndContext
                                sensors={sensors}
                                onDragEnd={(event) => handleDragEndOrderItem(index, event, orderItems)}
                              >
                                <SortableContext
                                  items={orderItems.map((item) => item.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <div className="flex flex-col gap-2">
                                    {orderItems.map((item, itemIndex) => (
                                      <SortableOrderItem key={`${item.id}-${itemIndex}`} id={item.id}>
                                        <div className="flex items-start gap-2">
                                          <Typography className="text-sm font-medium text-gray-700 mt-2 min-w-[20px]">
                                            {itemIndex + 1}.
                                          </Typography>
                                          <RHFTextField
                                            control={control}
                                            name={`questions.${index}.orderItems.${itemIndex}.content`}
                                            placeholder={`Mục ${itemIndex + 1}`}
                                            className="flex-1"
                                            key={`${item.id}-${itemIndex}-field`}
                                          />
                                          <IconButton
                                            size="small"
                                            onClick={() => handleRemoveOrderItem(index, itemIndex, orderItems)}
                                            disabled={orderItems.length <= 2}
                                            className="mt-2"
                                          >
                                            <TrashIcon1 className="w-4 h-4" />
                                          </IconButton>
                                        </div>
                                      </SortableOrderItem>
                                    ))}
                                  </div>
                                </SortableContext>
                              </DndContext>
                            )}

                            <Button
                              onClick={() => handleAddOrderItem(index, orderItems)}
                              startIcon={<PlusIcon />}
                              variant="outlined"
                              size="small"
                              className="self-start"
                            >
                              Thêm mục
                            </Button>
                          </div>
                        );
                      })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {allowAddQuestion ? (
          <Divider>
            <Button onClick={handleAddQuestion} startIcon={<PlusIcon />} variant="outlined" size="small">
              Thêm câu hỏi
            </Button>
          </Divider>
        ) : null}
      </div>
    </div>
  );
};

export default memo(QuestionsEditor);

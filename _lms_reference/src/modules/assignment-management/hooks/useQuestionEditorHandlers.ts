import { useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { UseFormSetValue } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import type {
  MatchingQuestionData,
  OrderItem,
  QuestionOption,
} from "@/modules/assignment-management/components/assignment-form.schema";
import { QuestionType } from "@/modules/assignment-management/constants/question.constants";

interface UseQuestionEditorHandlersParams {
  setValue: UseFormSetValue<any>;
}

const useQuestionEditorHandlers = ({ setValue }: UseQuestionEditorHandlersParams) => {
  const handleQuestionTypeChange = useCallback(
    (index: number, newType: QuestionType) => {
      setValue(`questions.${index}.type`, newType);

      // Clear all type-specific fields first
      setValue(`questions.${index}.options`, undefined);
      setValue(`questions.${index}.matchingData`, undefined);
      setValue(`questions.${index}.orderItems`, undefined);

      // Initialize based on new type
      if (newType === "checkbox" || newType === "radio") {
        setValue(`questions.${index}.options`, [{ id: uuidv4(), label: "", correct: false }]);
      } else if (newType === "true_false") {
        setValue(`questions.${index}.options`, [
          { id: uuidv4(), label: "Đúng", correct: false },
          { id: uuidv4(), label: "Sai", correct: false },
        ]);
      } else if (newType === "matching") {
        const columnAItems = [
          { id: uuidv4(), content: "" },
          { id: uuidv4(), content: "" },
        ];
        const columnBItems = [
          { id: uuidv4(), content: "" },
          { id: uuidv4(), content: "" },
        ];

        setValue(`questions.${index}.matchingData`, {
          columnAItems,
          columnBItems,
          correctMappings: columnAItems.map((item, itemIndex) => ({
            columnAId: item.id,
            columnBId: columnBItems?.[itemIndex]?.id!,
          })),
        });
      } else if (newType === "order") {
        setValue(`questions.${index}.orderItems`, [
          { id: uuidv4(), content: "", correctOrder: 0, displayOrder: 0 },
          { id: uuidv4(), content: "", correctOrder: 1, displayOrder: 1 },
        ]);
      }
    },
    [setValue],
  );

  const handleAddOption = useCallback(
    (questionIndex: number, currentOptions: QuestionOption[] = []) => {
      const newOption: QuestionOption = {
        id: uuidv4(),
        label: "",
        correct: false,
      };
      setValue(`questions.${questionIndex}.options`, [...currentOptions, newOption]);
    },
    [setValue],
  );

  const handleRemoveOption = useCallback(
    (questionIndex: number, optionIndex: number, currentOptions: QuestionOption[] = []) => {
      const newOptions = currentOptions.filter((_, idx) => idx !== optionIndex);
      setValue(`questions.${questionIndex}.options`, newOptions);
    },
    [setValue],
  );

  const handleOptionCorrectChange = useCallback(
    (
      questionIndex: number,
      optionIndex: number,
      checked: boolean,
      currentOptions: QuestionOption[] = [],
      questionType?: QuestionType,
    ) => {
      const newOptions = [...currentOptions];

      if ((questionType === "radio" || questionType === "true_false") && checked) {
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
        correct: checked,
      };
      setValue(`questions.${questionIndex}.options`, newOptions);
    },
    [setValue],
  );

  const handleMatchingDataChange = useCallback(
    (questionIndex: number, data: MatchingQuestionData) => {
      setValue(`questions.${questionIndex}.matchingData`, data);
    },
    [setValue],
  );

  const handleAddOrderItem = useCallback(
    (questionIndex: number, currentItems: OrderItem[] = []) => {
      const newItem: OrderItem = {
        id: uuidv4(),
        content: "",
        correctOrder: currentItems.length,
        displayOrder: currentItems.length,
      };
      setValue(`questions.${questionIndex}.orderItems`, [...currentItems, newItem]);
    },
    [setValue],
  );

  const handleRemoveOrderItem = useCallback(
    (questionIndex: number, itemIndex: number, currentItems: OrderItem[] = []) => {
      const newItems = currentItems.filter((_, idx) => idx !== itemIndex);
      const reorderedItems = newItems.map((item, idx) => ({
        ...item,
        correctOrder: idx,
        displayOrder: idx,
      }));
      setValue(`questions.${questionIndex}.orderItems`, reorderedItems);
    },
    [setValue],
  );

  const handleDragEndOrderItem = useCallback(
    (questionIndex: number, event: DragEndEvent, currentItems: OrderItem[] = []) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = currentItems.findIndex((item) => item.id === active.id);
      const newIndex = currentItems.findIndex((item) => item.id === over.id);

      const reorderedItems = arrayMove(currentItems, oldIndex, newIndex);

      const itemsWithUpdatedOrder = reorderedItems.map((item, idx) => ({
        ...item,
        correctOrder: idx,
        displayOrder: idx,
      }));

      setValue(`questions.${questionIndex}.orderItems`, itemsWithUpdatedOrder, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
    },
    [setValue],
  );

  return {
    handleQuestionTypeChange,
    handleAddOption,
    handleRemoveOption,
    handleOptionCorrectChange,
    handleMatchingDataChange,
    handleAddOrderItem,
    handleRemoveOrderItem,
    handleDragEndOrderItem,
  };
};

export default useQuestionEditorHandlers;

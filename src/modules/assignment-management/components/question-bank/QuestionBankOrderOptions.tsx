import React, { memo } from "react";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button, FormLabel, IconButton, Stack, Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";

import useQuestionEditorHandlers from "@/modules/assignment-management/hooks/useQuestionEditorHandlers";
import { TrashIcon1 } from "@/shared/assets/icons";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import SortableOrderItem from "../ManageAssignmentForm/TabAssignmentContent/SortableOrderItem";

import { QuestionBankFormValues } from "./question-bank.schema";

interface QuestionBankOrderOptionsProps {
  questionIndex?: number;
}

const QuestionBankOrderOptions = ({ questionIndex = 0 }: QuestionBankOrderOptionsProps) => {
  const { control, setValue } = useFormContext<QuestionBankFormValues>();
  const orderItems = useWatch({ control, name: `questions.${questionIndex}.orderItems` }) || [];

  const { handleAddOrderItem, handleRemoveOrderItem, handleDragEndOrderItem } = useQuestionEditorHandlers({
    setValue,
  });

  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <Stack spacing={2}>
      <FormLabel className="text-sm">
        Các mục cần sắp xếp <span className="text-red-500">*</span>
      </FormLabel>
      <Typography className="text-xs text-gray-600">
        Kéo thả để sắp xếp các mục theo thứ tự đúng từ trên xuống dưới
      </Typography>

      {orderItems.length > 0 && (
        <DndContext
          sensors={sensors}
          onDragEnd={(event) => handleDragEndOrderItem(questionIndex, event, orderItems)}
        >
          <SortableContext items={orderItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <Stack spacing={2}>
              {orderItems.map((item, itemIndex) => (
                <SortableOrderItem key={`${item.id}-${itemIndex}`} id={item.id}>
                  <div className="flex items-start gap-2">
                    <Typography className="text-sm font-medium text-gray-700 mt-2 min-w-[20px]">
                      {itemIndex + 1}.
                    </Typography>
                    <RHFTextField
                      control={control}
                      name={`questions.${questionIndex}.orderItems.${itemIndex}.content`}
                      placeholder={`Mục ${itemIndex + 1}`}
                      className="flex-1"
                      key={`${item.id}-${itemIndex}-field`}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveOrderItem(questionIndex, itemIndex, orderItems)}
                      disabled={orderItems.length <= 2}
                      className="mt-2"
                    >
                      <TrashIcon1 className="w-4 h-4" />
                    </IconButton>
                  </div>
                </SortableOrderItem>
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
      )}

      <Button
        onClick={() => handleAddOrderItem(questionIndex, orderItems)}
        startIcon={<PlusIcon />}
        variant="outlined"
        size="small"
        className="self-start"
      >
        Thêm mục
      </Button>
    </Stack>
  );
};

export default memo(QuestionBankOrderOptions);

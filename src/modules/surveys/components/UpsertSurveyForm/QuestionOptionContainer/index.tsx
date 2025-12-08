import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { UpsertSurveyFormData } from "../../../survey-form.schema";
import { Box, Button, FormLabel, IconButton, Stack } from "@mui/material";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { Trash01Icon } from "@/shared/assets/icons";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import PlusIcon from "@/shared/assets/icons/PlusIcon";
import SortableItem from "../SortableItem";
import OptionContentItem from "./OptionContentItem";

interface QuestionOptionsContainerProps {
  questionIndex: number;
  control: Control<UpsertSurveyFormData>;
}
const QuestionOptionsContainer = ({ control, questionIndex }: QuestionOptionsContainerProps) => {
  const [activeDragOptionId, setActiveDragOptionId] = useState<UniqueIdentifier>();

  const {
    fields: optionsFields,
    append,
    remove,
    move,
  } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
    keyName: "_optionId",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id;
    setActiveDragOptionId(activeId);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const activeId = active.id;
      const overId = over?.id;

      if (!over || activeId === overId) return;

      const activeIndex = optionsFields.findIndex((field) => field._optionId === activeId);
      const overIndex = optionsFields.findIndex((field) => field._optionId === overId);
      setActiveDragOptionId(undefined);
      move(activeIndex, overIndex);
    },
    [optionsFields, move],
  );

  const optionDragItem = useMemo(() => {
    const indexActiveSection = optionsFields.findIndex((opt) => opt._optionId === activeDragOptionId);
    const activeSectionDrag = optionsFields[indexActiveSection];
    if (indexActiveSection === -1 || !activeSectionDrag) return;

    return { index: indexActiveSection, option: activeSectionDrag };
  }, [activeDragOptionId, optionsFields]);

  // const handleAddQuestion = () => {
  // 	append({ label: "", type: "checkbox", is_required: false, options: [] });
  // };

  const handleAddOption = (type?: "other") => () => {
    append([{ content: "", is_other: type === "other" }]);
  };

  const alreadyHasOtherType = useMemo(() => {
    return optionsFields.some((it) => it.is_other);
  }, [optionsFields]);
  return (
    <Box>
      <FormLabel>
        Tùy chọn <span className="text-red-600">*</span>
      </FormLabel>
      <div className="h-3"></div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <SortableContext items={optionsFields.map((field) => field._optionId)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {optionsFields.map((field, _optIndex) => (
              <SortableItem key={field._optionId} id={field._optionId} padding={2} noBorder>
                <OptionContentItem
                  questionIndex={questionIndex}
                  optionIndex={_optIndex}
                  control={control}
                  onRemove={remove}
                />
              </SortableItem>
            ))}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {optionDragItem ? (
            <SortableItem id={optionDragItem.option._optionId} key={optionDragItem.option._optionId} padding={2}>
              <OptionContentItem
                questionIndex={questionIndex}
                optionIndex={optionDragItem.index}
                control={control}
                onRemove={() => {}}
              />
            </SortableItem>
          ) : null}
        </DragOverlay>
      </DndContext>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <div className="flex gap-2 items-center">
          <Button variant="outlined" size="small" startIcon={<PlusIcon />} onClick={handleAddOption()}>
            Thêm tùy chọn
          </Button>
          {!alreadyHasOtherType && (
            <>
              <span className="text-center bg-blue-200 rounded-lg text-xs px-1 py-0.5">Hoặc</span>
              <Button variant="outlined" size="small" onClick={handleAddOption("other")}>
                Tự nhập
              </Button>
            </>
          )}
        </div>
        {/* {error?.message ? <FormHelperText error>{error.message}</FormHelperText> : null} */}
      </Stack>
    </Box>
  );
};
export default QuestionOptionsContainer;

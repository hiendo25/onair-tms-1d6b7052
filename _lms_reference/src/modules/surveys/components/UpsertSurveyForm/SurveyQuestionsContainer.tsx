import React, { memo, useCallback, useMemo, useState } from "react";
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
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@mui/material";
import { get } from "lodash";
import { Control, FieldErrors, useFieldArray } from "react-hook-form";

import PlusIcon from "@/shared/assets/icons/PlusIcon";
import { useUpsertSurveyFormContext } from ".";

import QuestionContentItem from "./QuestionContentItem";
import SortableItem from "./SortableItem";
import { UpsertSurveyFormData } from "./survey-form.schema";

interface SurveyQuestionContainerProps {
  className?: string;
  control: Control<UpsertSurveyFormData>;
  errors: FieldErrors<UpsertSurveyFormData>;
}
const SurveyQuestionContainer: React.FC<SurveyQuestionContainerProps> = ({ errors, control }) => {
  const [activeDragQuestionId, setActiveDragQuestionId] = useState<UniqueIdentifier>();

  const questionsError = get(errors, "questions");
  const {
    fields: questionsFields,
    append,
    remove,
    move,
  } = useFieldArray({
    control,
    name: "questions",
    keyName: "_questionId",
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
    setActiveDragQuestionId(activeId);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const activeId = active.id;
      const overId = over?.id;

      if (!over || activeId === overId) return;

      const activeIndex = questionsFields.findIndex((field) => field._questionId === activeId);
      const overIndex = questionsFields.findIndex((field) => field._questionId === overId);
      setActiveDragQuestionId(undefined);
      move(activeIndex, overIndex);
    },
    [questionsFields, move],
  );

  const questionDraggingItem = useMemo(() => {
    const indexActiveSection = questionsFields.findIndex((sec) => sec._questionId === activeDragQuestionId);
    const activeSectionDrag = questionsFields[indexActiveSection];
    if (indexActiveSection === -1 || !activeSectionDrag) return;

    return { index: indexActiveSection, question: activeSectionDrag };
  }, [activeDragQuestionId, questionsFields]);

  const handleAddQuestion = () => {
    append([{ label: "", type: "checkbox", is_required: false, options: [] }]);
  };
  return (
    <div className="sections-container flex flex-col gap-6">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <SortableContext
          items={questionsFields.map((field) => field._questionId)}
          strategy={verticalListSortingStrategy}
        >
          {questionsFields.map((field, _questionIndex) => (
            <SortableItem key={field._questionId} id={field._questionId}>
              <QuestionContentItem
                questionIndex={_questionIndex}
                control={control}
                onRemove={remove}
                error={questionsError?.[_questionIndex]}
              />
            </SortableItem>
          ))}
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {questionDraggingItem ? (
            <SortableItem
              id={questionDraggingItem.question._questionId}
              key={questionDraggingItem.question._questionId}
            >
              <QuestionContentItem questionIndex={questionDraggingItem.index} control={control} onRemove={remove} />
            </SortableItem>
          ) : null}
        </DragOverlay>
      </DndContext>
      <div>
        <Button variant="fill" startIcon={<PlusIcon />} onClick={handleAddQuestion} size="small">
          Thêm câu hỏi
        </Button>
      </div>
    </div>
  );
};

export default memo(SurveyQuestionContainer);

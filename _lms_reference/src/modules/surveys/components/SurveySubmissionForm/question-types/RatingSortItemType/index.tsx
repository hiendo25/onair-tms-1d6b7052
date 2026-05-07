import React, { useCallback, useMemo, useState } from "react";
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
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Control, useFormContext, useWatch } from "react-hook-form";

import { QuestionWithRatingAndSortFormData, SurveySubmissionFormData } from "../../survey-submission.schema";

import SortableItem from "./SortableItem";

interface RatingSortItemTypeProps {
  className?: string;
  questionIndex: number;
  control: Control<SurveySubmissionFormData>;
  question: QuestionWithRatingAndSortFormData;
}
const RatingSortItemType: React.FC<RatingSortItemTypeProps> = ({ questionIndex, question }) => {
  const [activeDragSectionId, setActiveDragSectionId] = useState<UniqueIdentifier>();
  const { control, setValue } = useFormContext<SurveySubmissionFormData>();

  const answers = useWatch({
    control,
    name: `questions.${questionIndex}.answer`,
  }) as QuestionWithRatingAndSortFormData["answer"];

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
    setActiveDragSectionId(activeId);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const activeId = active.id;
      const overId = over?.id;
      setActiveDragSectionId(undefined);
      if (!overId || activeId === overId) return;

      const activeIndex = answers.findIndex((ans) => ans.optionId === activeId);
      const overIndex = answers.findIndex((ans) => ans.optionId === overId);

      if (activeIndex === -1 || overIndex === -1) return;

      const updateAnswers = arrayMove(answers, activeIndex, overIndex);
      setValue(`questions.${questionIndex}.answer`, updateAnswers);
    },
    [answers, questionIndex, setValue],
  );

  const draggingItem = useMemo(() => {
    const indexActiveSection = answers.findIndex((ans) => ans.optionId === activeDragSectionId);
    const activeSectionDrag = answers[indexActiveSection];
    if (indexActiveSection === -1 || !activeSectionDrag) return;

    return { index: indexActiveSection, data: activeSectionDrag };
  }, [activeDragSectionId, answers]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <SortableContext items={answers.map((ans) => ans.optionId)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {answers.map((ans, _indexSection) => (
            <SortableItem id={ans.optionId} key={ans.optionId} subLabel={`${_indexSection + 1}`}>
              {ans.optionText}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {draggingItem ? (
          <SortableItem
            id={draggingItem.data.optionId}
            subLabel={`${draggingItem.index + 1}`}
            key={draggingItem.data.optionId}
          >
            {draggingItem.data.optionText}
          </SortableItem>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
export default RatingSortItemType;

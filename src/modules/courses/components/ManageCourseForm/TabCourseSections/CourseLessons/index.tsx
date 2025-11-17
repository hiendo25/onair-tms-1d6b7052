import React, { forwardRef, memo, PropsWithChildren, useCallback, useImperativeHandle, useMemo, useState } from "react";
import { UpsertCourseFormData } from "@/modules/courses/components/ManageCourseForm/upsert-course.schema";
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
import { useFieldArray } from "react-hook-form";
import SortableLessionItem from "./SortableLessionItem";
import { LessonType } from "@/model/lesson.model";
import { useUpsertCourseFormContext } from "../../UpsertCourseFormContainer";
import LessonContentItem from "./LessonContentItem";

export const initLessonFormData = (type: LessonType): UpsertCourseFormData["sections"][number]["lessons"][number] => {
  return {
    lessonType: type,
    title: "",
    status: "active",
    content: "",
    resources: [],
    mainResource: undefined,
  };
};
export type CourseLessonsRef = {
  appendLesson: (type: LessonType) => { lessonIndex: number };
  removeLesson: (lessonIndex: number) => void;
};
export interface CourseLessonsProps extends PropsWithChildren {
  sectionIndex: number;
  editingLessonIndex?: number;
  hasLessonEditing?: (sessonIndex: number, lessonIndex: number) => boolean;
  onDelete?: (index: number) => void;
  onLessonClick?: (sectionIndex: number, lessionIndex: number) => void;
  onAddLession?: (sectionIndex: number) => void;
  isActive?: boolean;
}
const CourseLessons = forwardRef<CourseLessonsRef, CourseLessonsProps>(
  ({ sectionIndex, onLessonClick, hasLessonEditing, isActive }, ref) => {
    const [activeDragLessonId, setActiveDragLessonId] = useState<UniqueIdentifier>();
    const methods = useUpsertCourseFormContext();
    const {
      control,
      formState: { errors },
    } = methods;

    const {
      fields: lessons,
      remove,
      move,
      append,
    } = useFieldArray({
      control,
      name: `sections.${sectionIndex}.lessons`,
      keyName: "_lessionId",
    });

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5,
        },
      }),
    );

    const handleDragfStart = useCallback((evt: DragStartEvent) => {
      const { active } = evt;
      const activeId = active.id;
      setActiveDragLessonId(activeId);
    }, []);
    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id;
        const overId = over?.id;

        if (!over || activeId === overId) return;

        const activeIndex = lessons.findIndex((field) => field._lessionId === activeId);
        const overIndex = lessons.findIndex((field) => field._lessionId === overId);

        move(activeIndex, overIndex);
      },
      [lessons],
    );

    const lessonDraggingItem = useMemo(() => {
      const indexActiveSection = lessons.findIndex((sec) => sec._lessionId === activeDragLessonId);
      const activeSectionDrag = lessons[indexActiveSection];
      if (indexActiveSection === -1 || !activeSectionDrag) return;

      return { index: indexActiveSection, lesson: activeSectionDrag };
    }, [lessons, activeDragLessonId]);
    const handleClickLesson = useCallback(
      (lessonIndex: number) => () => {
        onLessonClick?.(sectionIndex, lessonIndex);
      },
      [sectionIndex],
    );

    const hasLessonError = useCallback(
      (lessonIndex: number) => {
        return Boolean(errors?.sections?.[sectionIndex]?.lessons?.[lessonIndex]);
      },
      [errors],
    );
    useImperativeHandle(
      ref,
      () => ({
        appendLesson: (type: LessonType) => {
          const nextLessonIndex = lessons.length;
          append(initLessonFormData(type));
          return { lessonIndex: nextLessonIndex, sectionIndex: sectionIndex };
        },
        removeLesson: remove,
      }),
      [sectionIndex],
    );
    return (
      <div className="section-item__body flex flex-col gap-2">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragfStart}>
          <SortableContext items={lessons.map((lession) => lession._lessionId)} strategy={verticalListSortingStrategy}>
            {lessons.map((lession, lessonIndex) => (
              <SortableLessionItem
                id={lession._lessionId}
                key={lession._lessionId}
                isActive={hasLessonEditing?.(sectionIndex, lessonIndex)}
                isError={hasLessonError(lessonIndex)}
              >
                <LessonContentItem
                  control={control}
                  sectionIndex={sectionIndex}
                  lessonIndex={lessonIndex}
                  onClick={handleClickLesson(lessonIndex)}
                />
              </SortableLessionItem>
            ))}
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {lessonDraggingItem ? (
              <SortableLessionItem id={lessonDraggingItem.lesson._lessionId}>
                <LessonContentItem
                  control={control}
                  sectionIndex={sectionIndex}
                  lessonIndex={lessonDraggingItem.index}
                />
              </SortableLessionItem>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    );
  },
);
export default memo(CourseLessons);

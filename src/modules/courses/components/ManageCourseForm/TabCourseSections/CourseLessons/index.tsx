import React, {
  forwardRef,
  memo,
  PropsWithChildren,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
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
import { isUndefined } from "lodash";

type LessonItem = UpsertCourseFormData["sections"][number]["lessons"][number];
export const initLessonFormData = (type: LessonType): LessonItem => {
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
  editingSectionIndex?: number;
  hasLessonEditing?: (sessonIndex: number, lessonIndex: number) => boolean;
  onDelete?: (index: number) => void;
  onLessonClick?: (sectionIndex: number, lessionIndex: number) => void;
  onAddLession?: (sectionIndex: number) => void;
  onLessonDragStart?: (id: UniqueIdentifier) => void;
}
const CourseLessons = forwardRef<CourseLessonsRef, CourseLessonsProps>(
  (
    { sectionIndex, editingLessonIndex, editingSectionIndex, onLessonClick, hasLessonEditing, onLessonDragStart },
    ref,
  ) => {
    const [activeDragLessonId, setActiveDragLessonId] = useState<UniqueIdentifier>();
    const [editingLessonId, setEditingLessonId] = useState<UniqueIdentifier>();
    const methods = useUpsertCourseFormContext();
    const {
      control,
      getValues,
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

    const handleDragStart = useCallback(
      (evt: DragStartEvent) => {
        const { active } = evt;
        const activeId = active.id;
        setActiveDragLessonId(activeId);
        onLessonDragStart?.(activeId);
      },
      [sectionIndex],
    );

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
      [lessons, move],
    );

    const lessonDraggingItem = useMemo(() => {
      const indexActiveLesson = lessons.findIndex((lesson) => lesson._lessionId === activeDragLessonId);
      const activeSectionDrag = lessons[indexActiveLesson];
      if (indexActiveLesson === -1 || !activeSectionDrag) return;
      return { index: indexActiveLesson, lesson: activeSectionDrag };
    }, [lessons, activeDragLessonId, sectionIndex]);

    // console.log({ editingLessonId, editingLessonIndex });
    const handleClickLesson = useCallback(
      (lessonIndex: number, lessonId: UniqueIdentifier) => () => {
        setEditingLessonId(lessonId);
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
          const nextLessonIndex = getValues(`sections.${sectionIndex}.lessons`).length;
          append(initLessonFormData(type));
          return { lessonIndex: nextLessonIndex, sectionIndex: sectionIndex };
        },
        removeLesson: remove,
      }),
      [sectionIndex, lessons],
    );

    /**
     * update new index position for Editting Lesson after Drag Lesson
     */
    // useEffect(() => {
    //   if (!editingLessonId || editingSectionIndex !== sectionIndex) return;
    //   const newIndexLessonEditing = lessons.findIndex((lesson) => lesson._lessionId === editingLessonId);
    //   if (
    //     newIndexLessonEditing !== -1 &&
    //     !isUndefined(editingLessonIndex) &&
    //     newIndexLessonEditing !== editingLessonIndex
    //   ) {
    //     onLessonClick?.(sectionIndex, newIndexLessonEditing);
    //   }
    // });

    return (
      <div className="section-item__body flex flex-col gap-2">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
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
                  onClick={handleClickLesson(lessonIndex, lession._lessionId)}
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

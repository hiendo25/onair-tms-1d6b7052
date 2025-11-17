"use client";
import { forwardRef, memo, useCallback, useRef, useState } from "react";
import { useFieldArray } from "react-hook-form";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Box, Typography } from "@mui/material";
import { useUpsertCourseFormContext } from "../../UpsertCourseFormContainer";
import { UpsertCourseFormData } from "../../upsert-course.schema";
import CourseSectionItem, { CourseSectionItemRef } from "./CourseSectionItem";

import BoxEmptySection from "./BoxEmptySection";

export const initSectionFormData = (): UpsertCourseFormData["sections"][number] => {
  return {
    title: "",
    description: "",
    lessons: [],
    status: "active",
  };
};

type CourseSectionsContainerRef = {
  checkAllFields: () => Promise<boolean>;
};
interface CourseSectionsContainerProps {}
const CourseSectionsContainer = forwardRef<CourseSectionsContainerRef, CourseSectionsContainerProps>((props, ref) => {
  const sectionRef = useRef<Map<number, CourseSectionItemRef>>(new Map());
  const [isAddLesson, setIsAddLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{ sectionIndex: number; lessonIndex: number }>();
  const [sectionIndex, setSectionIndex] = useState<number>();
  const methods = useUpsertCourseFormContext();
  const {
    control,
    getValues,
    formState: { errors },
  } = methods;

  const {
    fields: sections,
    remove,
    move,
    append,
    update,
  } = useFieldArray({
    control,
    name: "sections",
    keyName: "_sectionId",
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

    const activeIndex = sections.findIndex((field) => field._sectionId === activeId);
    const overIndex = sections.findIndex((field) => field._sectionId === overId);

    move(activeIndex, overIndex);
  };

  const handleLessonClick = useCallback((sectionIndex: number, lessonIndex: number) => {
    setEditingLesson({ lessonIndex, sectionIndex });
    setIsAddLesson(false);
  }, []);

  const handleClickAddLesson = useCallback((sectionIndex: number) => {
    setIsAddLesson(true);
    setEditingLesson(undefined);
    setSectionIndex(sectionIndex);
  }, []);

  const hasLessonEditing = useCallback(
    (sectionIndex: number, lessonIndex: number) => {
      return editingLesson?.sectionIndex === sectionIndex && editingLesson.lessonIndex === lessonIndex;
    },
    [editingLesson],
  );

  const handleRemoveLesson = useCallback(
    (sectionIndex: number, lessonIndex: number) => {
      const sections = getValues("sections");
      const oldSection = sections[sectionIndex];
      console.log(oldSection);
      if (!oldSection) return;

      const updateLessons = [...oldSection.lessons];
      updateLessons.splice(lessonIndex, 1);
      update(sectionIndex, {
        ...oldSection,
        lessons: updateLessons,
      });
      setEditingLesson(undefined);
    },
    [sections, update, editingLesson],
  );

  const setSectionRef = useCallback((index: number, ref: CourseSectionItemRef | null) => {
    if (ref) sectionRef.current.set(index, ref);
  }, []);

  const handleCancelSelectLesson = useCallback(() => {
    setIsAddLesson(false);
  }, []);

  const handleDeleteSection = () => {};

  if (!sections.length) return <BoxEmptySection />;

  return (
    <div className="section__iner">
      <div className="sections__list flex flex-col gap-3">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((section) => section._sectionId)} strategy={verticalListSortingStrategy}>
            {sections.map((section, _index) => (
              <CourseSectionItem
                ref={(ref) => setSectionRef(_index, ref)}
                key={section._sectionId}
                id={section._sectionId}
                index={_index}
                onDelete={handleDeleteSection}
                onLessonClick={handleLessonClick}
                onAddLession={handleClickAddLesson}
                hasLessonEditing={hasLessonEditing}
                isActive={sectionIndex === _index}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <div className="h-6"></div>
      {errors.sections?.message && (
        <Typography component="p" className="text-xs text-red-600 mb-6">
          {errors.sections?.message}
        </Typography>
      )}
    </div>
  );
});
export default memo(CourseSectionsContainer);

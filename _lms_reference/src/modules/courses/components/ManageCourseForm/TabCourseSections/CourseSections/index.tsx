"use client";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
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
import { isUndefined } from "lodash";
import { useFieldArray } from "react-hook-form";

import type { LessonType } from "@/model/lesson.model";
import { UpsertCourseFormData } from "../../upsert-course.schema";
import { useUpsertCourseFormContext } from "../../UpsertCourseFormContainer";
import CourseLessons, { CourseLessonsProps, CourseLessonsRef } from "../CourseLessons";

import BoxEmptySection from "./BoxEmptySection";
import CourseSectionItem from "./CourseSectionItem";
import SortableSection from "./CourseSectionItem/SortableSection";

export const initSectionFormData = (): UpsertCourseFormData["sections"][number] => {
  return {
    title: "",
    description: "",
    lessons: [],
    status: "active",
  };
};

export type CourseSectionsRef = {
  appendSection: (title: string) => void;
  appendLesson: (options: {
    type: LessonType;
    sectionIndex: number;
  }) => { sectionIndex: number; lessonIndex: number } | undefined;
  removeLesson: (sectionIndex: number, lessonIndex: number) => void;
};
export interface CourseSectionsProps {
  className?: string;
  editingLesson?: {
    sectionIndex: number;
    lessonIndex: number;
  };
  onLessonDragStart?: CourseLessonsProps["onLessonDragStart"];
  onAddLesson?: (sectionIndex: number) => void;
  onEditLesson?: (options: { sectionIndex: number; lessonIndex: number }) => void;
  onSectionDragStart?: (sectionId: UniqueIdentifier) => void;
}
const CourseSections = forwardRef<CourseSectionsRef, CourseSectionsProps>(
  ({ onAddLesson, onEditLesson, editingLesson, onSectionDragStart, onLessonDragStart }, ref) => {
    const sectionRefs = useRef<Map<number, CourseLessonsRef>>(new Map());
    const [editingSectionId, setEditingSectionId] = useState<UniqueIdentifier>();
    const [activeDragSectionId, setActiveDragSectionId] = useState<UniqueIdentifier>();
    const methods = useUpsertCourseFormContext();
    const {
      control,
      formState: { errors },
    } = methods;

    const {
      fields: sections,
      remove,
      move,
      append,
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

    const setSectionRefs = useCallback((index: number, ref: CourseLessonsRef | null) => {
      if (ref) sectionRefs.current.set(index, ref);
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
      const { active } = event;
      const activeId = active.id;
      setActiveDragSectionId(activeId);
      onSectionDragStart?.(activeId);
    };

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id;
        const overId = over?.id;

        if (!over || activeId === overId) return;

        const activeIndex = sections.findIndex((field) => field._sectionId === activeId);
        const overIndex = sections.findIndex((field) => field._sectionId === overId);
        setActiveDragSectionId(undefined);
        move(activeIndex, overIndex);
      },
      [sections, move, editingLesson],
    );

    const hasLessonEditing = useCallback(
      (sectionIndex: number, lessonIndex: number) => {
        return editingLesson?.lessonIndex === lessonIndex && editingLesson?.sectionIndex === sectionIndex;
      },
      [editingLesson],
    );

    const sectionDragingItem = useMemo(() => {
      const indexActiveSection = sections.findIndex((sec) => sec._sectionId === activeDragSectionId);
      const activeSectionDrag = sections[indexActiveSection];
      if (indexActiveSection === -1 || !activeSectionDrag) return;

      return { index: indexActiveSection, section: activeSectionDrag };
    }, [activeDragSectionId, sections]);

    const hasSectionError = useCallback(
      (sectionIndex: number) => {
        return Boolean(errors?.sections?.[sectionIndex]);
      },
      [errors],
    );

    const handleDeleteSection = useCallback(
      (index: number) => {
        remove(index);
      },
      [remove],
    );

    const handleEditLesson: CourseLessonsProps["onLessonClick"] = (sectionIndex, lessonIndex) => {
      onEditLesson?.({ sectionIndex, lessonIndex });
    };

    useImperativeHandle(ref, () => ({
      appendSection: (title) => {
        const sectionData = initSectionFormData();
        append({ ...sectionData, title: title });
      },
      appendLesson: ({ type, sectionIndex }) => {
        const currentSectionref = sectionRefs.current.get(sectionIndex);
        if (!currentSectionref) return;
        const { lessonIndex } = currentSectionref.appendLesson(type);
        return { lessonIndex, sectionIndex };
      },
      removeLesson: (sectionIndex, lessonIndex) => {
        const currentSectionref = sectionRefs.current.get(sectionIndex);
        currentSectionref?.removeLesson(lessonIndex);
      },
    }));

    /**
     * update new index position for Editting Lesson after Drag Section
     */
    // useEffect(() => {
    //   if (!editingSectionId) return;

    //   console.log("checking section...");

    //   const newIndexSectionEditting = sections.findIndex((section) => section._sectionId === editingSectionId);
    //   if (
    //     newIndexSectionEditting !== -1 &&
    //     !isUndefined(editingLesson) &&
    //     newIndexSectionEditting !== editingLesson.sectionIndex
    //   ) {
    //     onEditLesson?.({ sectionIndex: newIndexSectionEditting, lessonIndex: editingLesson.lessonIndex });
    //   }
    // });
    if (!sections.length) return <BoxEmptySection />;

    return (
      <div className="sections__list flex flex-col gap-3">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <SortableContext items={sections.map((section) => section._sectionId)} strategy={verticalListSortingStrategy}>
            {sections.map((section, _indexSection) => (
              <SortableSection
                id={section._sectionId}
                key={section._sectionId}
                subLabel={`H${_indexSection + 1}`}
                isError={hasSectionError(_indexSection)}
              >
                <CourseSectionItem
                  key={section._sectionId}
                  index={_indexSection}
                  onDelete={handleDeleteSection}
                  onButtonAddLessonClick={onAddLesson}
                >
                  <CourseLessons
                    ref={(ref) => setSectionRefs(_indexSection, ref)}
                    sectionIndex={_indexSection}
                    editingLessonIndex={editingLesson?.lessonIndex}
                    editingSectionIndex={editingLesson?.sectionIndex}
                    // onLessonClick={(sectionIndex, lessonIndex) => {
                    //   // setEditingSectionId(section._sectionId);
                    //   onEditLesson?.({ sectionIndex, lessonIndex });
                    // }}
                    onLessonClick={handleEditLesson}
                    hasLessonEditing={hasLessonEditing}
                    onLessonDragStart={onLessonDragStart}
                  />
                </CourseSectionItem>
              </SortableSection>
            ))}
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {sectionDragingItem ? (
              <SortableSection id={sectionDragingItem.section._sectionId} key={sectionDragingItem.section._sectionId}>
                <CourseSectionItem
                  key={sectionDragingItem.section._sectionId}
                  index={sectionDragingItem.index}
                  onDelete={remove}
                  onButtonAddLessonClick={onAddLesson}
                >
                  <CourseLessons sectionIndex={sectionDragingItem.index} />
                </CourseSectionItem>
              </SortableSection>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    );
  },
);
export default memo(CourseSections);

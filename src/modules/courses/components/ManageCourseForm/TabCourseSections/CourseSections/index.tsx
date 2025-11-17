"use client";
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useFieldArray } from "react-hook-form";
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
import { useUpsertCourseFormContext } from "../../UpsertCourseFormContainer";
import { UpsertCourseFormData } from "../../upsert-course.schema";
import CourseSectionItem from "./CourseSectionItem";

import BoxEmptySection from "./BoxEmptySection";
import { LessonType } from "@/model/lesson.model";
import CourseLessons, { CourseLessonsRef } from "../CourseLessons";
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
  onAddLesson?: (sectionIndex: number) => void;
  onEditLesson?: (options: { sectionIndex: number; lessonIndex: number }) => void;
  editingLesson?: {
    sectionIndex: number;
    lessonIndex: number;
  };
  editingSectionIndex?: number;
}
const CourseSections = forwardRef<CourseSectionsRef, CourseSectionsProps>(
  ({ onAddLesson, onEditLesson, editingLesson, editingSectionIndex }, ref) => {
    const sectionRefs = useRef<Map<number, CourseLessonsRef>>(new Map());
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
    };
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      const activeId = active.id;
      const overId = over?.id;

      if (!over || activeId === overId) return;

      const activeIndex = sections.findIndex((field) => field._sectionId === activeId);
      const overIndex = sections.findIndex((field) => field._sectionId === overId);
      setActiveDragSectionId(undefined);
      move(activeIndex, overIndex);
    };

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

    if (!sections.length) return <BoxEmptySection />;

    return (
      <div className="sections__list flex flex-col gap-3">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <SortableContext items={sections.map((section) => section._sectionId)} strategy={verticalListSortingStrategy}>
            {sections.map((section, _index) => (
              <SortableSection
                id={section._sectionId}
                key={section._sectionId}
                subLabel={`H${_index + 1}`}
                isError={hasSectionError(_index)}
              >
                <CourseSectionItem
                  key={section._sectionId}
                  index={_index}
                  onDelete={remove}
                  onButtonAddLessonClick={onAddLesson}
                >
                  <CourseLessons
                    ref={(ref) => setSectionRefs(_index, ref)}
                    sectionIndex={_index}
                    onLessonClick={(sectionIndex, lessonIndex) =>
                      onEditLesson?.({ sectionIndex: sectionIndex, lessonIndex })
                    }
                    hasLessonEditing={hasLessonEditing}
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

"use client";
import { forwardRef, memo, useCallback, useRef, useState } from "react";
import { Typography } from "@mui/material";
import { useUpsertCourseFormContext } from "../UpsertCourseFormContainer";

import { UpsertCourseFormData } from "../upsert-course.schema";
import ButtonAddSection, { ButtonAddSectionProps } from "./ButtonAddSection";
import LessonTypeSelector, { LessonTypeSelectorProps } from "./LessonTypeSelector";
import LessonForm from "./LessonForm";
import { isUndefined } from "lodash";
import BoxEmptyLesson from "./BoxEmptyLesson";
import CourseSections, { CourseSectionsProps, CourseSectionsRef } from "./CourseSections";

export const initSectionFormData = (): UpsertCourseFormData["sections"][number] => {
  return {
    title: "",
    description: "",
    lessons: [],
    status: "active",
  };
};

type TabCourseSectionsRef = {
  checkAllFields: () => Promise<boolean>;
};
interface TabCourseSectionsProps {}
const TabCourseSections = forwardRef<TabCourseSectionsRef, TabCourseSectionsProps>((props, ref) => {
  const courseSectionsRef = useRef<CourseSectionsRef>(null);
  const [isAddLesson, setIsAddLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{ sectionIndex: number; lessonIndex: number }>();
  const [sectionIndex, setSectionIndex] = useState<number>();
  const methods = useUpsertCourseFormContext();
  const {
    formState: { errors },
  } = methods;

  const handleAddSection: ButtonAddSectionProps["onOk"] = useCallback((title) => {
    courseSectionsRef.current?.appendSection(title);
  }, []);

  const handleClickEditLesson = useCallback<Exclude<CourseSectionsProps["onEditLesson"], undefined>>(
    ({ sectionIndex, lessonIndex }) => {
      console.log(sectionIndex, lessonIndex);
      setEditingLesson({ lessonIndex, sectionIndex });
      setIsAddLesson(false);
    },
    [],
  );

  const handleClickAddLesson = useCallback((sectionIndex: number) => {
    setIsAddLesson(true);
    setEditingLesson(undefined);
    setSectionIndex(sectionIndex);
  }, []);

  const handleSelectLessonType: LessonTypeSelectorProps["onSelect"] = useCallback(
    (type) => {
      if (isUndefined(sectionIndex)) return;

      const lesson = courseSectionsRef.current?.appendLesson({ type, sectionIndex });

      if (!lesson) return;
      setEditingLesson({ lessonIndex: lesson.lessonIndex, sectionIndex });
      setIsAddLesson(false);
      setSectionIndex(undefined);
    },
    [sectionIndex],
  );

  const handleRemoveLesson = useCallback(
    (sectionIndex: number, lessonIndex: number) => {
      courseSectionsRef.current?.removeLesson(sectionIndex, lessonIndex);
      setEditingLesson(undefined);
    },
    [editingLesson],
  );

  const handleCancelSelectLesson = useCallback(() => {
    setIsAddLesson(false);
  }, []);

  return (
    <div className="flex flex-wrap gap-6">
      <div className="section w-96">
        <div className="section__iner">
          <ButtonAddSection onOk={handleAddSection} />
          <div className="h-6"></div>
          {errors.sections?.message && (
            <Typography component="p" className="text-xs text-red-600 mb-6">
              {errors.sections?.message}
            </Typography>
          )}
          <CourseSections
            ref={courseSectionsRef}
            onAddLesson={handleClickAddLesson}
            onEditLesson={handleClickEditLesson}
            editingLesson={editingLesson}
          />
          <div className="h-6"></div>
        </div>
      </div>
      <div className="lession-wraper flex-1">
        {isAddLesson || editingLesson ? (
          <div className="bg-white rounded-xl p-6">
            {isAddLesson ? (
              <LessonTypeSelector onSelect={handleSelectLessonType} onCancel={handleCancelSelectLesson} />
            ) : null}
            {editingLesson ? (
              <LessonForm
                key={`${editingLesson.sectionIndex}-${editingLesson.lessonIndex}`}
                sectionIndex={editingLesson.sectionIndex}
                lessonIndex={editingLesson.lessonIndex}
                onDelete={handleRemoveLesson}
              />
            ) : null}
          </div>
        ) : (
          <BoxEmptyLesson />
        )}
      </div>
    </div>
  );
});
export default memo(TabCourseSections);

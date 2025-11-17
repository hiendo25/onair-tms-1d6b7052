import { useCallback } from "react";

import RHFTextField from "@/shared/ui/form/RHFTextField";
import { useUpsertCourseFormContext } from "../../UpsertCourseFormContainer";
import RHFRichEditor from "@/shared/ui/form/RHFRichEditor";
import DocumentsFields from "./DocumentsFields";
import MainResourceField from "./MainResourceField";
import LessonFormWraper from "./LessonFormWraper";
import AssessmentSelector, { AssessmentSelectorProps } from "./AssessmentSelector";
import { Controller } from "react-hook-form";
interface LessonFormProps {
  lessonIndex: number;
  sectionIndex: number;
  onDelete?: (sectionIndex: number, lessonIndex: number) => void;
}
const LessonForm: React.FC<LessonFormProps> = ({ lessonIndex, sectionIndex, onDelete }) => {
  const { control, setValue, getValues, clearErrors } = useUpsertCourseFormContext();
  const lessonType = getValues(`sections.${sectionIndex}.lessons.${lessonIndex}.lessonType`);
  const title = getValues(`sections.${sectionIndex}.lessons.${lessonIndex}.title`);

  const handleSelectAssignment: AssessmentSelectorProps["onSelect"] = (data) => {
    setValue(`sections.${sectionIndex}.lessons.${lessonIndex}.assignmentId`, data.id);
    setValue(`sections.${sectionIndex}.lessons.${lessonIndex}.title`, data.title);
    setValue(`sections.${sectionIndex}.lessons.${lessonIndex}.content`, data.description);
    clearErrors(`sections.${sectionIndex}.lessons.${lessonIndex}.assignmentId`);
  };
  const handleConfirmDelete = useCallback(() => {
    onDelete?.(sectionIndex, lessonIndex);
  }, []);
  return (
    <LessonFormWraper lessonType={lessonType} onDelete={handleConfirmDelete} label={title}>
      {lessonType === "assessment" && (
        <div className="lession-form flex flex-col gap-6">
          <RHFTextField
            control={control}
            name={`sections.${sectionIndex}.lessons.${lessonIndex}.title`}
            label="Tiêu đề"
            required
            placeholder="Nhập tiêu đề"
          />
          <Controller
            control={control}
            name={`sections.${sectionIndex}.lessons.${lessonIndex}.assignmentId`}
            render={({ field: { value }, fieldState: { error } }) => (
              <AssessmentSelector
                value={value}
                onSelect={handleSelectAssignment}
                className="max-w-[450px]"
                error={!!error}
                helperText={error?.message}
              />
            )}
          />

          <RHFRichEditor
            control={control}
            label="Mô tả"
            name={`sections.${sectionIndex}.lessons.${lessonIndex}.content`}
            required
            placeholder="Nội dung"
          />
        </div>
      )}

      {(lessonType === "file" || lessonType === "video") && (
        <div className="lession-form flex flex-col gap-6">
          <RHFTextField
            control={control}
            name={`sections.${sectionIndex}.lessons.${lessonIndex}.title`}
            label="Tiêu đề"
            required
            placeholder="Nhập tên bài giảng"
          />
          <MainResourceField
            control={control}
            lessonType={lessonType}
            sectionIndex={sectionIndex}
            lessonIndex={lessonIndex}
          />
          <RHFRichEditor
            control={control}
            label="Mô tả"
            name={`sections.${sectionIndex}.lessons.${lessonIndex}.content`}
            required
            placeholder="Nội dung bài giảng"
          />
          <DocumentsFields label="Tài liệu" control={control} lessonIndex={lessonIndex} sectionIndex={sectionIndex} />
        </div>
      )}
    </LessonFormWraper>
  );
};
export default LessonForm;

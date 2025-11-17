import React, {
  ChangeEventHandler,
  Dispatch,
  KeyboardEventHandler,
  memo,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { get } from "lodash";

import CourseSectionContent from "./CourseSectionContent";
import { Button, FormHelperText, OutlinedInput, Typography } from "@mui/material";
import PlusIcon from "@/shared/assets/icons/PlusIcon";

import { Control, Controller, useController } from "react-hook-form";
import { UpsertCourseFormData } from "@/modules/courses/components/ManageCourseForm/upsert-course.schema";
import { useUpsertCourseFormContext } from "../../../UpsertCourseFormContainer";
export interface CourseSectionItemProps extends PropsWithChildren {
  index: number;
  onDelete?: (index: number) => void;
  onButtonAddLessonClick?: (sectionIndex: number) => void;
}
const CourseSectionItem: React.FC<CourseSectionItemProps> = ({ index, onDelete, onButtonAddLessonClick, children }) => {
  const methods = useUpsertCourseFormContext();

  const [isEditSectiontitle, setIsEditSectionTitle] = useState(false);
  const {
    control,
    getValues,
    formState: { errors },
  } = methods;
  const sectionEmptyErrorMessage = get(errors, `sections[${index}].lessons.message`);

  const toggleEditSectionTitle = useCallback(() => {
    setIsEditSectionTitle((prev) => !prev);
  }, []);

  const handleClickDelete = useCallback(() => {
    onDelete?.(index);
  }, [index]);

  const getSectionTitle = useCallback(() => {
    return getValues(`sections.${index}.title`);
  }, [index]);

  return (
    <CourseSectionContent
      label={getSectionTitle()}
      header={
        <SectionTitleField
          control={control}
          isEditting={isEditSectiontitle}
          setEdit={setIsEditSectionTitle}
          sectionIndex={index}
        />
      }
      onEdit={isEditSectiontitle ? undefined : toggleEditSectionTitle}
      onDelete={handleClickDelete}
    >
      {sectionEmptyErrorMessage && <FormHelperText error>{sectionEmptyErrorMessage}</FormHelperText>}
      <div className="section-item__body flex flex-col gap-2">{children}</div>
      <div className="h-4"></div>
      <div className="section-item__footer">
        <Button
          endIcon={<PlusIcon />}
          variant="outlined"
          color="inherit"
          size="small"
          onClick={() => onButtonAddLessonClick?.(index)}
        >
          Tạo bài giảng
        </Button>
      </div>
    </CourseSectionContent>
  );
};
export default memo(CourseSectionItem);

interface SectionTitleFieldProps {
  control: Control<UpsertCourseFormData>;
  sectionIndex: number;
  isEditting: boolean;
  setEdit: Dispatch<SetStateAction<boolean>>;
}
const SectionTitleField: React.FC<SectionTitleFieldProps> = ({ control, sectionIndex, isEditting, setEdit }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const prevInputValue = useRef("");
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control: control, name: `sections.${sectionIndex}.title` });

  const handleChange: ChangeEventHandler<HTMLInputElement> = (evt) => {
    onChange(evt.target.value);
  };
  const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = (evt) => {
    if (evt.key === "Enter") {
      setEdit(false);
    }
    if (evt.key === "Escape") {
      onChange(prevInputValue.current);
      setEdit(false);
    }
  };

  useLayoutEffect(() => {
    if (!isEditting) return;
    inputRef.current?.focus();
    prevInputValue.current = value;
  }, [isEditting]);

  const handleBlur = () => {
    if (!value.length) return;
    // onChange(prevInputValue.current);
    setEdit(false);
    onBlur();
  };

  if (isEditting)
    return (
      <Controller
        control={control}
        name={`sections.${sectionIndex}.title`}
        render={({ field }) => (
          <div className="input pt-1">
            <OutlinedInput
              size="small"
              autoFocus
              ref={inputRef}
              value={field.value}
              onBlur={handleBlur}
              onChange={handleChange}
              onKeyUp={handleKeyUp}
              name={field.name}
              rows={3}
              fullWidth
              sx={(theme) => ({
                input: {
                  padding: "0.425rem 0.675rem;",
                },
              })}
            />
            <FormHelperText>{error?.message}</FormHelperText>
          </div>
        )}
      />
    );
  return (
    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }} className="line-clamp-3">
      {value}
    </Typography>
  );
};

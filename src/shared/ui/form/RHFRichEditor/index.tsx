"use client";
import { FormControl, FormLabel } from "@mui/material";
import { Control, Controller, FieldValues, Path, PathValue } from "react-hook-form";
import { useId } from "react";
import dynamic from "next/dynamic";
import EditorSkeleton from "../Editor/EditorSkeleton";

const DynamicEditor = dynamic(() => import("../Editor"), {
  ssr: false,
  loading: () => <EditorSkeleton aspect="auto" className="aspect-21/9" />,
});
interface RHFRichEditorProps<T extends FieldValues> {
  className?: string;
  label?: React.ReactNode;
  placeholder?: React.ReactNode | string;
  control: Control<T>;
  name: Path<T>;
  type?: "text";
  defaultValue?: PathValue<T, Path<T>>;
  required?: boolean;
}
const RHFRichEditor = <T extends FieldValues>({
  label,
  control,
  defaultValue,
  name,
  className,
  required,
}: RHFRichEditorProps<T>) => {
  const fieldId = useId();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field, fieldState: { error } }) => (
        <FormControl className={className} error={!!error}>
          {label ? (
            <FormLabel htmlFor={fieldId}>
              {label}
              {required ? <span className="ml-1 text-red-600">*</span> : null}
            </FormLabel>
          ) : null}
          <DynamicEditor {...field} error={!!error} helperText={error?.message} />
        </FormControl>
      )}
    />
  );
};

export default RHFRichEditor;

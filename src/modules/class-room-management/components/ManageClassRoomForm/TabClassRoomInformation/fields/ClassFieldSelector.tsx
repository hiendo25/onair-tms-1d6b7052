import React, { memo } from "react";
import { Control } from "react-hook-form";

import { useCreateCategoriesMutation, useGetCategoriesQuery } from "@/modules/categories/operations";
import RHFMultipleSelectField from "@/shared/ui/form/RHFMultipleSelectField";
import { slugify } from "@/utils/slugify";
import { ClassRoomFormValues } from "../../classroom-form.schema";
interface ClassFieldSelectorProps {
  control: Control<ClassRoomFormValues>;
}
const ClassFieldSelector: React.FC<ClassFieldSelectorProps> = ({ control }) => {
  const { data: fieldListData, isPending } = useGetCategoriesQuery();
  const { mutate: createClassField, isPending: isCreateLoading } = useCreateCategoriesMutation();

  const handleEnter = (value: string) => {
    createClassField({
      description: "",
      name: value,
      slug: `${slugify(value)}-${new Date().getTime()}`,
      thumbnail_url: "",
    });
  };
  const fieldList = fieldListData?.data || [];

  console.log("render categories");
  return (
    <RHFMultipleSelectField
      label="Chủ đề"
      control={control}
      name="categories"
      required
      placeholder="Chọn chủ đề"
      onInputEnter={handleEnter}
      isLoading={isCreateLoading}
      options={fieldList.map((it) => ({
        label: it.name || "",
        value: it.id,
      }))}
    />
  );
};
export default memo(ClassFieldSelector);

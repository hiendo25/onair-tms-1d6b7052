import React, { memo } from "react";
import { useFormContext } from "react-hook-form";

import { useCreateClassFieldMutation } from "@/modules/class-room-management/operation/mutation";
import { useGetClassFieldQuery } from "@/modules/class-room-management/operation/query";
import RHFMultipleSelectField from "@/shared/ui/form/RHFMultipleSelectField";
import { slugify } from "@/utils/slugify";

import { QuestionBankFormValues } from "./question-bank.schema";

const QuestionBankCategorySelector = () => {
  const { control } = useFormContext<QuestionBankFormValues>();

  const { data: categoryListData } = useGetClassFieldQuery();
  const { mutate: createCategory, isPending: isCreateLoading } = useCreateClassFieldMutation();

  const categoryOptions = categoryListData?.data || [];

  const handleEnter = (value: string) => {
    createCategory({
      description: "",
      name: value,
      slug: `${slugify(value)}-${new Date().getTime()}`,
      thumbnail_url: "",
    });
  };

  return (
    <RHFMultipleSelectField
      label="Lĩnh vực"
      control={control}
      name="questionCategories"
      placeholder="Chọn lĩnh vực"
      onInputEnter={handleEnter}
      isLoading={isCreateLoading}
      options={categoryOptions.map((item) => ({
        label: item.name || "",
        value: item.id,
      }))}
      required
    />
  );
};

export default memo(QuestionBankCategorySelector);

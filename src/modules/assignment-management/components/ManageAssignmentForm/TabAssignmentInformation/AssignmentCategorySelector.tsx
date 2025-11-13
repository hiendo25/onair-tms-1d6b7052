import { useGetClassFieldQuery } from "@/modules/class-room-management/operation/query";
import { Control, useController } from "react-hook-form";
import { Assignment } from "../../assignment-form.schema";
import { useCreateClassFieldMutation } from "@/modules/class-room-management/operation/mutation";
import { slugify } from "@/utils/slugify";
import RHFMultipleSelectField from "@/shared/ui/form/RHFMultipleSelectField";

interface AssignmentCategorySelectorProps {
  control: Control<Assignment>;
}

const AssignmentCategorySelector: React.FC<AssignmentCategorySelectorProps> = ({ control }) => {
  const {
    field: { onChange, value: categoryList },
  } = useController({ control, name: "assignmentCategories" });

  const { data: categoryListData, isPending } = useGetClassFieldQuery();
  const { mutate: createCategory, isPending: isCreateLoading } = useCreateClassFieldMutation();

  const handleEnter = (value: string) => {
    createCategory({
      description: "",
      name: value,
      slug: `${slugify(value)}-${new Date().getTime()}`,
      thumbnail_url: "",
    });
  };

  const categoryOptions = categoryListData?.data || [];

  const handleRemoveItem = (value: string) => {
    const newCategories = [...categoryList].filter((c) => c !== value);
    onChange(newCategories);
  };

  return (
    <RHFMultipleSelectField
      label="Lĩnh vực"
      control={control}
      name="assignmentCategories"
      placeholder="Chọn lĩnh vực"
      onInputEnter={handleEnter}
      onRemove={handleRemoveItem}
      isLoading={isCreateLoading}
      options={categoryOptions.map((it) => ({
        label: it.name || "",
        value: it.id,
      }))}
    />
  );
};

export default AssignmentCategorySelector;


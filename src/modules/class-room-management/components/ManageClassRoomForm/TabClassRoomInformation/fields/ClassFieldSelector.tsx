import { Control, useController } from "react-hook-form";

import { useCreateCategoriesMutation, useGetCategoriesQuery } from "@/modules/categories/operations";
import RHFMultipleSelectField from "@/shared/ui/form/RHFMultipleSelectField";
import { slugify } from "@/utils/slugify";
import { ClassRoom } from "../../classroom-form.schema";
interface ClassFieldSelectorProps {
  control: Control<ClassRoom>;
}
const ClassFieldSelector: React.FC<ClassFieldSelectorProps> = ({ control }) => {
  const {
    field: { onChange, value: classFieldList },
  } = useController({ control, name: "categories" });

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
  const handleRemoveItem = (value: string) => {
    const newClassFields = [...classFieldList].filter((f) => f !== value);
    onChange(newClassFields);
  };
  return (
    <RHFMultipleSelectField
      label="Chủ đề"
      control={control}
      name="categories"
      required
      placeholder="Chọn chủ đề"
      onInputEnter={handleEnter}
      onRemove={handleRemoveItem}
      isLoading={isCreateLoading}
      options={fieldList.map((it) => ({
        label: it.name || "",
        value: it.id,
      }))}
    />
  );
};
export default ClassFieldSelector;

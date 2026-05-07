// import { Control, useController } from "react-hook-form";
// import { ClassRoom } from "../../classroom-form.schema";
// import RHFSelectField from "@/shared/ui/form/RHFSelectField";
// import RHFMultipleSelectField, { RHFMultipleSelectFieldProps } from "@/shared/ui/form/RHFMultipleSelectField";
// import { useGetClassHashTagsQuery } from "@/modules/hash-tag/operation/query";
// import { useCreateHashTagMutation } from "@/modules/hash-tag/operation/mutation";
// import { slugify } from "@/utils/slugify";

// interface ClassHashTagSelectorProps {
//   control: Control<ClassRoom>;
// }
// const ClassHashTagSelector: React.FC<ClassHashTagSelectorProps> = ({ control }) => {
//   const {
//     field: { value: hasTagsList, onChange },
//   } = useController({ control, name: "hashTags" });
//   const { data: hashTagListData, isPending } = useGetClassHashTagsQuery();
//   const { mutate: createhashTag, isPending: isLoadingCreate } = useCreateHashTagMutation();
//   const hashTags = hashTagListData?.data || [];

//   const handleInputEnter = (value: string) => {
//     if (!value.length) return;
//     createhashTag({
//       name: value,
//       slug: `${slugify(value)}-${new Date().getTime()}`,
//     });
//   };
//   const handleRemoveItem = (value: string) => {
//     const newHashTags = [...hasTagsList].filter((val) => val !== value);
//     onChange(newHashTags);
//   };
//   return (
//     <RHFMultipleSelectField
//       label="Hash tags"
//       control={control}
//       name="hashTags"
//       placeholder="Hash tags"
//       onInputEnter={handleInputEnter}
//       onRemove={handleRemoveItem}
//       options={hashTags.map((it) => ({
//         label: it.name || "",
//         value: it.id,
//       }))}
//     />
//   );
// };
// export default ClassHashTagSelector;

// "use client";
// import { useFieldArray } from "react-hook-form";
// import { useFormContext } from "react-hook-form";
// import { ClassRoom } from "../../../classroom-form.schema";
// import RHFTextField from "@/shared/ui/form/RHFTextField";
// import { HelpIcon, TrashIcon1, UsersIcon, UsersIcon2 } from "@/shared/assets/icons";
// import { useCallback, useEffect, useLayoutEffect } from "react";
// import { Button, Divider, IconButton, Typography } from "@mui/material";
// import PlusIcon from "@/shared/assets/icons/PlusIcon";

// const MAX_FIELD_COUNT = 4;
// const MIN_FIELD_COUNT = 2;
// interface ForWhomFieldsProps {
//   className?: string;
// }
// const ForWhomFields: React.FC<ForWhomFieldsProps> = ({ className }) => {
//   const { control, setValue, trigger } = useFormContext<ClassRoom>();
//   const {
//     fields: forWhomFields,
//     remove,
//     append,
//   } = useFieldArray({
//     control,
//     name: "forWhom",
//     keyName: "_forWhomId",
//   });
//   const handleAddMore = useCallback(async () => {
//     const fieldCount = forWhomFields.length;
//     if (fieldCount > 0) {
//       const isValidField = await trigger("forWhom");
//       if (!isValidField) return;
//     }

//     if (fieldCount >= MAX_FIELD_COUNT) return;
//     append({ description: "" });
//   }, [forWhomFields]);

//   return (
//     <div className={className}>
//       {forWhomFields.length ? (
//         <>
//           <div>
//             <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
//               Tạo ít nhất {MIN_FIELD_COUNT} lợi ích và tối đa {MAX_FIELD_COUNT}.
//             </Typography>
//           </div>
//           <div className="pt-4 flex flex-col gap-4">
//             {forWhomFields.map((field, _index) => (
//               <div className="for-whom-field flex" key={_index}>
//                 <RHFTextField
//                   name={`forWhom.${_index}.description`}
//                   placeholder={`Đối tượng ${_index + 1}`}
//                   control={control}
//                 />

//                 <IconButton
//                   size="small"
//                   className="p-0 bg-transparent mt-[2px]"
//                   disabled={_index === 0}
//                   {...(_index !== 0 ? { onClick: () => remove(_index) } : undefined)}
//                 >
//                   <TrashIcon1 className="w-4 h-4" />
//                 </IconButton>
//               </div>
//             ))}
//           </div>
//         </>
//       ) : null}
//       {forWhomFields.length < MAX_FIELD_COUNT ? (
//         <>
//           <div className="h-6"></div>
//           <Divider>
//             <Button onClick={handleAddMore} startIcon={<PlusIcon />} variant="outlined" size="small">
//               Thêm mới
//             </Button>
//           </Divider>
//         </>
//       ) : null}
//     </div>
//   );
// };
// export default ForWhomFields;

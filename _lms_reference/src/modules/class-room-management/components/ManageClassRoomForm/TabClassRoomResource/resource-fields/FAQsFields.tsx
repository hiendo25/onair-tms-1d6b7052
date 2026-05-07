// "use client";
// import { useFieldArray } from "react-hook-form";
// import { useFormContext } from "react-hook-form";
// import { ClassRoom } from "../../../classroom-form.schema";
// import RHFTextField from "@/shared/ui/form/RHFTextField";
// import { TrashIcon1 } from "@/shared/assets/icons";
// import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
// import { useCallback, useLayoutEffect } from "react";
// import { Button, Divider, IconButton, Typography } from "@mui/material";
// import PlusIcon from "@/shared/assets/icons/PlusIcon";
// interface FAQsFieldsProps {
//   className?: string;
// }

// const FAQsFields: React.FC<FAQsFieldsProps> = ({ className }) => {
//   const { control, setValue, trigger } = useFormContext<ClassRoom>();
//   const {
//     fields: faqFields,
//     remove,
//     append,
//   } = useFieldArray({
//     control,
//     name: "faqs",
//     keyName: "_faqId",
//   });

//   const handleAddFaqItem = useCallback(async () => {
//     const faqCount = faqFields.length;

//     if (faqCount > 0) {
//       const isValidAllFields = await trigger("faqs");
//       if (!isValidAllFields) return;
//     }
//     append({ answer: "", question: "" });
//   }, [faqFields]);

//   return (
//     <div className={className}>
//       <div>
//         <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
//           Trả lời các câu hỏi mà người dùng có thể biết thêm về sự kiện, chẳng hạn như điều kiện tham gia, giá trị sự
//           kiện mang lại, thiết bị cần chuẩn bị.
//         </Typography>
//       </div>
//       {faqFields.length ? (
//         <div className="flex flex-col gap-4">
//           <div className="h-1"></div>
//           {faqFields.map((field, _index) => (
//             <div className="faq-field" key={field._faqId}>
//               <div className="flex justify-between items-center mb-2">
//                 <Typography className="font-bold">Câu {_index + 1}</Typography>
//                 <IconButton
//                   size="small"
//                   className="p-0 bg-transparent"
//                   disabled={_index === 0}
//                   {...(_index !== 0 ? { onClick: () => remove(_index) } : undefined)}
//                 >
//                   <TrashIcon1 className="w-4 h-4" />
//                 </IconButton>
//               </div>
//               <div className="flex flex-col gap-4">
//                 <RHFTextField name={`faqs.${_index}.question`} placeholder="Câu hỏi" control={control} />
//                 <RHFTextAreaField
//                   name={`faqs.${_index}.answer`}
//                   maxRows={3}
//                   placeholder="Câu trả lời"
//                   control={control}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : null}
//       <div className="h-6"></div>
//       <Divider>
//         <Button onClick={handleAddFaqItem} startIcon={<PlusIcon />} variant="outlined" size="small">
//           Thêm mới
//         </Button>
//       </Divider>
//     </div>
//   );
// };
// export default FAQsFields;

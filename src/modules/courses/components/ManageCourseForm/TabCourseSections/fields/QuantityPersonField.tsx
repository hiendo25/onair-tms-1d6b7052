// "use client";
// import { FormControlLabel, FormLabel, Radio, RadioGroup, styled, Typography } from "@mui/material";
// import RHFTextField, { RHFTextFieldProps } from "@/shared/ui/form/RHFTextField";
// import { Control, useWatch } from "react-hook-form";
// import { ClassRoom } from "../../../classroom-form.schema";
// import { Controller } from "react-hook-form";
// interface QuantityPersonFieldProps {
//   control: Control<ClassRoom>;
//   fieldIndex: number;
// }

// const CustomTextField = styled((props: RHFTextFieldProps<ClassRoom>) => <RHFTextField {...props} />)(({ theme }) => ({
//   maxWidth: "60px",
//   marginLeft: "-12px",
//   ".MuiInputBase-input": {
//     padding: "4px 8px",
//   },
//   ".MuiFormHelperText-root": {
//     marginInline: 0,
//     position: "absolute",
//     bottom: "-100%",
//   },
// }));
// const QuantityPersonField = ({ control, fieldIndex }: QuantityPersonFieldProps) => {
//   const watchIsUnlimited = useWatch({ control, name: `classRoomSessions.${fieldIndex}.isUnlimited` });
//   return (
//     <div>
//       <FormLabel component="div">Số lượng tham dự</FormLabel>
//       <RadioGroup row={true} className="gap-6">
//         <Controller
//           control={control}
//           name={`classRoomSessions.${fieldIndex}.isUnlimited`}
//           render={({ field: { onChange, value }, fieldState: { error } }) => (
//             <FormControlLabel
//               control={<Radio />}
//               value={true}
//               checked={value === true}
//               onChange={() => onChange(true)}
//               label="Không giới hạn"
//               sx={{
//                 ".MuiTypography-root": {
//                   fontSize: "0.875rem",
//                 },
//               }}
//             />
//           )}
//         />

//         <div className="flex items-center whitespace-nowrap gap-1">
//           <Controller
//             control={control}
//             name={`classRoomSessions.${fieldIndex}.isUnlimited`}
//             render={({ field: { onChange, value }, fieldState: { error } }) => (
//               <FormControlLabel
//                 control={<Radio />}
//                 value={false}
//                 checked={value === false}
//                 onChange={() => onChange(false)}
//                 label="Giới hạn"
//                 sx={{
//                   ".MuiTypography-root": {
//                     fontSize: "0.875rem",
//                   },
//                 }}
//               />
//             )}
//           />
//           <CustomTextField
//             name={`classRoomSessions.${fieldIndex}.limitPerson`}
//             control={control}
//             // placeholder="Số lượng"
//             type="number"
//             disabled={watchIsUnlimited}
//           />
//           <Typography sx={{ fontSize: "0.875rem", ml: 1 }}>học viên</Typography>
//         </div>
//       </RadioGroup>
//     </div>
//   );
// };
// export default QuantityPersonField;

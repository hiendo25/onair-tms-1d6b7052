"use client";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

import { EmployeeType } from "@/model/employee.model";
import RHFRadioGroupField from "@/shared/ui/form/RHFRadioGroupField";
import RHFTextField from "@/shared/ui/form/RHFTextField";

import { SignUpSchema, TSignUpForm } from "./signup-schema";
export interface SignUpFormProps {
  onSubmit?: (data: TSignUpForm) => void;
  isSubmitting?: boolean;
}
const USER_TYPE_OPTIONS: { label: string; value: Extract<EmployeeType, "teacher" | "student"> }[] = [
  {
    label: "Người học",
    value: "student",
  },
  {
    label: "Giảng viên",
    value: "teacher",
  },
];
const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit = () => {}, isSubmitting }) => {
  const methods = useForm<TSignUpForm>({
    defaultValues: { fullName: "", password: "", email: "", passwordConfirm: "", userType: "student" },
    resolver: zodResolver(SignUpSchema),
  });

  const { control, handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <RHFTextField control={control} name="fullName" label="Họ và tên" required placeholder="eg: Nguyen van a" />
        <RHFRadioGroupField
          label="Loại tài khoản"
          direction="horizontal"
          control={control}
          name="userType"
          options={USER_TYPE_OPTIONS}
        />
        <RHFTextField control={control} name="email" label="Email" required placeholder="your@email.com" />
        <RHFTextField
          control={control}
          name="password"
          type="password"
          label="Mật khẩu"
          required
          placeholder="••••••"
        />
        <RHFTextField
          control={control}
          name="passwordConfirm"
          label="Xác nhận mật khẩu"
          type="password"
          required
          placeholder="••••••"
        />

        {/* <FormControlLabel
            control={<Checkbox value="allowExtraEmails" color="primary" />}
            label="I want to receive updates via email."
          /> */}
        <div className="h-1"></div>
        <Button type="submit" fullWidth variant="contained" loading={isSubmitting}>
          Đăng ký
        </Button>
      </Box>
    </FormProvider>
  );
};

export default SignUpForm;

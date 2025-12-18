"use client";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { SignUpSchema, TSignUpForm } from "./schema";
export interface SignUpFormClientProps {
  onSubmit?: (data: TSignUpForm) => void;
  isSubmitting?: boolean;
}
const SignUpFormClient: React.FC<SignUpFormClientProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TSignUpForm>({
    defaultValues: { fullName: "", password: "", email: "" },
    resolver: zodResolver(SignUpSchema),
  });
  const submitForm: SubmitHandler<TSignUpForm> = (formdata) => {
    onSubmit?.(formdata);
  };
  return (
    <Box
      component="form"
      onSubmit={handleSubmit(submitForm)}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Controller
        name="fullName"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl>
            <FormLabel htmlFor="name">Họ và tên</FormLabel>
            <TextField
              {...field}
              autoComplete="name"
              name="name"
              required
              fullWidth
              id="name"
              placeholder="eg: Nguyen van a"
              error={!!error}
              helperText={error?.message}
              color={error ? "error" : "primary"}
            />
          </FormControl>
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              {...field}
              required
              fullWidth
              id="email"
              placeholder="your@email.com"
              name="email"
              autoComplete="email"
              variant="outlined"
              error={!!error}
              helperText={error?.message}
              color={error ? "error" : "primary"}
            />
          </FormControl>
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl>
            <FormLabel htmlFor="password">Mật khẩu</FormLabel>
            <TextField
              {...field}
              required
              fullWidth
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="new-password"
              variant="outlined"
              error={!!error}
              helperText={error?.message}
              color={error ? "error" : "primary"}
            />
          </FormControl>
        )}
      />
      {/* <FormControlLabel
            control={<Checkbox value="allowExtraEmails" color="primary" />}
            label="I want to receive updates via email."
          /> */}
      <div className="h-1"></div>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        loading={isSubmitting}
      >
        Đăng ký
      </Button>
    </Box>
  );
};

export default SignUpFormClient;

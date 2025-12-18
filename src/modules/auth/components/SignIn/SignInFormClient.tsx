"use client";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox, FormControlLabel, InputAdornment } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import Link from "next/link";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { EyeIcon, EyeOffIcon } from "@/shared/assets/icons";
import LoadingIcon from "@/shared/assets/icons/LoadingIcon";

import { SignInSchema, TSignInForm } from "./schema";
export interface SignInFormClientProps {
  onSubmit?: (data: TSignInForm) => void;
  isSubmitting?: boolean;
}
const SignInFormClient: React.FC<SignInFormClientProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [isShowPassword, setIsShowPassword] = React.useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TSignInForm>({
    defaultValues: { password: "", email: "", rememberMe: false },
    resolver: zodResolver(SignInSchema),
  });
  const togglePasswordVisibility = () => {
    setIsShowPassword((isShow) => !isShow);
  };
  const submitForm: SubmitHandler<TSignInForm> = (formdata) => {
    onSubmit?.(formdata);
  };
  return (
    <Box
      component="form"
      onSubmit={handleSubmit(submitForm)}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl>
            <FormLabel htmlFor="email" className="text-sm">
              Email
            </FormLabel>
            <TextField
              {...field}
              required
              fullWidth
              id="email"
              placeholder="your@email.com"
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
            <FormLabel htmlFor="password" className="text-sm">
              Mật khẩu
            </FormLabel>
            <TextField
              {...field}
              required
              fullWidth
              placeholder="Mật khẩu của bạn"
              type={isShowPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              variant="outlined"
              error={!!error}
              helperText={error?.message}
              color={error ? "error" : "primary"}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      onClick={togglePasswordVisibility}
                      className="cursor-pointer"
                    >
                      {isShowPassword ? (
                        <EyeIcon className="stroke-action-active" />
                      ) : (
                        <EyeOffIcon className="stroke-action-active" />
                      )}
                    </InputAdornment>
                  ),
                },
              }}
            />
          </FormControl>
        )}
      />
      <div className="flex items-center justify-between">
        <Controller
          control={control}
          name="rememberMe"
          render={({ field, fieldState }) => (
            <FormControlLabel
              control={<Checkbox {...field} name="rememberMe" />}
              label={<span className="text-sm">Ghi nhớ đăng nhập</span>}
            />
          )}
        />
        <Link href={"/"} className="text-sm text-blue-600 font-semibold">
          Quên mật khẩu?
        </Link>
      </div>
      <div className="h-1"></div>
      <Button
        type="submit"
        fullWidth
        size="large"
        variant="contained"
        loading={isSubmitting}
        disabled={isSubmitting}
        startIcon={
          isSubmitting ? (
            <LoadingIcon className="stroke-white animate-spin" />
          ) : null
        }
      >
        Đăng nhập
      </Button>
    </Box>
  );
};

export default React.memo(SignInFormClient);

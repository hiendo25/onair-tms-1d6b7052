import zod from "zod";

export const SignInSchema = zod.object({
  email: zod.email().min(1, { message: "Vui long nhap email" }),
  password: zod.string().min(1, "Vui long nhap mat khau"),
  rememberMe: zod.boolean().optional(),
});

export type TSignInForm = zod.infer<typeof SignInSchema>;

import zod from "zod";

import { EmployeeType } from "@/model/employee.model";

export const SignUpSchema = zod
  .object({
    fullName: zod.string().trim().min(3, { message: "Họ và tên không bỏ trống." }),
    email: zod.email({ error: "Email không hợp lệ." }).min(1, { message: "Email không bỏ trống" }),
    password: zod
      .string()
      .min(1, "Mật khẩu không bỏ trống")
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 số")
      .regex(/[!@#$%^&*()[\]{};:'",.<>/?\\|`~+=_-]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
    passwordConfirm: zod
      .string()
      .min(1, "Xác nhận mật khẩu không bỏ trống.")
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 số")
      .regex(/[!@#$%^&*()[\]{};:'",.<>/?\\|`~+=_-]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
    userType: zod.enum<Extract<EmployeeType, "student" | "teacher">[]>(["student", "teacher"]),
  })
  .superRefine(({ password, passwordConfirm }, ctx) => {
    if (password !== passwordConfirm) {
      ctx.addIssue({
        path: ["passwordConfirm"],
        message: "Mật khẩu không khớp",
        code: "custom",
      });
    }
  });

export type TSignUpForm = zod.infer<typeof SignUpSchema>;

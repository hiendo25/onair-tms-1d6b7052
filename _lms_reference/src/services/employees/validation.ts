import * as zod from "zod";

import dayjs from "@/lib/dayjs";

export const ImportEmployeeValidation = zod.object({
  code: zod.string().min(1, "Không bỏ trống."),
  fullName: zod.string().min(1, "Không bỏ trống"),
  email: zod
    .string()
    .min(1, "Không bỏ trống")
    .refine((value) => /^[a-z0-9](?:[a-z0-9._+-]{0,62}[a-z0-9])?@(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(value), {
      error: "Email không hợp lệ.",
    }),
  phoneNumber: zod.string().optional(),
  dateOfBirth: zod
    .string()
    .min(1, { error: "Không bỏ trống." })
    .refine((value) => dayjs(value, "YYYY-MM-DD", true).isValid(), {
      error: "Ngày sinh không hợp lệ (YYYY-MM-DD).",
    }),
  startDate: zod
    .string()
    .min(1, { error: "Không bỏ trống." })
    .refine((value) => dayjs(value, "YYYY-MM-DD", true).isValid(), {
      error: "Ngày bắt đầu không hợp lệ (YYYY-MM-DD).",
    }),
  gender: zod.enum(["male", "female", "other"], {
    error: (issue) => {
      if (!issue.input) {
        return "Không bỏ trống.";
      }
      return `Giới tính không hợp lệ (${issue.values.join(", ")}).`;
    },
  }),
  employeeType: zod.preprocess(
    (val) => (val === "" ? undefined : val),
    zod.enum(["admin", "student", "teacher"], {
      error: (issue) => {
        if (!issue.input) {
          return "Không bỏ trống.";
        }
        return `Loại tài khoản không hợp lệ (${issue.values.join(", ")}).`;
      },
    }),
  ),
});

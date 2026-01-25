import * as zod from "zod";

import { parseDateInput, parseDateRange } from "@/utils/date";

const numberAsString = (label: string) =>
  zod
    .string()
    .min(1, { message: `${label} không được bỏ trống.` })
    .refine((value) => !Number.isNaN(Number(value)), { message: `${label} phải là số.` })
    .refine((value) => Number(value) > 0, { message: `${label} phải lớn hơn 0.` });

const employeeSchema = zod.object({
  id: zod.string(),
  fullName: zod.string(),
  email: zod.string(),
  employeeCode: zod.string(),
  avatar: zod.string().nullable(),
  employeeType: zod.enum(["student"]),
});

const dateAsString = (label: string) =>
  zod
    .string()
    .min(1, { message: `${label} không được bỏ trống.` })
    .refine((value) => Boolean(parseDateInput(value)), { message: `${label} không hợp lệ.` });

const assignmentBankAssignSchema = zod
  .object({
    startDate: dateAsString("Từ ngày"),
    endDate: dateAsString("Đến ngày"),
    attemptLimit: numberAsString("Số lần làm cho phép"),
    assignedEmployees: zod.array(employeeSchema).min(1, { message: "Vui lòng chọn ít nhất 1 học viên." }),
  })
  .refine(
    (data) => {
      const range = parseDateRange(data.startDate, data.endDate);
      if (!range) {
        return false;
      }

      return range.start.getTime() <= range.end.getTime();
    },
    { message: "Đến ngày phải lớn hơn hoặc bằng từ ngày.", path: ["endDate"] },
  );

type AssignmentBankAssignFormValues = zod.infer<typeof assignmentBankAssignSchema>;

export { assignmentBankAssignSchema, type AssignmentBankAssignFormValues };

import { Database } from "@/types/supabase.types";

export type EmployeeType = Database["public"]["Enums"]["employee_type"];

export const EMPLOYEE_TYPE_LABEL: Record<EmployeeType, string> = {
  student: "Học sinh",
  teacher: "Giáo viên",
  admin: "Admin",
};

export const EMPLOYEE_TYPE_OPTIONS: Array<{ value: EmployeeType; label: string }> = [
  { value: "student", label: "Học sinh" },
  { value: "teacher", label: "Giáo viên" },
  { value: "admin", label: "Admin" },
];

export const getEmployeeTypeLabel = (type: EmployeeType | null | undefined): string => {
  if (!type) return "-";
  return EMPLOYEE_TYPE_LABEL[type] ?? "-";
};


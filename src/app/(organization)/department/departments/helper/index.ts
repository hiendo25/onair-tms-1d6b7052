import { EmployeeStatus } from "@/types/dto/employees/employee.dto";

export function resolveEmployeeStatusLabel(status: EmployeeStatus) {
  switch (status) {
    case "active":
      return "Hoạt động";
    case "inactive":
      return "Không hoạt động";
    default:
      return "Không xác định";
  }
}

export function resolveEmployeeStatusColor(status: EmployeeStatus): "success" | "default" | "error" {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "default";
    default:
      return "error";
  }
}

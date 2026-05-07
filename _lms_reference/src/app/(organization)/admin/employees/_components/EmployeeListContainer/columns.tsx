import { Chip } from "@mui/material";

import { TableDataProps } from "@/shared/ui/TableData";
import { EmployeeDto } from "@/types/dto/employees";

export const employeeColumns: TableDataProps<EmployeeDto>["columns"] = [
  { headerName: "Mã", field: "employee_code", id: "employee_code", width: 120 },
  {
    headerName: "Họ và tên",
    field: "full_name",
    id: "full_name",
    renderCell(value, row) {
      return row.profiles?.full_name ?? "--";
    },
  },
  {
    headerName: "Email",
    field: "email",
    id: "email",
    renderCell(value, row) {
      return row.profiles?.email ?? "--";
    },
  },
  {
    headerName: "Loại người dùng",
    field: "employee_type",
    id: "employee_type",
    width: 140,
    renderCell(value, { employee_type }) {
      if (employee_type === "admin") {
        return "Quản trị viên";
      }
      if (employee_type === "teacher") {
        return "Giảng viên";
      }
      if (employee_type === "student") {
        return "Học sinh";
      }
    },
  },
  {
    headerName: "Chức danh",
    field: "position_name",
    id: "position_name",
    renderCell(value, row) {
      return row.positions?.title;
    },
  },
  {
    headerName: "Phòng ban",
    field: "department",
    id: "department",
    renderCell(value, row) {
      return row.employee_departments[0]?.departments?.name ?? "--";
    },
  },
  {
    headerName: "Chi nhánh",
    field: "branch_name",
    id: "branch_name",
    renderCell(value, row) {
      return row.employee_branches[0]?.branches?.name ?? "--";
    },
  },
  {
    headerName: "Trạng thái",
    field: "status",
    id: "status",
    width: 160,
    renderCell(value, { status }) {
      if (status === "active") {
        return <Chip label="Hoạt động" color="success" />;
      }
      if (status === "inactive") {
        return <Chip label="Không hoạt động" color="error" />;
      }
      return "unknown";
    },
  },
];

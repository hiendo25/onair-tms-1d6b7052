import { Chip } from "@mui/material";

import { GetEmployeesResponse } from "@/modules/employees/types/get-employee.type";
import { TableDataProps } from "@/shared/ui/TableData";
type EmployeeRecord = NonNullable<GetEmployeesResponse["data"]>["data"][number];
export const employeeColumns: TableDataProps<EmployeeRecord>["columns"] = [
  {
    id: "employeeCode",
    field: "employeeCode",
    headerName: "Mã nhân viên",
  },
  {
    field: "fullName",
    headerName: "Họ và tên",
    renderCell(value, row) {
      return row.profile?.fullName;
    },
  },
  {
    field: "email",
    headerName: "Email",
    renderCell(value, row) {
      return row.profile?.email;
    },
  },
  {
    id: "status",
    field: "status",
    headerName: "Trạng thái",
    renderCell: (value, { status }) => {
      if (status === "active") {
        return <Chip label="Hoạt động" color="success" />;
      }
      if (status === "inactive") {
        return <Chip label="Ngừng hoạt động" color="error" />;
      }
      return "-";
    },
  },
];

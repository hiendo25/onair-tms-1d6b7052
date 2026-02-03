import { TableDataProps } from "@/shared/ui/TableData";

export const employeeColumns: TableDataProps<DepartmentEmployeeRow>["columns"] = [
  {
    id: "employeeCode",
    field: "employeeCode",
    headerName: "Mã nhân viên",
  },
  {
    id: "fullName",
    field: "fullName",
    headerName: "Họ và tên",
  },
  {
    id: "email",
    field: "email",
    headerName: "Email",
  },
  {
    id: "positionTitle",
    field: "positionTitle",
    headerName: "Chức danh",
  },
  {
    id: "branchName",
    field: "branchName",
    headerName: "Chi nhánh",
  },
  {
    id: "departmentName",
    field: "departmentName",
    headerName: "Phòng ban",
  },
  {
    id: "status",
    field: "status",
    headerName: "Trạng thái",
    renderCell: (value) => (
      <Chip
        label={resolveEmployeeStatusLabel(value as EmployeeStatus)}
        color={resolveEmployeeStatusColor(value as EmployeeStatus)}
        size="small"
        sx={{ minWidth: 100 }}
      />
    ),
  },
];

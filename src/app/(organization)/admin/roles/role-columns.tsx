import { TableDataProps } from "@/shared/ui/TableData";
import { GetRoleListResponse } from "@/repository/roles";
import { Chip } from "@mui/material";
export type RoleColumnType = GetRoleListResponse["items"][number];

export const rolesColumns: TableDataProps<RoleColumnType>["columns"] = [
  {
    id: "title",
    headerName: "Tên quyền",
    field: "title",
    width: 240,
  },
  {
    id: "code",
    headerName: "Mã vai trò",
    field: "code",
    width: 160,
    renderCell(value, { code }) {
      return <Chip label={code} variant="outlined" color="primary" />;
    },
  },
  {
    id: "description",
    headerName: "Mô tả",
    field: "description",
  },
];

import { Chip } from "@mui/material";

import { AdminGetRoleListResponse } from "@/repository/roles";
import { TableDataProps } from "@/shared/ui/TableData";
export type RoleColumnType = AdminGetRoleListResponse["items"][number];

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

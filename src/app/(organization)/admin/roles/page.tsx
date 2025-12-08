"use client";

import AddIcon from "@mui/icons-material/Add";
import { Box, Button, IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useMemo, useRef, useState } from "react";
import { PATHS } from "@/constants/path.contstants";
import { useGetRoleList } from "@/modules/roles/operations/query";
import PageContainer from "@/shared/ui/PageContainer";
import Link from "next/link";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import { useDeleteRole } from "@/modules/roles/operations/mutation";
import TableData, { TableDataProps } from "@/shared/ui/TableData";
import Can from "@/modules/permission-wrapper/components/Can";
import { Edit02Icon, Trash01Icon } from "@/shared/assets/icons";
import { usePermissions } from "@/modules/permission-wrapper";
import DialogDeleteRoleConfirmation, {
  DialogDeleteRoleConfirmationRef,
} from "./components/DialogDeleteRoleConfirmation";
import { rolesColumns } from "./role-columns";
interface RoleData {
  id: string;
  title: string;
  code: string;
  description: string | null;
  user_count: number;
  created_at: string | null;
}

const RolesPage = () => {
  const router = useRouter();
  const dialogs = useDialogs();

  const dialogDeleteRef = useRef<DialogDeleteRoleConfirmationRef>(null);
  const [queryParams, setQueryParams] = useState({
    page: 1,
    pageSize: 10,
  });
  const { data, isLoading, isPending } = useGetRoleList(queryParams);
  const { mutate: deleteRoleMutate, isPending: isDeleting } = useDeleteRole();

  const roleList = useMemo(() => {
    return data?.items;
  }, [data]);

  const totalRoleCount = useMemo(() => {
    return data?.itemCount || 0;
  }, [data]);

  const { hasPermissions } = usePermissions();
  const canCreateOrDeleteRole = hasPermissions([{ $or: "role:create" }, { $or: "role:delete" }]);
  const handleDelete = async (role: RoleData) => {
    const confirmed = await dialogs.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.title}" không?`, {
      title: "Xác nhận xóa",
      okText: "Xóa",
      cancelText: "Hủy",
      severity: "error",
    });

    if (!confirmed) {
      return;
    }

    deleteRoleMutate(role.id);
  };

  const handleChangePagegination = (newPage: number) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleChangePageSize = (newPageSize: number) => {
    setQueryParams((prev) => ({
      ...prev,
      pageSize: newPageSize,
    }));
  };

  const handleDeleteRole = (roleId: string, roleName: string) => () => {
    dialogDeleteRef.current?.open(
      {
        title: `Xóa "${roleName}"`,
        description: "Dữ liệu đã xóa không thể khôi phục, bạn vẫn muốn xóa.",
      },
      {
        onOk: () => {
          deleteRoleMutate(roleId);
        },
      },
    );
  };

  type ColumnType = Exclude<Exclude<typeof data, undefined>["items"], undefined>[number];

  const mergeColumns: TableDataProps<ColumnType>["columns"] = useMemo(() => {
    return canCreateOrDeleteRole
      ? [
          ...rolesColumns,
          {
            id: "action",
            field: "action",
            headerName: "Hành động",
            fixed: "right",
            width: 140,
            renderCell: (value, row) => {
              return (
                <>
                  <Can pers={["role:update"]}>
                    <IconButton
                      size="small"
                      href={PATHS.ROLE.ROLES_ID(row.code)}
                      LinkComponent={Link}
                      className="text-blue-600 bg-transparent hover:bg-blue-50"
                    >
                      <Edit02Icon className="w-4 h-4" />
                    </IconButton>
                  </Can>
                  <Can pers={["role:delete"]}>
                    <IconButton
                      size="small"
                      className="text-red-600 bg-transparent hover:bg-red-50"
                      onClick={handleDeleteRole(row.id, row.title)}
                    >
                      <Trash01Icon className="w-4 h-4" />
                    </IconButton>
                  </Can>
                </>
              );
            },
          },
        ]
      : rolesColumns;
  }, [canCreateOrDeleteRole]);

  return (
    <PageContainer title="Quản lý vai trò & phân quyền" breadcrumbs={[{ title: "Quản lý vai trò & phân quyền" }]}>
      <div className="bg-white rounded-lg">
        <div className="header px-4 py-3">
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} LinkComponent={Link} href={PATHS.ROLE.CREATE}>
              Tạo vai trò
            </Button>
          </Box>
        </div>
        <TableData
          rows={roleList}
          columns={mergeColumns}
          hoverRow
          loading={isLoading || isPending}
          showRowCount
          pagination={{
            page: queryParams.page,
            pageSize: queryParams.pageSize,
            total: totalRoleCount,
            onChangePage: handleChangePagegination,
            onChangePageSize: handleChangePageSize,
          }}
          minWidth={1200}
        />
      </div>
      <DialogDeleteRoleConfirmation ref={dialogDeleteRef} />
    </PageContainer>
  );
};

export default RolesPage;

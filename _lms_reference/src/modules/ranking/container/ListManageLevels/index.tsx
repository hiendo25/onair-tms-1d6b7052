"use client";
import React, { memo, useCallback, useMemo, useState } from "react";
import { useRef } from "react";
import { Alert, IconButton, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import { useUserOrganization } from "@/modules/organization";
import { Edit02Icon, Trash01Icon } from "@/shared/assets/icons";
import { IOSSwitch } from "@/shared/ui/form/CustomSwitcher";
import TableData, { TableDataProps } from "@/shared/ui/TableData";
import { useDeleteLevelMutation, useToggleActiveStatusLevelMutation } from "../../operations/mutations";
import { useGetLevelsQuery } from "../../operations/query";
import DrawerUpdateLevelForm, { DrawerUpdateLevelFormRef } from "../DrawerUpdateLevelForm";

import { getLevelColumns, type LevelColumnItem } from "./level-columns";
type LevelItem = any;

type GetLevelQueryParams = {
  page: number;
  pageSize: number;
};
interface ListManageLevelsProps {}

const ListManageLevels: React.FC<ListManageLevelsProps> = () => {
  const dialog = useDialogs();
  const { enqueueSnackbar } = useSnackbar();
  const actionRecordRef = useRef<LevelColumnItem>(null);
  const organizationId = useUserOrganization((state) => state.currentOrganization.orgId);
  const drawerUpdateRef = useRef<DrawerUpdateLevelFormRef>(null);
  const [queryParams, setQueryParams] = useState<GetLevelQueryParams>({ page: 1, pageSize: 10 });

  const { data, isPending } = useGetLevelsQuery({
    queryParams: {
      ...queryParams,
      organizationId,
    },
  });

  const { mutate: deleteLevel, isPending: isPendingDelete } = useDeleteLevelMutation();
  const { mutate: toggleActive, isPending: isPendingUpdateStatus } = useToggleActiveStatusLevelMutation();
  const queryClient = useQueryClient();

  const rows = data ? data.data : [];

  const rowCount = useMemo(() => data?.total || 0, [data]);

  const page = data?.page || queryParams.page;

  const pageSize = data?.pageSize || queryParams.pageSize;

  const handleUpdateLevel = (record: LevelColumnItem) => () => {
    drawerUpdateRef.current?.open({
      id: record.id,
      description: record.description ?? "",
      icon: record.icon ?? "",
      scoreRequired: record.scoreRequired,
      title: record.title,
    });
  };

  const handleDeleteItem = (record: LevelItem) => async () => {
    actionRecordRef.current = record;
    const isConfirmed = await dialog.confirm(
      <Typography>
        Lưu ý xóa là không thể khôi phục lại dữ liệu đã mất, Bạn chắc chắn muốn xóa {`"${record.title}"`}
      </Typography>,
      { severity: "error", title: "Xác nhận xóa" },
    );
    if (!isConfirmed) return;

    deleteLevel(record.id, {
      onSuccess(data, variables, onMutateResult, context) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_LEVELS],
        });
        enqueueSnackbar("Xóa thành công", { variant: "success" });
        actionRecordRef.current = null;
      },
    });
  };

  const handleToggleActiveItem = (row: LevelItem, status: "active" | "inactive") => () => {
    toggleActive(
      { id: row.id, status },
      {
        onSuccess(data, variables, onMutateResult, context) {
          const message = variables.status === "active" ? "Kích hoạt thành công." : "Ngừng kích hoạt thành công";
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_LEVELS],
          });
          enqueueSnackbar(message, { variant: "success" });
        },
      },
    );
  };
  const onChangePage = useCallback((page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  }, []);

  const onChangePageSize = useCallback((pageSize: number) => {
    setQueryParams((prev) => ({ ...prev, pageSize }));
  }, []);

  const baseColumns = useMemo(() => {
    return getLevelColumns();
  }, []);

  const levelColumns: TableDataProps<LevelColumnItem>["columns"] = [
    ...baseColumns,
    {
      id: "actions",
      field: "actions",
      headerName: "Hành động",
      align: "right",
      renderCell(value, row) {
        return (
          <div className="flex justify-end items-center gap-2">
            <IOSSwitch
              size="small"
              loading
              checked={row.status === "active"}
              onChange={handleToggleActiveItem(row, row.status === "active" ? "inactive" : "active")}
            />
            <span className="mx-2 text-gray-300">|</span>
            <IconButton size="small" className="bg-white text-blue-600" onClick={handleUpdateLevel(row)}>
              <Edit02Icon className="w-4 h-4" />
            </IconButton>
            <IconButton
              size="small"
              className="bg-white text-red-600"
              onClick={handleDeleteItem(row)}
              loading={isPendingDelete && row.id === actionRecordRef.current?.id}
            >
              <Trash01Icon className="w-4 h-4" />
            </IconButton>
          </div>
        );
      },
    },
  ];
  return (
    <>
      <TableData
        rows={rows}
        columns={levelColumns}
        loading={isPending}
        showRowCount
        pagination={{
          total: rowCount,
          page,
          pageSize,
          onChangePage,
          onChangePageSize,
        }}
      />

      <Alert className="mt-4" severity="info">
        <Typography
          variant="body2"
          sx={{
            color: "info.dark",
          }}
        >
          Lưu ý: <br />
          Mỗi học viên chỉ có 1 danh hiệu tại 1 thời điểm <br />
          Danh hiệu được tự động cập nhật theo thành tích <br />
          Thứ tự ưu tiên quyết định danh hiệu nào được hiển thị khi đáp ứng nhiều điều kiện
        </Typography>
      </Alert>

      <DrawerUpdateLevelForm ref={drawerUpdateRef} />
    </>
  );
};
export default memo(ListManageLevels);

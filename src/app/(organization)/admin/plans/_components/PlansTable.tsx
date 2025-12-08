"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Typography,
  ListItemText,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import { PATHS } from "@/constants/path.contstants";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import PageContainer from "@/shared/ui/PageContainer";
import TableData, { TableDataProps } from "@/shared/ui/TableData";
import { useGetPlansQuery } from "@/modules/plans/operations/query";
import { useDeletePlanMutation } from "@/modules/plans/operations/mutation";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { PlanStatus } from "@/model/plan.model";
import { formatCurrencyV2 } from "@/utils/format-number";
import { fDateTime, FORMAT_DATE_TIME_CLEANER } from "@/lib";
import { getStatusColor, getStatusLabel } from "../helper";
import StatCard from "./StatCard";

export default function PlansTable() {
  const router = useRouter();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const organizationId = useUserOrganization((state) => state.data.organization.id);

  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchInput, setSearchInput] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);

  const { data, isLoading } = useGetPlansQuery({
    organizationId,
    search: searchInput,
    page,
    limit: rowsPerPage,
  });
  const plans = data?.data || [];
  const planStats = data?.stats || { total: 0, approved: 0, pending: 0, rejected: 0 };

  const { mutateAsync: deletePlan } = useDeletePlanMutation();

  const menuOpen = Boolean(anchorEl);
  const totalCount = data?.total || 0;

  const handleCreatePlan = () => {
    router.push(PATHS.PLANS.CREATE);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, planId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedPlanId(planId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlanId(null);
  };

  const handleViewDetail = () => {
    if (selectedPlanId) {
      router.push(PATHS.PLANS.DETAIL(selectedPlanId));
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedPlanId) {
      router.push(PATHS.PLANS.EDIT(selectedPlanId));
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedPlanId) return;

    const confirmed = await dialogs.confirm(
      "Bạn có chắc chắn muốn xóa kế hoạch đào tạo này?",
      {
        title: "Xác nhận xóa",
        okText: "Xóa",
        cancelText: "Hủy",
        severity: "error",
      }
    );

    if (confirmed) {
      try {
        await deletePlan(selectedPlanId);
        notifications.show("Xóa kế hoạch đào tạo thành công", { severity: "success" });
      } catch (error: any) {
        notifications.show(error?.message || "Xóa kế hoạch đào tạo thất bại", { severity: "error" });
      }
    }

    handleMenuClose();
  };

  const handleAssignCourses = () => {
    if (selectedPlanId) {
      router.push(`${PATHS.PLANS.EDIT(selectedPlanId)}?step=5`);
    }
    handleMenuClose();
  };

  const columns: TableDataProps<any>["columns"] = [
    {
      id: "name",
      field: "name",
      headerName: "Tên kế hoạch",
      width: 360,
      renderCell: (value) => (
        <Typography
          variant="body2"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
          }}
        >
          {value}
        </Typography>
      ),
    },
    {
      id: "time",
      field: "time",
      headerName: "Thời gian",
      width: 220,
      renderCell: (_value, row) =>
        row.startDate && row.endDate ? `${fDateTime(row.startDate, FORMAT_DATE_TIME_CLEANER)} - ${fDateTime(row.endDate, FORMAT_DATE_TIME_CLEANER)}` : "Chưa có",
    },
    {
      id: "budget",
      field: "budget",
      headerName: "Ngân sách",
      width: 180,
      renderCell: (_value, row) => (row.budget ? formatCurrencyV2(row.budget) : "—"),
    },
    {
      id: "status",
      field: "status",
      headerName: "Trạng thái",
      width: 140,
      renderCell: (value) => (
        <Chip label={getStatusLabel(value as PlanStatus)} color={getStatusColor(value as PlanStatus)} size="small" />
      ),
    },
    {
      id: "action",
      field: "action",
      headerName: "Hành động",
      width: 120,
      fixed: "right",
      renderCell: (_value, row) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, row.id)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <PageContainer
      title="Kế hoạch đào tạo"
      breadcrumbs={[
        { title: "Kế hoạch đào tạo", path: PATHS.PLANS.ROOT },
      ]}
    >
      <Box
        sx={{
          background: "white",
          borderRadius: 2,
          p: { xs: 2.5, md: 3 },
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          sx={{ mb: 2.5 }}
        >
          <TextField
            placeholder="Tìm kiếm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
            sx={{ minWidth: { xs: "100%", sm: 280 }, maxWidth: 360 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }
            }}
          />
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreatePlan}
            sx={{ alignSelf: { xs: "stretch", md: "center" }, borderRadius: 2 }}
          >
            Tạo kế hoạch
          </Button>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(auto-fit, minmax(180px, 1fr))", sm: "repeat(4, minmax(0, 1fr))" },
            gap: 1.5,
            mb: 2,
          }}
        >
          <StatCard label="Tổng kế hoạch" value={planStats.total} helper="Danh sách hiện có" />
          <StatCard label="Đang chờ duyệt" value={planStats.pending} helper="Chờ quyết định" tone="warning" />
          <StatCard label="Đã duyệt" value={planStats.approved} helper="Có thể gán môn học" tone="success" />
          <StatCard label="Bị từ chối" value={planStats.rejected} helper="Cần chỉnh sửa" tone="error" />
        </Box>

        <TableData
          rows={plans}
          columns={columns}
          hoverRow
          loading={isLoading}
          showRowCount
          bordered={false}
          minWidth={960}
          pagination={{
            page,
            pageSize: rowsPerPage,
            total: totalCount,
            perPageOptions: [10, 20, 30],
            onChangePage: (newPage) => setPage(newPage),
            onChangePageSize: (newPageSize) => {
              setRowsPerPage(newPageSize);
              setPage(1);
            },
          }}
        />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleViewDetail}>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        {selectedPlanId && plans.find((p) => p.id === selectedPlanId)?.status === "approved" && (
          <MenuItem onClick={handleAssignCourses}>
            <ListItemText>Gán môn học</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleEdit}>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemText>Xóa kế hoạch</ListItemText>
        </MenuItem>
      </Menu>
    </PageContainer>
  );
}

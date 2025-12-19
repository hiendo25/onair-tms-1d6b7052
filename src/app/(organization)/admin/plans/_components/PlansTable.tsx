"use client";

import * as React from "react";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import useDebounce from "@/hooks/useDebounce";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { fDateTime, FORMAT_DATE_TIME_CLEANER } from "@/lib";
import { PlanStatus } from "@/model/plan.model";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import { useDeletePlanMutation } from "@/modules/plans/operations/mutation";
import { useGetPlansQuery } from "@/modules/plans/operations/query";
import { EmptyBoxIcon } from "@/shared/assets/icons";
import PageContainer from "@/shared/ui/PageContainer";
import TableData, { TableDataProps } from "@/shared/ui/TableData";
import { formatCurrencyV2 } from "@/utils/format-number";
import { getStatusColor, getStatusLabel } from "../helper";

import StatCard from "./StatCard";

const parseDate = (value?: string | null): Dayjs | null => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

export default function PlansTable() {
  const router = useRouter();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const organizationId = useUserOrganization((state) => state.currentOrganization.orgId);

  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchInput, setSearchInput] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<PlanStatus | "all">("all");
  const [startDateFilter, setStartDateFilter] = React.useState<string | null>(null);
  const [endDateFilter, setEndDateFilter] = React.useState<string | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const debouncedSearch = useDebounce(searchInput, 400);

  const startDateRange = React.useMemo(
    () => (startDateFilter ? dayjs(startDateFilter).startOf("day").toISOString() : undefined),
    [startDateFilter],
  );
  const endDateRange = React.useMemo(
    () => (endDateFilter ? dayjs(endDateFilter).endOf("day").toISOString() : undefined),
    [endDateFilter],
  );

  const { data, isLoading } = useGetPlansQuery({
    organizationId,
    search: debouncedSearch,
    page,
    limit: rowsPerPage,
    status: statusFilter,
    startDate: startDateRange,
    endDate: endDateRange,
  });
  const plans = data?.data || [];
  const planStats = data?.stats || { total: 0, approved: 0, pending: 0, pending_survey: 0, rejected: 0 };
  const statusFilters = React.useMemo(
    () => [
      { value: "all" as const, label: "Tất cả", count: planStats.total, color: "default" as const },
      {
        value: "pending_survey" as const,
        label: "Chờ khảo sát",
        count: planStats.pending_survey,
        color: "warning" as const,
      },
      { value: "pending" as const, label: "Đang chờ duyệt", count: planStats.pending, color: "warning" as const },
      { value: "approved" as const, label: "Đã duyệt", count: planStats.approved, color: "success" as const },
      { value: "rejected" as const, label: "Từ chối", count: planStats.rejected, color: "error" as const },
    ],
    [planStats],
  );

  const { mutateAsync: deletePlan } = useDeletePlanMutation();

  const menuOpen = Boolean(anchorEl);
  const totalCount = data?.total || 0;
  const isEmpty = !isLoading && plans.length === 0;
  const activeStatusLabel = statusFilter === "all" ? "Tất cả kế hoạch" : getStatusLabel(statusFilter as PlanStatus);
  const hasFilter = statusFilter !== "all" || !!debouncedSearch || !!startDateFilter || !!endDateFilter;
  const hasActiveFilter = statusFilter !== "all" || !!searchInput || !!startDateFilter || !!endDateFilter;

  const handleCreatePlan = () => {
    router.push(PATHS.PLANS.CREATE);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setPage(1);
  };

  const handleStatusFilterChange = (value: PlanStatus | "all") => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleDateFilterChange = (field: "startDate" | "endDate", value: string | null) => {
    setPage(1);
    if (field === "startDate") {
      setStartDateFilter(value);
      return;
    }
    setEndDateFilter(value);
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setSearchInput("");
    setStartDateFilter(null);
    setEndDateFilter(null);
    setPage(1);
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

    const confirmed = await dialogs.confirm("Bạn có chắc chắn muốn xóa kế hoạch đào tạo này?", {
      title: "Xác nhận xóa",
      okText: "Xóa",
      cancelText: "Hủy",
      severity: "error",
    });

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
        row.startDate && row.endDate
          ? `${fDateTime(row.startDate, FORMAT_DATE_TIME_CLEANER)} - ${fDateTime(
              row.endDate,
              FORMAT_DATE_TIME_CLEANER,
            )}`
          : "Chưa có",
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
      width: 220,
      renderCell: (value, row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={getStatusLabel(value as PlanStatus)} color={getStatusColor(value as PlanStatus)} size="small" />
          {row.surveyCompleted && <Chip label="Khảo sát xong" color="success" variant="outlined" size="small" />}
        </Stack>
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
    <PageContainer title="Kế hoạch đào tạo" breadcrumbs={[{ title: "Kế hoạch đào tạo", path: PATHS.PLANS.ROOT }]}>
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Tìm kiếm
            </Typography>
            <TextField
              placeholder="Tìm kiếm..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 280 }, maxWidth: 360 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchInput ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Từ ngày
            </Typography>
            <DatePicker
              value={parseDate(startDateFilter)}
              onChange={(newValue) => handleDateFilterChange("startDate", newValue ? newValue.toISOString() : null)}
              format="DD/MM/YYYY"
              slotProps={{
                field: { clearable: true },
                textField: {
                  size: "small",
                  fullWidth: true,
                  sx: { minWidth: { xs: "100%", sm: 200 }, maxWidth: 240 },
                },
              }}
            />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Đến ngày
            </Typography>
            <DatePicker
              value={parseDate(endDateFilter)}
              onChange={(newValue) => handleDateFilterChange("endDate", newValue ? newValue.toISOString() : null)}
              format="DD/MM/YYYY"
              slotProps={{
                field: { clearable: true },
                textField: {
                  size: "small",
                  fullWidth: true,
                  sx: { minWidth: { xs: "100%", sm: 200 }, maxWidth: 240 },
                },
              }}
            />
          </Box>
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

        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          alignItems={{ xs: "flex-start", lg: "center" }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {statusFilters.map((filter) => {
              const isActive = statusFilter === filter.value;
              return (
                <Chip
                  key={filter.value}
                  label={`${filter.label}${typeof filter.count === "number" ? ` (${filter.count})` : ""}`}
                  color={isActive ? filter.color : "default"}
                  variant={isActive ? "filled" : "outlined"}
                  onClick={() => handleStatusFilterChange(filter.value)}
                  sx={{
                    borderRadius: 999,
                    fontWeight: 600,
                    px: 0.5,
                  }}
                />
              );
            })}
          </Stack>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(auto-fit, minmax(180px, 1fr))",
              lg: "repeat(5, minmax(0, 1fr))",
            },
            gap: 1.5,
            mb: 2,
          }}
        >
          <StatCard label="Tổng kế hoạch" value={planStats.total} helper="Danh sách hiện có" />
          <StatCard
            label="Chờ khảo sát"
            value={planStats.pending_survey}
            helper="Đang thu thập khảo sát"
            tone="warning"
          />
          <StatCard label="Đang chờ duyệt" value={planStats.pending} helper="Chờ quyết định" tone="warning" />
          <StatCard label="Đã duyệt" value={planStats.approved} helper="Hoàn tất phê duyệt" tone="success" />
          <StatCard label="Bị từ chối" value={planStats.rejected} helper="Cần chỉnh sửa" tone="error" />
        </Box>

        {isEmpty ? (
          <Box
            sx={{
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
              p: { xs: 3, md: 4 },
              textAlign: "center",
              bgcolor: "grey.50",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <EmptyBoxIcon className="w-20 h-20" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {hasFilter ? "Không có kế hoạch khớp bộ lọc" : "Chưa có kế hoạch nào"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              {hasFilter
                ? "Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm."
                : "Tạo kế hoạch đầu tiên để bắt đầu quản lý đào tạo."}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
              {hasFilter && (
                <Button variant="outlined" onClick={handleResetFilters}>
                  Xóa bộ lọc
                </Button>
              )}
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreatePlan}>
                Tạo kế hoạch
              </Button>
            </Stack>
          </Box>
        ) : (
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
        )}
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
        {/* {selectedPlanId && plans.find((p) => p.id === selectedPlanId)?.status === "approved" && (
          <MenuItem onClick={handleAssignCourses}>
            <ListItemText>Gán môn học</ListItemText>
          </MenuItem>
        )} */}
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

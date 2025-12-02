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

  const { data: plans = [], isLoading } = useGetPlansQuery({ organizationId, search: searchInput });
  const { mutateAsync: deletePlan } = useDeletePlanMutation();

  const menuOpen = Boolean(anchorEl);
  const totalCount = plans.length;

  const pagedPlans = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return plans.slice(start, start + rowsPerPage);
  }, [plans, page, rowsPerPage]);

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
      router.push(PATHS.PLANS.EDIT(selectedPlanId));
      // notifications.show("Chức năng gán môn học đang được phát triển", { severity: "info" });
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
      field:"time",
      headerName: "Thời gian",
      width: 220,
      renderCell: (_value, row) =>
        row.startDate && row.endDate ? `${fDateTime(row.startDate,FORMAT_DATE_TIME_CLEANER)} - ${fDateTime(row.endDate,FORMAT_DATE_TIME_CLEANER)}` : "Chưa có",
    },
    {
      id: "budget",
      field:"budget",
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
      field:"action",
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
          borderRadius: 1,
          p: 3,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          <TextField
            placeholder="Tìm kiếm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
            sx={{ width: 320 }}
            slotProps={{
              input:{
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
          >
            Tạo kế hoạch
          </Button>
        </Box>

        <TableData
          rows={pagedPlans}
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

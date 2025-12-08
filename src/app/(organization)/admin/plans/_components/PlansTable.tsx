"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  ListItemText,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import { PATHS } from "@/constants/path.contstants";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import PageContainer from "@/shared/ui/PageContainer";

// Mock data type
type PlanStatus = "pending" | "approved" | "rejected";

interface MockPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  programsCount: number;
  topicsCount: number;
  status: PlanStatus;
  budget: number;
}

// Mock data
const MOCK_PLANS: MockPlan[] = [
  {
    id: "1",
    name: "Kế hoạch đào tạo 2026 cho khối B2B Edtech",
    startDate: "15/10/2025",
    endDate: "20/10/2025",
    programsCount: 3,
    topicsCount: 6,
    status: "pending",
    budget: 200000000,
  },
  {
    id: "2",
    name: "Khoá học cơ bản về AI dành cho Doanh nghiệp trong thời kỳ đổi mới trong năm 2025 nếu ...",
    startDate: "15/10/2025",
    endDate: "20/10/2025",
    programsCount: 2,
    topicsCount: 8,
    status: "approved",
    budget: 200000000,
  },
  {
    id: "3",
    name: "Kế hoạch training đi học B2B",
    startDate: "15/10/2025",
    endDate: "20/10/2025",
    programsCount: 1,
    topicsCount: 3,
    status: "rejected",
    budget: 200000000,
  },
  {
    id: "4",
    name: "Kế hoạch đào tạo Q1 2025",
    startDate: "01/01/2025",
    endDate: "31/03/2025",
    programsCount: 4,
    topicsCount: 10,
    status: "approved",
    budget: 150000000,
  },
  {
    id: "5",
    name: "Chương trình đào tạo kỹ năng mềm",
    startDate: "10/02/2025",
    endDate: "28/02/2025",
    programsCount: 2,
    topicsCount: 5,
    status: "pending",
    budget: 100000000,
  },
];

const getStatusLabel = (status: PlanStatus): string => {
  switch (status) {
    case "pending":
      return "Chờ duyệt";
    case "approved":
      return "Đã duyệt";
    case "rejected":
      return "Từ chối";
    default:
      return status;
  }
};

const getStatusColor = (status: PlanStatus): "warning" | "success" | "error" => {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "error";
    default:
      return "warning";
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function PlansTable() {
  const router = useRouter();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [plans, setPlans] = React.useState<MockPlan[]>(MOCK_PLANS);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchInput, setSearchInput] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);

  const menuOpen = Boolean(anchorEl);

  // Filter plans based on search
  const filteredPlans = React.useMemo(() => {
    if (!searchInput) return plans;
    return plans.filter((plan) =>
      plan.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [plans, searchInput]);

  const totalCount = filteredPlans.length;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
      // Remove from local state (mock delete)
      setPlans((prev) => prev.filter((plan) => plan.id !== selectedPlanId));
      notifications.show("Xóa kế hoạch đào tạo thành công", { severity: "success" });
    }

    handleMenuClose();
  };

  const handleAssignCourses = () => {
    if (selectedPlanId) {
      router.push(PATHS.PLANS.EDIT(selectedPlanId));
      notifications.show("Chức năng gán môn học đang được phát triển", { severity: "info" });
    }
    handleMenuClose();
  };

  return (
    <PageContainer
      title="Kế hoạch đào tạo"
      breadcrumbs={[
        { title: "Kế hoạch đào tạo", path: PATHS.PLANS.ROOT },
      ]}
    >
      <Box>
        <Card>
          {/* Header with Search and Create Button */}
          <Box sx={{ p: 3, display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              placeholder="Tìm kiếm"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              size="small"
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
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

          {/* Table */}
          <TableContainer sx={{ px: 3, pb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "35%" }}>Tên kế hoạch</TableCell>
                  <TableCell sx={{ width: "20%" }}>Thời gian</TableCell>
                  <TableCell sx={{ width: "18%" }}>Ngân sách</TableCell>
                  <TableCell sx={{ width: "15%" }}>Trạng thái</TableCell>
                  <TableCell align="center" sx={{ width: "12%" }}>Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Chưa có kế hoạch đào tạo nào
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Hãy tạo kế hoạch đào tạo đầu tiên của bạn
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreatePlan}
                      >
                        Tạo kế hoạch
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlans
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((plan) => (
                      <TableRow key={plan.id} hover>
                        <TableCell>
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
                            {plan.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {plan.startDate} - {plan.endDate}
                        </TableCell>
                        <TableCell>{formatCurrency(plan.budget)}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(plan.status)}
                            color={getStatusColor(plan.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, plan.id)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {filteredPlans.length > 0 && (
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 30]}
              labelRowsPerPage="Hiển thị"
              labelDisplayedRows={({ from, to, count }) =>
                `Hiển thị ${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`
              }
            />
          )}
        </Card>

        {/* Action Menu */}
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
      </Box>
    </PageContainer>
  );
}


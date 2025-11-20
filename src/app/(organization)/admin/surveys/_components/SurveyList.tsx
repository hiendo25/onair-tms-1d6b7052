"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Menu,
  MenuItem,
  ListItemText,
  TextField,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PageContainer from "@/shared/ui/PageContainer";
import { MOCK_SURVEYS } from "@/constants/survey.constants";
import { Survey } from "@/types/survey.types";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";

export default function SurveyList() {
  const router = useRouter();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(12);
  const [surveys, setSurveys] = React.useState<Survey[]>(MOCK_SURVEYS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedSurveyId, setSelectedSurveyId] = React.useState<string | null>(null);
  const menuOpen = Boolean(anchorEl);

  const filteredSurveys = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return surveys;
    }
    const query = searchQuery.toLowerCase();
    return surveys.filter(
      (survey) =>
        survey.name.toLowerCase().includes(query) ||
        survey.description.toLowerCase().includes(query)
    );
  }, [surveys, searchQuery]);

  const paginatedSurveys = React.useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredSurveys.slice(start, end);
  }, [filteredSurveys, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleCreateSurvey = () => {
    router.push("/admin/surveys/create");
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, surveyId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedSurveyId(surveyId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSurveyId(null);
  };

  const handleCopyLink = async () => {
    if (!selectedSurveyId) return;

    const surveyUrl = `${window.location.origin}/surveys/${selectedSurveyId}/submit`;
    try {
      await navigator.clipboard.writeText(surveyUrl);
      notifications.show("Đã sao chép liên kết khảo sát", {
        severity: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      notifications.show("Không thể sao chép liên kết", {
        severity: "error",
        autoHideDuration: 3000,
      });
    }
    handleMenuClose();
  };

  const handleViewStatistics = () => {
    if (selectedSurveyId) {
      router.push(`/admin/surveys/${selectedSurveyId}/statistics`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedSurveyId) {
      router.push(`/admin/surveys/${selectedSurveyId}/edit`);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedSurveyId) return;

    const confirmed = await dialogs.confirm(
      "Bạn có chắc chắn muốn xóa khảo sát này không? Hành động này không thể hoàn tác.",
      {
        title: "Xác nhận xóa",
        okText: "Xóa",
        cancelText: "Hủy",
        severity: "error",
      },
    );

    if (!confirmed) {
      handleMenuClose();
      return;
    }

    setSurveys((prev) => prev.filter((survey) => survey.id !== selectedSurveyId));
    notifications.show("Xóa khảo sát thành công!", {
      severity: "success",
      autoHideDuration: 3000,
    });
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const timeStr = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    return `${dateStr}, ${timeStr}`;
  };

  return (
    <PageContainer
      title="Danh sách khảo sát"
      breadcrumbs={[{ title: "Khảo sát", path: "/admin/surveys" }]}
    >
      <Box sx={{ py: 3 }}>
        <Card sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 3 }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <TextField
              placeholder="Tìm kiếm khảo sát..."
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              sx={{ width: { xs: "100%", sm: 300 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateSurvey}>
              Tạo khảo sát
            </Button>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên khảo sát</TableCell>
                  <TableCell>Số lượng phản hồi</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSurveys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" color="text.secondary">
                        Không tìm thấy khảo sát nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSurveys.map((survey) => (
                    <TableRow key={survey.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {survey.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 500,
                          }}
                        >
                          {survey.description}
                        </Typography>
                      </TableCell>
                      <TableCell>{survey.total_submissions}</TableCell>
                      <TableCell>{formatDate(survey.created_at)}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, survey.id)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredSurveys.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[12, 25, 50, 100]}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />

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
            <MenuItem onClick={handleViewStatistics}>
              <ListItemText>Xem thống kê</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleCopyLink}>
              <ListItemText>Sao chép liên kết</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleEdit}>
              <ListItemText>Chỉnh sửa</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <ListItemText>Xóa khảo sát</ListItemText>
            </MenuItem>
          </Menu>
        </Card>
      </Box>
    </PageContainer>
  );
}


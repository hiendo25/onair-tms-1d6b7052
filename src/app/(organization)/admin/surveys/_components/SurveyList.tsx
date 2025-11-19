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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
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

  const handleEdit = (id: string) => {
    router.push(`/admin/surveys/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
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
      return;
    }

    setSurveys((prev) => prev.filter((survey) => survey.id !== id));
    notifications.show("Xóa khảo sát thành công!", {
      severity: "success",
      autoHideDuration: 3000,
    });
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
                  <TableCell align="center">Hành động</TableCell>
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
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(survey.id)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(survey.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
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
        </Card>
      </Box>
    </PageContainer>
  );
}


"use client";

import React, { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";

import { useOrganizationId } from "@/hooks/useOrganizationId";
import { useGetDepartmentsQuery } from "@/modules/department/operations/query";
import { useGetDepartmentRankingQuery } from "@/modules/gamification-ranking/operations/query";

const getRankIcon = (rank: number): string => {
  switch (rank) {
    case 1:
      return "👑"; // Crown for 1st place
    case 2:
      return "🥈"; // Silver medal for 2nd place
    case 3:
      return "🌟"; // Star for 3rd place
    default:
      return "";
  }
};

const LeaderboardTab: React.FC = () => {
  const { organizationId } = useOrganizationId();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch departments for dropdown
  const { data: departmentsData, isLoading: isDepartmentsLoading } =
    useGetDepartmentsQuery(
      { organizationId: organizationId || "" },
      { enabled: !!organizationId }
    );

  // Fetch department ranking
  const {
    data: rankingData,
    isLoading: isRankingLoading,
    error: rankingError,
  } = useGetDepartmentRankingQuery(
    {
      departmentId: selectedDepartmentId,
      page: page + 1, // API uses 1-indexed pages
      limit: rowsPerPage,
    },
    { enabled: !!selectedDepartmentId }
  );

  // Set first department as default when departments load
  React.useEffect(() => {
    if (
      departmentsData?.data &&
      departmentsData.data.length > 0 &&
      !selectedDepartmentId
    ) {
      setSelectedDepartmentId(departmentsData?.data?.[0]?.id!);
    }
  }, [departmentsData, selectedDepartmentId]);

  const handleDepartmentChange = (event: SelectChangeEvent<string>) => {
    setSelectedDepartmentId(event.target.value);
    setPage(0); // Reset to first page when department changes
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isDepartmentsLoading) {
    return (
      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!departmentsData?.data || departmentsData.data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            Không có phòng ban nào. Vui lòng tạo phòng ban trước.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Header with title and department filter */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={3}
        >
          <Box flex={1} sx={{ maxWidth: 330 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Bảng xếp hạng
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Xếp hạng dựa trên % hoàn thành để đảm bảo công bằng giữa các học viên có chương trình học khác nhau
            </Typography>
          </Box>

          {/* Department Filter */}
          <FormControl sx={{ minWidth: 200, maxWidth: 330 }}>
            <Select
              value={selectedDepartmentId}
              onChange={handleDepartmentChange}
              displayEmpty
              size="small"
            >
              {departmentsData.data.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Loading State */}
        {isRankingLoading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="300px"
          >
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {rankingError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {rankingError instanceof Error
              ? rankingError.message
              : "Không thể tải bảng xếp hạng"}
          </Alert>
        )}

        {/* Ranking Table */}
        {!isRankingLoading && !rankingError && rankingData && (
          <>
            <TableContainer>
              <Table sx={{ tableLayout: "fixed" }}>
                <TableHead sx={{
                  backgroundColor: "grey.200"
                }}>
                  <TableRow>
                    <TableCell sx={{ width: "100px", minWidth: "100px" }}>Thứ hạng</TableCell>
                    <TableCell sx={{ width: "200px", minWidth: "200px" }}>Tên học viên</TableCell>
                    <TableCell sx={{ width: "250px", minWidth: "250px" }}>Email</TableCell>
                    <TableCell sx={{ width: "300px", minWidth: "300px" }}>Hoàn thành</TableCell>
                    <TableCell align="right" sx={{ width: "150px", minWidth: "150px" }}>Điểm</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rankingData.employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary" py={4}>
                          Không có dữ liệu xếp hạng
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rankingData.employees.map((employee) => (
                      <TableRow
                        key={employee.employeeId}
                        hover
                        sx={{
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        {/* Rank */}
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Typography variant="body2" fontWeight="medium">
                              #{employee.rank}
                            </Typography>
                            {getRankIcon(employee.rank) && (
                              <Typography variant="body2">
                                {getRankIcon(employee.rank)}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        {/* Name with Avatar */}
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Typography variant="body2">
                              {employee.fullName}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Email */}
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {employee.email}
                          </Typography>
                        </TableCell>

                        {/* Completion Progress */}
                        <TableCell>
                          <Box sx={{ position: "relative", width: "100%" }}>
                            <Box
                              sx={{
                                position: "relative",
                                height: 18,
                                borderRadius: "9px",
                                backgroundColor: "#BBDEFB",
                                overflow: "hidden",
                              }}
                            >
                              {/* Filled portion with dot for very low percentages */}
                              {employee.completionPercentage > 0 && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    height: "100%",
                                    width: `${Math.max(employee.completionPercentage, 0)}%`,
                                    minWidth: employee.completionPercentage > 0 && employee.completionPercentage < 3 ? "10px" : "0",
                                    backgroundColor: "#42A5F5",
                                    borderRadius: "9px",
                                    transition: "width 0.3s ease",
                                  }}
                                />
                              )}

                              {/* Percentage text */}
                              <Box
                                sx={{
                                  position: "absolute",
                                  left: 0,
                                  right: 0,
                                  top: 0,
                                  bottom: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  zIndex: 3,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "white",
                                    fontWeight: 500,
                                    fontSize: "0.7rem",
                                    textShadow: "0px 1px 2px rgba(0,0,0,0.2)",
                                  }}
                                >
                                  {employee.completionPercentage}%
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Points */}
                        <TableCell align="right">
                          <Typography variant="body2">
                            <strong>{employee.currentXp}/{employee.maxPossibleXp}</strong> điểm
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={rankingData.total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} trong tổng số ${count !== -1 ? count : `hơn ${to}`}`
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardTab;

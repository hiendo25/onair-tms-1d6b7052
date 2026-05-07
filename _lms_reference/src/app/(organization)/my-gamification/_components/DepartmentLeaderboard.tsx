"use client";

import React from "react";
import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import { useGetDepartmentRankingQuery } from "@/modules/gamification-ranking/operations/query";

interface DepartmentLeaderboardProps {
  departmentId: string;
  currentEmployeeId: string;
}

export default function DepartmentLeaderboard({
  departmentId,
  currentEmployeeId,
}: DepartmentLeaderboardProps) {
  const {
    data: rankingData,
    isLoading,
    error,
  } = useGetDepartmentRankingQuery(
    {
      departmentId,
      limit: 10,
    },
    {
      enabled: !!departmentId,
    }
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (!rankingData || rankingData.employees.length === 0) {
    return <Alert severity="info">Chưa có dữ liệu xếp hạng</Alert>;
  }

  const data = rankingData.employees;

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <Box className="border border-gray-200 rounded-lg shadow bg-white p-6">
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Bảng xếp hạng
      </Typography>

      <Box>
          {/* Top 3 */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              gap: { xs: 0.25, sm: 2, md: 3 },
              mb: 4,
              flexWrap: { xs: "wrap", md: "nowrap" },
            }}
          >
            {/* Rank 2 (index 1) */}
            {top3[1] && (
              <Box sx={{ textAlign: "center", order: 1 }}>
                <Typography variant="body2" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "0.625rem", sm: "1rem" }, mb: { xs: 0.25, sm: 1 } }}>
                  {2}
                </Typography>
                <Avatar
                  src={top3[1].avatar || undefined}
                  sx={{
                    width: { xs: 36, sm: 80 },
                    height: { xs: 36, sm: 80 },
                    mx: "auto",
                    mb: { xs: 0.25, sm: 1 },
                    border: top3[1].employeeId === currentEmployeeId ? "2px solid #2196F3" : "none",
                    fontSize: { xs: "0.875rem", sm: "1.25rem" },
                  }}
                >
                  {top3[1].fullName.charAt(0)}
                </Avatar>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    fontSize: { xs: "0.625rem", sm: "0.875rem" },
                    maxWidth: { xs: "60px", sm: "120px" },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {top3[1].fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.5rem", sm: "0.75rem" } }}>
                  {top3[1].currentXp} điểm
                </Typography>
              </Box>
            )}

            {/* Rank 1 (index 0) */}
            {top3[0] && (
              <Box sx={{ textAlign: "center", order: 2 }}>
                <Typography variant="body2" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "0.625rem", sm: "1rem" }, mb: { xs: 0.25, sm: 1 } }}>
                  {1}
                </Typography>
                <Box sx={{ fontSize: { xs: 16, sm: 32 } }}>👑</Box>
                <Avatar
                  src={top3[0].avatar || undefined}
                  sx={{
                    width: { xs: 48, sm: 100 },
                    height: { xs: 48, sm: 100 },
                    mx: "auto",
                    mb: { xs: 0.25, sm: 1 },
                    border: top3[0].employeeId === currentEmployeeId ? "2px solid #2196F3" : "none",
                    fontSize: { xs: "1rem", sm: "1.5rem" },
                  }}
                >
                  {top3[0].fullName.charAt(0)}
                </Avatar>
                <Typography
                  variant="body1"
                  fontWeight={700}
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "1rem" },
                    maxWidth: { xs: "70px", sm: "140px" },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {top3[0].fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.5rem", sm: "0.75rem" } }}>
                  {top3[0].currentXp} điểm
                </Typography>
              </Box>
            )}

            {/* Rank 3 (index 2) */}
            {top3[2] && (
              <Box sx={{ textAlign: "center", order: 3 }}>
                <Typography variant="body2" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "0.625rem", sm: "1rem" }, mb: { xs: 0.25, sm: 1 } }}>
                  {3}
                </Typography>
                <Avatar
                  src={top3[2].avatar || undefined}
                  sx={{
                    width: { xs: 36, sm: 80 },
                    height: { xs: 36, sm: 80 },
                    mx: "auto",
                    mb: { xs: 0.25, sm: 1 },
                    border: top3[2].employeeId === currentEmployeeId ? "2px solid #2196F3" : "none",
                    fontSize: { xs: "0.875rem", sm: "1.25rem" },
                  }}
                >
                  {top3[2].fullName.charAt(0)}
                </Avatar>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    fontSize: { xs: "0.625rem", sm: "0.875rem" },
                    maxWidth: { xs: "60px", sm: "120px" },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {top3[2].fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.5rem", sm: "0.75rem" } }}>
                  {top3[2].currentXp} điểm
                </Typography>
              </Box>
            )}
          </Box>

          {/* Rest of the list */}
          {rest.length > 0 && (
            <Box
              sx={{
                maxHeight: 400,
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  bgcolor: "#F3F4F6",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#D1D5DB",
                  borderRadius: "4px",
                },
              }}
            >
              <Stack spacing={1}>
                {rest.map((employee, index) => {
                  const isCurrentUser = employee.employeeId === currentEmployeeId;
                  const rank = index + 4; // Starts at 4 (index 0 of rest = position 4)

                  return (
                    <Box
                      key={employee.employeeId}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: isCurrentUser ? "#E3F2FD" : "transparent",
                        border: isCurrentUser ? "2px solid #2196F3" : "1px solid #E5E7EB",
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: isCurrentUser ? "#E3F2FD" : "#F9FAFB",
                        },
                      }}
                    >
                      {/* Rank */}
                      <Box sx={{ minWidth: 40, textAlign: "center" }}>
                        <Typography
                          variant="body1"
                          fontWeight={700}
                          color={isCurrentUser ? "primary" : "text.secondary"}
                        >
                          {rank}
                        </Typography>
                      </Box>

                      {/* Avatar */}
                      <Avatar
                        src={employee.avatar || undefined}
                        sx={{
                          width: 48,
                          height: 48,
                          border: isCurrentUser ? "2px solid #2196F3" : "none",
                        }}
                      >
                        {employee.fullName.charAt(0)}
                      </Avatar>

                      {/* Info */}
                      <Box flex={1}>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          color={isCurrentUser ? "primary" : "text.primary"}
                        >
                          {employee.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Phòng: {employee.departmentName}
                        </Typography>
                      </Box>

                      {/* XP */}
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={isCurrentUser ? "primary" : "text.secondary"}
                      >
                        {employee.currentXp} điểm
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}
      </Box>
    </Box>
  );
}

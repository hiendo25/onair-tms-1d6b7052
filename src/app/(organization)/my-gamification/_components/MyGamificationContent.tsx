"use client";

import React from "react";
import { Alert, Box, CircularProgress, Grid, Stack } from "@mui/material";

import { useGetEmployeeDepartmentIdQuery } from "@/modules/employees/operations/query";
import { useGetAllLevelsQuery, useGetMyGamificationXpQuery } from "@/modules/gamification-xp/operations/query";
import { useUserOrganization } from "@/modules/organization";

import DepartmentLeaderboard from "./DepartmentLeaderboard";
import LevelsSection from "./LevelsSection";
import XpProgressSection from "./XpProgressSection";

const MyGamificationContent: React.FC = () => {
  const { currentEmployee } = useUserOrganization((state) => state);

  // Fetch gamification XP data using React Query
  const {
    data: xpData,
    isLoading: isXpLoading,
    error: xpError,
  } = useGetMyGamificationXpQuery({
    enabled: !!currentEmployee?.id,
  });

  // Fetch all levels for the organization
  const {
    data: allLevels,
    isLoading: isLevelsLoading,
  } = useGetAllLevelsQuery(currentEmployee?.organization?.id ?? "", {
    enabled: !!currentEmployee?.organization?.id,
  });

  // Fetch employee department ID using React Query
  const {
    data: departmentId,
    isLoading: isDepartmentLoading,
  } = useGetEmployeeDepartmentIdQuery(currentEmployee?.id ?? "", {
    enabled: !!currentEmployee?.id,
  });

  if (isXpLoading || isDepartmentLoading || isLevelsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (xpError) {
    return <Alert severity="error">{xpError.message}</Alert>;
  }

  if (!xpData) {
    return <Alert severity="info">Không có dữ liệu gamification</Alert>;
  }

  return (
    <Grid container spacing={3}>
      {/* Left Column */}
      <Grid size={{ xs: 12, lg: 7 }}>
        <Stack spacing={3}>
          {/* XP Progress Section */}
          <XpProgressSection currentXp={xpData.currentXp} nextLevel={xpData.nextLevel} />

          {/* Levels Section */}
          <LevelsSection
            currentLevel={xpData.currentLevel}
            nextLevel={xpData.nextLevel}
            allLevels={allLevels}
            currentXp={xpData.currentXp}
          />
        </Stack>
      </Grid>

      {/* Right Column - Leaderboard */}
      <Grid size={{ xs: 12, lg: 5 }}>
        {departmentId && currentEmployee?.id ? (
          <DepartmentLeaderboard
            departmentId={departmentId}
            currentEmployeeId={currentEmployee.id}
          />
        ) : (
          <Alert severity="info">
            Bạn chưa được phân vào phòng ban nào. Hãy liên hệ quản trị viên để xem bảng xếp
            hạng.
          </Alert>
        )}
      </Grid>
    </Grid>
  );
};

export default MyGamificationContent;

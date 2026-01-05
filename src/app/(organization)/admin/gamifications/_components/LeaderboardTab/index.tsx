"use client";

import React from "react";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import { Box, Card, CardContent, Typography } from "@mui/material";

const LeaderboardTab: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <LeaderboardIcon color="primary" />
          <Typography variant="h6" component="h2">
            Bảng xếp hạng phòng ban
          </Typography>
        </Box>

        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="300px"
          sx={{
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
            backgroundColor: "action.hover",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Chức năng đang được phát triển
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LeaderboardTab;

"use client";

import * as React from "react";
import { Box, Grid, Stack } from "@mui/material";
import { Metadata } from "next";

import ChannelParticipationCard from "./ChannelParticipationCard";
import CompletionRateCard from "./CompletionRateCard";
import CourseRankingList from "./CourseRankingList";
import CourseTable from "./CourseTable";
import DashboardCalendarSidebar from "./DashboardCalendarSidebar";
import ParticipationRateCard from "./ParticipationRateCard";
import SummaryCardsGrid from "./SummaryCardsGrid";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Quản lý doanh nghiệp",
};

const DashboardSection = () => (
  <Stack spacing={3}>
    <SummaryCardsGrid />

    <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems="stretch">
      <Box sx={{ flex: { xs: "1 1 100%", lg: "1 1 70%" }, minWidth: 0 }}>
        <CourseTable />
      </Box>
      <Box
        sx={{
          flex: { xs: "1 1 100%", lg: "0 0 30%" },
          minWidth: { lg: 320 },
          maxWidth: { lg: 380 },
          width: "100%",
        }}
      >
        <DashboardCalendarSidebar />
      </Box>
    </Stack>

    <Grid container spacing={2} columns={12}>
      <Grid size={{ xs: 12, lg: 6 }}>
        <ChannelParticipationCard />
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <CompletionRateCard />
      </Grid>
    </Grid>

    <Grid container spacing={2} columns={12}>
      <Grid size={{ xs: 12, lg: 6 }}>
        <CourseRankingList variant="top" />
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <CourseRankingList variant="low" />
      </Grid>
    </Grid>
  </Stack>
);

export default DashboardSection;

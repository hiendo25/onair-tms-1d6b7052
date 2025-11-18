import * as React from "react";
import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import PlayCircleFilledRounded from "@mui/icons-material/PlayCircleFilledRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";

import { summaryCards } from "./mock/dashboardData";
import { panelSx } from "./mock/panelSx";

const summaryCardIcons: Record<(typeof summaryCards)[number]["icon"], React.ReactNode> = {
  "in-progress": <SchoolRounded fontSize="medium" />,
  upcoming: <PlayCircleFilledRounded fontSize="medium" />,
  expiring: <AccessTimeRounded fontSize="medium" />,
  completed: <EmojiEventsRounded fontSize="medium" />,
};

type SummaryCardProps = {
  title: string;
  value: string;
  icon: (typeof summaryCards)[number]["icon"];
  colors: { bg: string; icon: string };
};

const SummaryCard = ({ title, value, icon, colors }: SummaryCardProps) => (
  <Paper sx={{ ...panelSx, bgcolor: colors.bg, p: 2.5 }}>
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: "#fff",
          color: colors.icon,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        }}
      >
        {summaryCardIcons[icon]}
      </Box>
      <Stack spacing={0.5}>
        <Typography
          variant="body2"
          color="text.secondary"
          className="text-sm font-normal text-[#2E3135]"
        >
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800}>
          {value}
        </Typography>
      </Stack>
    </Stack>
  </Paper>
);

const SummaryCardsGrid = () => (
  <Grid container spacing={2} columns={12}>
    {summaryCards.map((card) => (
      <Grid key={card.title} size={{ xs: 12, sm: 6, lg: 3 }}>
        <SummaryCard {...card} />
      </Grid>
    ))}
  </Grid>
);

export default SummaryCardsGrid;

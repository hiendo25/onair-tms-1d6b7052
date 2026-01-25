"use client";

import * as React from "react";
import ListAltIcon from "@mui/icons-material/ListAlt";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

interface PlanStatisticsProps {
  programsCount?: number;
  topicsCount?: number;
  coursesCount?: number;
  instructorsCount?: number;
}

interface StatItemProps {
  icon: typeof SchoolIcon;
  label: string;
  value: number;
  color: string;
}

const iconStyle = {
  programs: { bg: "#e8f5e9" },
  topics: { bg: "#e3f2fd" },
  courses: { bg: "#fff3e0" },
  instructors: { bg: "#fce4ec" },
};

function StatItem({ icon: Icon, label, value, color }: StatItemProps) {
  return (
    <Box
      sx={{
        p: 2.25,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "white",
        display: "flex",
        gap: 1.5,
        alignItems: "center",
        boxShadow: "0 12px 32px rgba(0,0,0,0.06)",
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: color,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Icon sx={{ color: "text.primary" }} />
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default function PlanStatistics({
  programsCount,
  topicsCount,
  coursesCount,
  instructorsCount,
}: PlanStatisticsProps) {
  const stats = [
    {
      icon: ListAltIcon,
      label: "Chương trình",
      value: programsCount ?? 0,
      color: iconStyle.programs.bg,
    },
    {
      icon: SchoolIcon,
      label: "Chủ đề",
      value: topicsCount ?? 0,
      color: iconStyle.topics.bg,
    },
    // {
    //   icon: MenuBookIcon,
    //   label: "Môn học",
    //   value: coursesCount ?? 0,
    //   color: iconStyle.courses.bg,
    // },
    {
      icon: PeopleIcon,
      label: "Giảng viên",
      value: instructorsCount ?? 0,
      color: iconStyle.instructors.bg,
    },
  ];

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
        background: "linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Tổng quan triển khai
        </Typography>
        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(auto-fit, minmax(180px, 1fr))" },
            gap: 2,
          }}
        >
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

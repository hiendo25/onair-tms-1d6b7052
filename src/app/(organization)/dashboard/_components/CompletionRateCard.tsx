import * as React from "react";
import { Paper, Stack, Typography, Box } from "@mui/material";

import PureClient from "@/shared/ui/PureClient";
import ApexChart from "./ApexChart";
import { panelSx } from "./mock/panelSx";
import TimeRangeSwitcher from "./TimeRangeSwitcher";
import { TimeRange, completionRateByRange } from "./mock/dashboardData";

type LegendItemProps = {
  color: string;
  label: string;
  count: number;
  percent: number;
};

const LegendItem = ({ color, label, count, percent }: LegendItemProps) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    <Box
      sx={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        bgcolor: color,
        border: "2px solid #fff",
        boxShadow: "0 0 0 1px #e2e8f0",
      }}
    />
    <Stack sx={{ flex: 1 }}>
      <Typography variant="body2" color="text.primary" fontWeight={600}>
        {label}
      </Typography>
    </Stack>
    <Stack spacing={0.25} direction={"row"} gap={1}>
      <Typography variant="caption" color="text.secondary">
        {count} Học viên
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {percent}%
      </Typography>
    </Stack>
  </Stack>
);

const CompletionRateCard = () => {
  const [range, setRange] = React.useState<TimeRange>("week");
  const { completed, total } = completionRateByRange[range];
  const completionPercent = Math.round((completed / total) * 100);
  const remainingCount = Math.max(total - completed, 0);
  const remainingPercent = Math.max(100 - completionPercent, 0);

  const completionOptions = React.useMemo(
    () => ({
      labels: ["Hoàn thành", "Chưa hoàn thành"],
      colors: ["#0f5bd2", "#e2e8f0"],
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: "78%",
            labels: {
              show: true,
              name: { show: false },
              value: { show: false },
              total: {
                show: true,
                label: "Tỷ lệ hoàn thành",
                fontSize: "13px",
                fontWeight: 600,
                color: "#475569",
                formatter: () => `${completionPercent}%`,
              },
            },
          },
        },
      },
      legend: { show: false },
      stroke: { width: 4 },
      tooltip: {
        y: { formatter: (val: number) => `${val} Học viên` },
        theme: "light",
      },
    }),
    [completionPercent],
  );
  const series = React.useMemo(() => [completed, remainingCount], [completed, remainingCount]);

  return (
    <Paper sx={{ ...panelSx, p: 2.5, height: "100%" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Tỷ lệ hoàn thành lớp học
        </Typography>
        <TimeRangeSwitcher value={range} onChange={setRange} />
      </Stack>
      <Stack
        sx={{ mt: 1 }}
      >
        <Box
          sx={{
            flex: 1,
            width: "100%",
            maxWidth: 300,
            mx: "auto",
            position: "relative",
          }}
        >
          <PureClient>
            <ApexChart type="donut" height={260} series={series} options={completionOptions} />
          </PureClient>
          <Stack
            spacing={0.25}
            alignItems="center"
            justifyContent="center"
            sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            <Typography variant="body2" color="text.secondary">
              Tổng số học viên
            </Typography>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              {total.toLocaleString("vi-VN")}
            </Typography>
          </Stack>
        </Box>
        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1, justifyContent: "center" }}>
          <LegendItem
            color="#0f5bd2"
            label="Số học viên hoàn thành lớp học"
            count={completed}
            percent={completionPercent}
          />
          <LegendItem
            color="#94a3b8"
            label="Số học viên chưa hoàn thành lớp học"
            count={remainingCount}
            percent={remainingPercent}
          />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default CompletionRateCard;

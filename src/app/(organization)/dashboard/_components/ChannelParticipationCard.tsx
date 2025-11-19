import * as React from "react";
import { Avatar, Box, Paper, Stack, Typography } from "@mui/material";

import PureClient from "@/shared/ui/PureClient";
import ApexChart from "./ApexChart";
import { panelSx } from "./mock/panelSx";
import TimeRangeSwitcher from "./TimeRangeSwitcher";
import { TimeRange, channelParticipationByRange } from "./mock/dashboardData";

const participantOwners = [
  { label: "Y", color: "#f43f5e" },
  { label: "O", color: "#0ea5e9" },
  { label: "D", color: "#6366f1" },
];
const rangeLabel: Record<TimeRange, string> = { week: "tuần", month: "tháng", year: "năm" };

const ChannelParticipationCard = () => {
  const [range, setRange] = React.useState<TimeRange>("week");
  const data = React.useMemo(() => channelParticipationByRange[range], [range]);
  const channelParticipationOptions = React.useMemo(
    () => ({
      colors: ["#99B9FF", "#0050FF", "#0038B2"],
      chart: {
        background: "transparent",
        toolbar: { show: false },
      },
      fill: {
        type: "gradient",
        gradient: {
          type: "vertical",
          shadeIntensity: 0.3,
          opacityFrom: 0.9,
          opacityTo: 1,
          stops: [0, 100],
        },
      },
      plotOptions: {
        bar: { borderRadius: 14, columnWidth: "45%", distributed: true, dataLabels: { position: "top" } },
      },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 4, borderColor: "#e2e8f0" },
      xaxis: {
        categories: data.map((item) => item.label),
        labels: {
          style: {
            colors: data.map(() => "#94a3b8"),
            fontWeight: 600,
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => `${val}%`,
          style: { colors: "#94a3b8" },
        },
        max: 100,
        min: 0,
      },
      tooltip: { y: { formatter: (val: number) => `${val}%` }, theme: "light" },
    }),
    [data],
  );
  const series = React.useMemo(
    () => [
      {
        name: "Tỷ lệ tham gia",
        data: data.map((item) => item.value),
      },
    ],
    [data],
  );

  return (
    <Paper sx={{ ...panelSx, p: 2.5, height: "100%" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Tỷ lệ tham gia lớp học
        </Typography>
        <TimeRangeSwitcher value={range} onChange={setRange} />
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        sx={{ mb: 2, px: 0.5 }}
      >
        <Typography variant="body2" color="text.secondary">
          Cập nhật theo {rangeLabel[range]}
        </Typography>
      </Stack>
      <PureClient>
        <ApexChart type="bar" height={280} series={series} options={channelParticipationOptions} />
      </PureClient>
    </Paper>
  );
};

export default ChannelParticipationCard;

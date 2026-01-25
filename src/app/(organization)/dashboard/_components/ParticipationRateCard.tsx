import * as React from "react";
import { Paper, Stack, Typography } from "@mui/material";

import PureClient from "@/shared/ui/PureClient";

import ApexChart from "./ApexChart";
import { participationRateByRange, TimeRange } from "./mock/dashboardData";
import { panelSx } from "./mock/panelSx";
import TimeRangeSwitcher from "./TimeRangeSwitcher";

const ParticipationRateCard = () => {
  const [range, setRange] = React.useState<TimeRange>("week");
  const data = React.useMemo(() => participationRateByRange[range], [range]);
  const participationOptions = React.useMemo(
    () => ({
      chart: { sparkline: { enabled: false } },
      colors: ["#0b51ed"],
      plotOptions: {
        bar: { columnWidth: "45%", borderRadius: 10 },
      },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 4, borderColor: "#e2e8f0" },
      xaxis: {
        categories: data.map((item) => item.label),
        labels: { style: { colors: "#94a3b8", fontWeight: 600 } },
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
      tooltip: {
        y: { formatter: (val: number) => `${val}%` },
        theme: "light",
      },
      fill: { colors: ["#0b51ed"] },
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
      <PureClient>
        <ApexChart type="bar" height={320} series={series} options={participationOptions} />
      </PureClient>
    </Paper>
  );
};

export default ParticipationRateCard;

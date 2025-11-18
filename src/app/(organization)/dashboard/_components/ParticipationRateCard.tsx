import * as React from "react";
import { Paper, Typography } from "@mui/material";

import PureClient from "@/shared/ui/PureClient";
import ApexChart from "./ApexChart";
import { panelSx } from "./mock/panelSx";

const ParticipationRateCard = () => {
  const participationOptions = React.useMemo(
    () => ({
      chart: { sparkline: { enabled: false } },
      colors: ["#0050FF"],
      plotOptions: {
        bar: { columnWidth: "42%", borderRadius: 6 },
      },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 4, borderColor: "#e2e8f0" },
      xaxis: {
        categories: [
          "Môn học 1",
          "Môn học 2",
          "Môn học 3",
          "Môn học 4",
          "Môn học 5",
          "Môn học 6",
          "Môn học 7",
        ],
        labels: { style: { colors: "#94a3b8", fontWeight: 600 } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => `${val}%`,
          style: { colors: "#94a3b8" },
        },
      },
      tooltip: {
        y: { formatter: (val: number) => `${val}%` },
        theme: "light",
      },
      fill: {
        colors: [
          ({ dataPointIndex }: { dataPointIndex: number }) =>
            dataPointIndex === 2 ? "#99B9FF" : "#0050FF",
        ],
      },
    }),
    [],
  );

  return (
    <Paper sx={{ ...panelSx, p: 2.5, height: "100%" }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        Tỷ lệ tham gia
      </Typography>
      <PureClient>
        <ApexChart
          type="bar"
          height={320}
          series={[
            {
              name: "Tỷ lệ tham gia",
              data: [78, 76, 60, 85, 79, 83, 76],
            },
          ]}
          options={participationOptions}
        />
      </PureClient>
    </Paper>
  );
};

export default ParticipationRateCard;

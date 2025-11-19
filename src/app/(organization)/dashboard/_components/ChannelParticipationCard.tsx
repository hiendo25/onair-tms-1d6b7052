import * as React from "react";
import { Paper, Typography } from "@mui/material";

import PureClient from "@/shared/ui/PureClient";
import ApexChart from "./ApexChart";
import { panelSx } from "./mock/panelSx";

const ChannelParticipationCard = () => {
  const channelParticipationOptions = React.useMemo(
    () => ({
      colors: ["#86a8ff", "#2563eb", "#0b51ed"],
      plotOptions: {
        bar: { borderRadius: 10, columnWidth: "45%", distributed: true },
      },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 4, borderColor: "#e2e8f0" },
      xaxis: {
        categories: ["Online", "Offline", "eLearning"],
        labels: {
          style: {
            colors: ["#94a3b8", "#94a3b8", "#94a3b8"],
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
      },
      tooltip: { y: { formatter: (val: number) => `${val}%` }, theme: "light" },
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
          height={280}
          series={[
            {
              name: "Tỷ lệ tham gia",
              data: [68, 52, 86],
            },
          ]}
          options={channelParticipationOptions}
        />
      </PureClient>
    </Paper>
  );
};

export default ChannelParticipationCard;

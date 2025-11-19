import * as React from "react";
import { Paper, Stack, Typography, Box } from "@mui/material";

import PureClient from "@/shared/ui/PureClient";
import ApexChart from "./ApexChart";
import { panelSx } from "./mock/panelSx";

type LegendItemProps = {
  color: string;
  label: string;
  value: string;
};

const LegendItem = ({ color, label, value }: LegendItemProps) => (
  <Stack direction="row" spacing={1} alignItems="center">
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
    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={700}>
      {value}
    </Typography>
  </Stack>
);

const CompletionRateCard = () => {
  const completionOptions = React.useMemo(
    () => ({
      labels: ["Hoàn thành", "Còn lại"],
      colors: ["#0f5bd2", "#e2e8f0"],
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: "78%",
            labels: {
              show: true,
              name: { show: false },
              value: {
                formatter: (val: number) => `${val}%`,
                fontSize: "20px",
                fontWeight: 800,
              },
              total: {
                show: true,
                label: "Tỉ lệ hoàn thành",
                fontSize: "13px",
                fontWeight: 600,
                color: "#475569",
                formatter: () => "78%",
              },
            },
          },
        },
      },
      legend: { show: false },
      stroke: { width: 4 },
      tooltip: {
        y: { formatter: (val: number) => `${val}%` },
        theme: "light",
      },
    }),
    [],
  );

  return (
    <Paper sx={{ ...panelSx, p: 2.5, height: "100%" }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        Tỷ lệ hoàn thành
      </Typography>
      <PureClient>
        <ApexChart type="donut" height={300} series={[78, 22]} options={completionOptions} />
      </PureClient>
      <Stack spacing={1.25} sx={{ mt: 1 }}>
        <LegendItem color="#0f5bd2" label="Tổng số lớp học hoàn thành" value="78 Lớp | 78%" />
        <LegendItem color="#e2e8f0" label="Tổng số lớp học" value="100 Lớp | 100%" />
      </Stack>
    </Paper>
  );
};

export default CompletionRateCard;

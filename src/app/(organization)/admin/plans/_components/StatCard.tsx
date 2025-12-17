import { Box, Typography } from "@mui/material";

import { getTone, StatTone } from "../helper";

interface StatCardProps {
  label: string;
  value: number;
  helper: string;
  tone?: StatTone;
}

function StatCard({ label, value, helper, tone = "default" }: StatCardProps) {
  const toneColor = getTone(tone);

  return (
    <Box
      sx={{
        p: 2.25,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: toneColor.bg,
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: toneColor.text, lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {helper}
      </Typography>
    </Box>
  );
}

export default StatCard
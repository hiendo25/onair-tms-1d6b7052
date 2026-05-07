import React, { memo } from "react";
import { Box, Card, Stack, Typography } from "@mui/material";

interface AssignmentBankSummaryCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBackground: string;
}

const AssignmentBankSummaryCard = ({
  label,
  value,
  icon,
  iconBackground,
}: AssignmentBankSummaryCardProps) => {
  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        boxShadow: "none",
        height: "100%",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            backgroundColor: iconBackground,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            {value}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
};

export default memo(AssignmentBankSummaryCard);

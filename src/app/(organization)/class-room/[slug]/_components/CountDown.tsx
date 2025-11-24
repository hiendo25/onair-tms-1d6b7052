"use client";

import React, { memo } from "react";

import { useCountdownDate } from "@/hooks/useCountdown";
import { NoSsr, Stack, Typography } from "@mui/material";
import { ClockIcon } from "@mui/x-date-pickers";
import dayjs from "dayjs";

interface PropTypes {
  startDate: Date | string;
  disabled?: boolean;
}

const CountDown: React.FC<PropTypes> = ({ startDate, disabled = false }) => {
  const countdownDate = useCountdownDate(new Date(dayjs(startDate).format()));

  return (
    <NoSsr>
      <Stack
        gap={0.5}
        display="flex"
        alignItems="center"
        sx={{ textAlign: "center", typography: "body2" }}
        bgcolor={disabled ? "action.disabled" : "warning.main"}
        color="text.primary"
        px={1}
        py={0.5}
        borderRadius="100px"
        direction="row"
      >
        <ClockIcon style={{ width: 16, height: 16 }} />
        {parseInt(countdownDate.days, 10) > 0 && <Typography variant="caption">{countdownDate.days} ngày</Typography>}
        <Typography variant="caption" width={130}>
          {countdownDate.hours} giờ {countdownDate.minutes} phút {countdownDate.seconds} giây
        </Typography>
      </Stack>
    </NoSsr>
  );
};

export default memo(CountDown);

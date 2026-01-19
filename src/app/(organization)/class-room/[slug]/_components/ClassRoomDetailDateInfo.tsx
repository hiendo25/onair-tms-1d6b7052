import { CalendarMonthOutlined } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";

import { FORMAT_DATE_LABEL_WITHOUT_YEAR, FORMAT_TIME } from "@/lib";
import { CLASSROOM_DETAIL_TEXT } from "../_constants";
import { formatWeeklyScheduleLabel, WeeklyScheduleLike } from "../_utils/classRoomSchedule.utils";

import ClassRoomMiniBox from "./ClassRoomMiniBox";

const MiniBoxDate = ({ startDate }: { startDate?: Date | string }) => {
  const formattedDate = startDate ? dayjs(startDate) : null;
  const month = formattedDate ? formattedDate.format("MM") : "--";
  const day = formattedDate ? formattedDate.format("DD") : "--";
  return (
    <Stack width={40} height={40}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height={18}
        bgcolor="text.secondary"
        borderRadius="8px 8px 0 0"
      >
        <Typography color="white" fontWeight={600} variant="caption" fontSize={10}>
          Thg {month}
        </Typography>
      </Box>
      <Box border="0.765px solid #DCE3E8" borderRadius="0 0 8px 8px">
        <Typography fontWeight={800} color="text.secondary" variant="body2" align="center">
          {day}
        </Typography>
      </Box>
    </Stack>
  );
};

interface ClassRoomDetailDateInfoProps {
  startDate?: Date | string;
  endDate?: Date | string;
  weeklySchedule?: WeeklyScheduleLike | null | unknown;
  isFromLearningPath?: boolean;
}

const ClassRoomDetailDateInfo = ({
  startDate,
  endDate,
  weeklySchedule,
  isFromLearningPath,
}: ClassRoomDetailDateInfoProps) => {
  if (isFromLearningPath) {
    const weeklyLabel = formatWeeklyScheduleLabel(weeklySchedule);
    return (
      <Stack spacing={2} alignItems="center" direction="row">
        <ClassRoomMiniBox>
          <CalendarMonthOutlined fontSize="small" />
        </ClassRoomMiniBox>
        <Stack spacing={0.4}>
          {weeklyLabel ? (
            <>
              <Typography variant="subtitle2" textTransform="capitalize">
                {weeklyLabel}
              </Typography>
              <Typography color="text.secondary" variant="body2" fontWeight={500}>
                {CLASSROOM_DETAIL_TEXT.WEEKLY_LABEL}
              </Typography>
            </>
          ) : (
            <Typography color="text.secondary" fontWeight={400} variant="subtitle2">
              {CLASSROOM_DETAIL_TEXT.SCHEDULE_FALLBACK}
            </Typography>
          )}
        </Stack>
      </Stack>
    );
  }

  const filledDate = Boolean(startDate && endDate);
  const startValue = startDate ? dayjs(startDate) : null;
  const endValue = endDate ? dayjs(endDate) : null;
  const isSameDay = filledDate ? startValue?.isSame(endValue, "day") : false;
  const isSameYear = filledDate ? startValue?.isSame(endValue, "year") : false;

  return (
    <Stack spacing={2} alignItems="center" direction="row">
      <MiniBoxDate startDate={startDate} />
      <Stack spacing={0.4}>
        {filledDate ? (
          <>
            {isSameDay ? (
              <Stack>
                <Typography variant="subtitle2" textTransform="capitalize">
                  {startValue?.format(FORMAT_DATE_LABEL_WITHOUT_YEAR)}
                </Typography>

                <Typography color="text.secondary" variant="body2" fontWeight={500}>
                  {startValue?.format(FORMAT_TIME)} - {endValue?.format(FORMAT_TIME)}
                </Typography>
              </Stack>
            ) : (
              <Stack direction="row" spacing={0.5}>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" textTransform="capitalize">
                    {startValue?.format(`${FORMAT_DATE_LABEL_WITHOUT_YEAR}${!isSameYear ? ", YYYY" : ""}`)}
                  </Typography>

                  <Typography color="text.secondary" variant="body2" fontWeight={500}>
                    {startValue?.format(FORMAT_TIME)}
                  </Typography>
                </Stack>
                <Typography variant="subtitle2" fontWeight={600}>
                  -
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" textTransform="capitalize" fontWeight={600}>
                    {endValue?.format(`${FORMAT_DATE_LABEL_WITHOUT_YEAR}${!isSameYear ? ", YYYY" : ""}`)}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" fontWeight={500}>
                    {endValue?.format("HH:mm")}
                  </Typography>
                </Stack>
              </Stack>
            )}
          </>
        ) : (
          <Typography color="text.secondary" fontWeight={400} variant="subtitle2">
            {CLASSROOM_DETAIL_TEXT.EMPTY_INFO}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default ClassRoomDetailDateInfo;

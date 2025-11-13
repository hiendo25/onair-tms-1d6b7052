import React, { useMemo } from "react";

import { Avatar, Box, Stack, Typography } from "@mui/material";

import { FORMAT_DATE_LABEL_WITHOUT_YEAR, FORMAT_TIME } from "@/lib";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { VideoCameraRecordFillIcon } from "@/shared/assets/icons";
import MicrophoneIcon from "@/shared/assets/icons/MicrophoneIcon";
import dayjs from "dayjs";
import { ROOM_PROVIDERS } from "../_constants";

export enum ClassroomMiniBoxType {
  DATE = "DATE",
  ROOM = "ROOM",
  HOST = "HOST",
  LOCATION = "LOCATION",
}

interface ClassroomMiniBoxProps {
  data: GetClassRoomBySlugResponse["data"];
}

const MiniBox = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height={40}
      width={40}
      border="0.765px solid #DCE3E8"
      borderRadius="8px"
    >
      {children}
    </Box>
  );
};

const MiniBoxDate = ({ startDate }: { startDate: Date | string }) => {
  const month = dayjs(startDate).format("MM");
  const day = dayjs(startDate).format("DD");
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
          Thg {startDate ? month : "--"}
        </Typography>
      </Box>
      <Box border="0.765px solid #DCE3E8" borderRadius="0 0 8px 8px">
        <Typography fontWeight={800} color="text.secondary" variant="body2" align="center">
          {startDate ? day : "--"}
        </Typography>
      </Box>
    </Stack>
  );
};

const DateDetail = ({ startDate, endDate }: { startDate?: Date | string; endDate?: Date | string }) => {
  const isSameDay = dayjs(startDate).isSame(endDate, "day");
  const isSameYear = dayjs(startDate).isSame(endDate, "year");

  const filledDate = startDate && endDate;

  return (
    <Stack spacing={2} alignItems="center" direction="row">
      <MiniBoxDate startDate={startDate!} />
      <Stack spacing={0.4}>
        {filledDate ? (
          <>
            {isSameDay ? (
              <Stack>
                <Typography variant="subtitle2" textTransform="capitalize">
                  {dayjs(startDate).format(FORMAT_DATE_LABEL_WITHOUT_YEAR)}
                </Typography>

                <Typography color="text.secondary" variant="body2" fontWeight={500}>
                  {dayjs(startDate).format(FORMAT_TIME)} - {dayjs(endDate).format(FORMAT_TIME)}
                </Typography>
              </Stack>
            ) : (
              <Stack direction="row" spacing={0.5}>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" textTransform="capitalize">
                    {dayjs(startDate).format(`${FORMAT_DATE_LABEL_WITHOUT_YEAR}${!isSameYear ? ", YYYY" : ""}`)}
                  </Typography>

                  <Typography color="text.secondary" variant="body2" fontWeight={500}>
                    {dayjs(startDate).format(FORMAT_TIME)}
                  </Typography>
                </Stack>
                <Typography variant="subtitle2" fontWeight={600}>
                  -
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" textTransform="capitalize" fontWeight={600}>
                    {dayjs(endDate).format(`${FORMAT_DATE_LABEL_WITHOUT_YEAR}${!isSameYear ? ", YYYY" : ""}`)}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" fontWeight={500}>
                    {dayjs(endDate).format("HH:mm")}
                  </Typography>
                </Stack>
              </Stack>
            )}
          </>
        ) : (
          <Typography color="text.secondary" fontWeight={400} variant="subtitle2">
            Chưa có thông tin
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export const ClassRoomDetailBox: React.FC<ClassroomMiniBoxProps> = ({ data }) => {
  const isSingle = data?.room_type === "single";

  const location = useMemo(() => {
    if (!isSingle) return null;

    const session = data?.sessions?.[0];

    return {
      isOnline: session?.is_online,
      location: session?.location,
      channel_provider: session?.channel_provider,
      channel_info: session?.channel_info,
    };
  }, [data?.sessions]);

  const lectures = useMemo(() => {
    return (
      data?.sessions
        .flatMap((session) => session.teachers)
        .map((teacher) => ({
          id: teacher.employee?.employee_code,
          fullName: teacher.employee?.profile?.full_name || "Unknown",
          avatar: teacher.employee?.profile?.avatar,
        })) || []
    ).filter((lecture, index, self) => index === self.findIndex((t) => t.id === lecture.id));
  }, [data?.sessions]);

  return (
    <Stack spacing={1.5}>
      <DateDetail startDate={data?.start_at || undefined} endDate={data?.end_at || undefined} />

      {isSingle && (
        <Stack spacing={1.5}>
          <Stack spacing={2} alignItems="center" direction="row">
            <MiniBox>
              <VideoCameraRecordFillIcon />
            </MiniBox>
            <Stack spacing={0.4}>
              <Typography variant="subtitle2" fontWeight={600}>
                {location?.isOnline ? "Nền tảng tổ chức lớp học" : "Địa chỉ"}
              </Typography>

              {location?.isOnline ? (
                <Stack alignItems="center" direction="row" spacing={0.5}>
                  {ROOM_PROVIDERS[(location?.channel_provider as any) || "zoom"]?.icon &&
                    React.createElement(ROOM_PROVIDERS[(location?.channel_provider as any) || "zoom"]?.icon!, {
                      width: 16,
                      height: 16,
                      style: { width: 16, height: 16 },
                    })}
                  <Typography color="text.secondary" variant="body2" fontWeight={500}>
                    Trực tiếp trên {ROOM_PROVIDERS[(location?.channel_provider as any) || "zoom"]?.label}
                  </Typography>
                </Stack>
              ) : (
                <Typography color="text.secondary" variant="body2" fontWeight={500}>
                  {location?.location || "Chưa có thông tin"}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>
      )}

      <Stack spacing={1.5}>
        <Stack spacing={2} alignItems="start" direction="row">
          <MiniBox>
            <MicrophoneIcon width={20} height={20} />
          </MiniBox>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Stack alignSelf="start">
              <Stack spacing={0.4}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Giảng viên
                </Typography>
                <Stack flexDirection="row" alignItems="center">
                  {lectures.length > 0 ? (
                    lectures.map((lecture, index) => (
                      <Stack
                        key={lecture.id || "" + index}
                        alignItems="center"
                        direction="row"
                        spacing={0.5}
                        className="no-underline"
                        ml={index !== 0 ? 0.5 : 0}
                      >
                        <Avatar
                          alt={lecture.fullName}
                          src={lecture.avatar || undefined}
                          sx={{
                            width: 16,
                            height: 16,
                          }}
                        />
                        <Typography color="text.secondary" variant="body2" fontWeight={500}>
                          {lecture.fullName}
                        </Typography>
                      </Stack>
                    ))
                  ) : (
                    <Typography color="text.secondary" variant="body2" fontWeight={500}>
                      Chưa có thông tin
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

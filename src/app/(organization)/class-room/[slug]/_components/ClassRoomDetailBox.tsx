import React, { useMemo } from "react";
import { Avatar, AvatarGroup, Stack, Tooltip, Typography } from "@mui/material";

import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { VideoCameraRecordFillIcon } from "@/shared/assets/icons";
import MicrophoneIcon from "@/shared/assets/icons/MicrophoneIcon";
import { CLASS_SESSION_TYPE, CLASSROOM_DETAIL_TEXT, ROOM_PROVIDERS } from "../_constants";

import ClassRoomDetailDateInfo from "./ClassRoomDetailDateInfo";
import ClassRoomMiniBox from "./ClassRoomMiniBox";

interface ClassRoomDetailBoxProps {
  data: GetClassRoomBySlugResponse["data"];
  isFromLearningPath?: boolean;
}

export const ClassRoomDetailBox: React.FC<ClassRoomDetailBoxProps> = ({ data, isFromLearningPath }) => {
  const isSingle = data?.room_type === "single";
  const primarySession = data?.sessions?.[0];

  const location = useMemo(() => {
    if (!isSingle) return null;

    const session = primarySession;

    return {
      isOnline: session?.session_type !== CLASS_SESSION_TYPE.OFFLINE,
      location: session?.location,
      channel_provider: session?.channel_provider,
      channel_info: session?.channel_info,
    };
  }, [isSingle, primarySession]);

  const lectures = useMemo(() => {
    return (
      (data?.sessions ?? [])
        .flatMap((session) => session.courses_period ?? [])
        .flatMap((coursePeriod) => (coursePeriod.teacher ? [coursePeriod.teacher] : []))
        .map((teacher) => ({
          id: teacher?.employee_code,
          fullName: teacher?.profile?.full_name || "Unknown",
          avatar: teacher?.profile?.avatar,
        })) || []
    ).filter((lecture, index, self) => index === self.findIndex((t) => t.id === lecture.id));
  }, [data?.sessions]);

  return (
    <Stack spacing={1.5}>
      <ClassRoomDetailDateInfo
        startDate={data?.start_at || primarySession?.start_at || undefined}
        endDate={data?.end_at || primarySession?.end_at || undefined}
        weeklySchedule={primarySession?.weekly_schedule}
        isFromLearningPath={isFromLearningPath}
      />

      {isSingle && (
        <Stack spacing={1.5}>
          <Stack spacing={2} alignItems="center" direction="row">
            <ClassRoomMiniBox>
              <VideoCameraRecordFillIcon />
            </ClassRoomMiniBox>
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
                  {location?.location || CLASSROOM_DETAIL_TEXT.EMPTY_INFO}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>
      )}

      <Stack spacing={2} direction="row" alignItems="center">
        <ClassRoomMiniBox>
          <MicrophoneIcon width={20} height={20} />
        </ClassRoomMiniBox>
        <Stack direction="column" alignItems="start">
          <Typography variant="subtitle2" fontWeight={600}>
            Giảng viên
          </Typography>
          <AvatarGroup max={4}>
            {lectures.map((lecture) => (
              <Tooltip key={lecture.id} title={lecture.fullName}>
                <Avatar alt={lecture.fullName} src={lecture.avatar!} className="w-4 h-4" />
              </Tooltip>
            ))}
          </AvatarGroup>
        </Stack>
      </Stack>
    </Stack>
  );
};

"use client";

import React, { useMemo, useState } from "react";
import { Avatar, AvatarGroup, Box, Link, Stack, Tooltip, Typography } from "@mui/material";

import { useGetEmployeeCertificateByClassRoomQuery } from "@/modules/certificates/operations/query";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { VideoCameraRecordFillIcon } from "@/shared/assets/icons";
import DiplomaIcon from "@/shared/assets/icons/DiplomaIcon";
import MicrophoneIcon from "@/shared/assets/icons/MicrophoneIcon";
import { CLASS_SESSION_TYPE, CLASSROOM_DETAIL_TEXT, ROOM_PROVIDERS } from "../_constants";

import ClassRoomDetailDateInfo from "./ClassRoomDetailDateInfo";
import ClassRoomMiniBox from "./ClassRoomMiniBox";
import CertificateViewModal from "@/shared/ui/CertificateViewModal";

interface ClassRoomDetailBoxProps {
  data: GetClassRoomBySlugResponse["data"];
  isFromLearningPath?: boolean;
}

export const ClassRoomDetailBox: React.FC<ClassRoomDetailBoxProps> = ({ data, isFromLearningPath }) => {
  const isSingle = data?.room_type === "single";
  const primarySession = data?.sessions?.[0];
  const [showCertModal, setShowCertModal] = useState(false);
  const employeeId = useUserOrganization((state) => state.currentEmployee?.id);

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

  const certificate = data?.certificate?.[0];
  const certificateTemplate = certificate?.certificate_template;

  // Fetch employee certificate if exists
  const classRoomId = data?.id;
  const { data: employeeCertificate } = useGetEmployeeCertificateByClassRoomQuery(
    employeeId || "",
    classRoomId || "",
    {
      enabled: !!classRoomId && !!certificateTemplate && !!employeeId,
    }
  );

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

      {certificateTemplate && (
        <Stack spacing={2} direction="row" alignItems="center">
          <ClassRoomMiniBox>
            <DiplomaIcon />
          </ClassRoomMiniBox>
          <Stack spacing={0.4}>
            <Typography variant="subtitle2" fontWeight={600}>
              Chứng nhận
            </Typography>
            <Typography color="text.secondary" variant="body2" fontWeight={500}>
              {employeeCertificate ? (
                <>
                  <Box component="span">Bạn đã nhận được chứng nhận</Box>{" "}
                  <Box
                    component="span"
                    sx={{
                      color: "text.primary",
                    }}
                    fontWeight={600}
                  >
                    &#34;{certificateTemplate.name}&#34;
                  </Box>{" "}
                  <Link
                    onClick={() => setShowCertModal(true)}
                    sx={{
                      color: "primary.main",
                      ml: 0.5,
                      cursor: "pointer",
                    }}
                    underline="none"
                  >
                    Xem chứng nhận
                  </Link>
                </>
              ) : (
                <>
                  <Box component="span">Hoàn thành lớp học để nhận chứng nhận</Box>{" "}
                  <Box
                    component="span"
                    sx={{
                      color: "text.primary",
                    }}
                    fontWeight={600}
                  >
                    &#34;{certificateTemplate.name}&#34;
                  </Box>
                </>
              )}
            </Typography>
          </Stack>
        </Stack>
      )}

      {employeeCertificate && certificateTemplate && (
        <CertificateViewModal
          open={showCertModal}
          onClose={() => setShowCertModal(false)}
          certificateName={certificateTemplate.name}
          certificateImageUrl={employeeCertificate.image_url}
        />
      )}
    </Stack>
  );
};

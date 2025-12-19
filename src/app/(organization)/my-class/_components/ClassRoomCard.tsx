"use client";

import React, { useCallback, useState } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { fDateTime } from "@/lib";
import { ClassSessionType } from "@/model/class-session.model";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import QRScannerDialog from "@/modules/qr-attendance/components/QRScannerDialog";
import { ClassRoomTypeFilter } from "@/repository/class-room/type";
import { Image } from "@/shared/ui/Image";
import { ClassRoomPriorityDto, ClassRoomSessionDetailDto } from "@/types/dto/classRooms/classRoom.dto";

import EnterClassRoomsDialog from "./EnterClassRooms";

interface IClassRoomCard {
  start_at: string;
  end_at: string;
  title: string;
  participantCount: number;
  actionLabel: string;
  runtimeStatusColor: string;
  runtimeStatusLabel: string;
  sessionModeLabel: string;
  thumbnail: string;
  actionDisabled: boolean;
  slug?: string;
  classRoomId?: string;
  roomType?: ClassRoomTypeFilter;
  sessions?: ClassRoomPriorityDto["class_sessions"];
  sessionType: ClassSessionType;
  classRoomSlug: string;
}

const ClassRoomCard = ({
  actionLabel,
  end_at,
  participantCount,
  runtimeStatusColor,
  runtimeStatusLabel,
  sessionModeLabel,
  start_at,
  thumbnail,
  title,
  actionDisabled,
  slug,
  classRoomId,
  roomType = ClassRoomTypeFilter.Single,
  sessions = [],
  sessionType,
  classRoomSlug,
}: IClassRoomCard) => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();
  const employeeId = useUserOrganization((state) => state.currentEmployee.id);

  const navigateToSession = useCallback(
    (sessions: ClassRoomSessionDetailDto, sessionType?: ClassSessionType) => {
      if (!sessions || !slug) {
        return;
      }
      if (sessionType === "live") {
        router.push(`/class-room/cd/${slug}/${sessions.id}`);
      } else {
        router.push(`/class-room/${classRoomSlug}`);
      }
    },
    [classRoomSlug, router, slug],
  );

  const handleJoinClass = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      if (actionDisabled) {
        return;
      }

      if (sessionType === "live" || sessionType === "online") {
        if (roomType === ClassRoomTypeFilter.Multiple && sessionType === "live") {
          setDialogOpen(true);
          return;
        }

        if (sessions?.[0]?.id) {
          navigateToSession(sessions?.[0], sessions?.[0]?.session_type);
        }
      } else {
        if (roomType === ClassRoomTypeFilter.Multiple) {
          setDialogOpen(true);
          return;
        }
        if (roomType === ClassRoomTypeFilter.Single && sessions?.[0]?.id) {
          setSelectedSessionId(sessions[0].id);
        }
        setQrScannerOpen(true);
      }
    },
    [actionDisabled, navigateToSession, roomType, sessionType, sessions],
  );

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const handleSelectSession = useCallback(
    (session: ClassRoomSessionDetailDto) => {
      if (sessionType === "offline") {
        setDialogOpen(false);
        setSelectedSessionId(session.id);
        setQrScannerOpen(true);
        return;
      }
      setDialogOpen(false);
      navigateToSession(session, sessions?.[0]?.session_type);
    },
    [navigateToSession, sessionType, sessions],
  );

  return (
    <>
      <Link href={slug ? PATHS.CLASSROOMS.DETAIL_CLASSROOM(slug) : ""}>
        <Box className="rounded-lg border border-[#919EAB33] p-2 shadow cursor-pointer">
          <Image
            src={thumbnail}
            alt={title ?? "classroom"}
            ratio="16/9"
            loading="lazy"
            disabledEffect
            className="rounded-lg"
          />
          <Box px={1}>
            <Stack mt={2} direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography className="font-semibold text-[12px]" sx={{ color: runtimeStatusColor }}>
                  {runtimeStatusLabel}
                </Typography>
              </Box>
              <Chip label={sessionModeLabel} variant="outlined" color="primary" />
            </Stack>

            <Box mt={2}>
              <Typography className="font-semibold text-[14px] text-[#212B36] line-clamp-2 h-[42px]">
                {title ?? "Không có tiêu đề"}
              </Typography>
            </Box>

            <Divider className="my-4" />

            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon className="w-5" />
                <Typography className="font-normal text-[12px] text-[#212B36]">
                  {fDateTime(start_at)} - {fDateTime(end_at)}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                <GroupOutlinedIcon className="w-5" />
                <Typography className="font-normal text-[12px] text-[#212B36]">
                  <span className=" font-semibold">{participantCount}</span>{" "}
                  <span className="font-normal">Học viên</span>
                </Typography>
              </Stack>
            </Box>

            <Box mt={2} mb={1}>
              <Button
                size="large"
                variant="contained"
                color="primary"
                className="w-full"
                disabled={actionDisabled}
                onClick={handleJoinClass}
              >
                {actionLabel}
              </Button>
            </Box>
          </Box>
        </Box>
      </Link>
      <EnterClassRoomsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        sessions={sessions}
        thumbnail={thumbnail}
        classTitle={title}
        actionLabel={sessionType === "offline" ? "Quét mã QR" : undefined}
        onSelectSession={handleSelectSession}
      />
      <QRScannerDialog
        open={qrScannerOpen}
        onClose={() => {
          setQrScannerOpen(false);
          setSelectedSessionId(undefined);
        }}
        employeeId={employeeId}
        classRoomId={classRoomId}
        sessionId={selectedSessionId}
        classTitle={title}
      />
    </>
  );
};

export default ClassRoomCard;

"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Image } from "@/shared/ui/Image";
import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import { fDateTime } from "@/lib";
import EnterClassRoomsDialog from "./EnterClassRooms";
import { ClassRoomPriorityDto } from "@/types/dto/classRooms/classRoom.dto";
import { ClassRoomTypeFilter } from "../../admin/class-room/list/types/types";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import QRScannerDialog from "@/modules/qr-attendance/components/QRScannerDialog";
import { PATHS } from "@/constants/path.contstants";
import Link from "next/link";

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
  isOnline: boolean;
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
  isOnline,
}: IClassRoomCard) => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();
  const employeeId = useUserOrganization((state) => state.data.id);

  const navigateToSession = useCallback(
    (sessionId?: string) => {
      if (!sessionId || !slug) {
        return;
      }
      router.push(`/class-room/cd/${slug}/${sessionId}`);
    },
    [router, slug],
  );

  const handleJoinClass = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      if (actionDisabled) {
        return;
      }

      if (isOnline) {
        if (roomType === ClassRoomTypeFilter.Multiple) {
          setDialogOpen(true);
          return;
        }

        if (sessions?.[0]?.id) {
          navigateToSession(sessions?.[0]?.id);
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
    [actionDisabled, isOnline, navigateToSession, roomType, sessions],
  );

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      if (!isOnline) {
        setDialogOpen(false);
        setSelectedSessionId(sessionId);
        setQrScannerOpen(true);
        return;
      }
      setDialogOpen(false);
      navigateToSession(sessionId);
    },
    [isOnline, navigateToSession],
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
        actionLabel={!isOnline ? "Quét mã QR" : undefined}
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

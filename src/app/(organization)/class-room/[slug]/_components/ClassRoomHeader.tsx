"use client";
import { Box, Stack, Typography } from "@mui/material";

import { ClassRoomDetailWithProgress } from "@/services/class-room/class-room-progress-mapping.service";
import { Image } from "@/shared/ui/Image";

import { ClassRoomDetailBox } from "./ClassRoomDetailBox";
import ClassRoomJoin from "./ClassRoomJoin";
import ClassRoomProgressBar from "./ClassRoomProgressBar";

interface ClassRoomHeaderProps {
  data: ClassRoomDetailWithProgress;
  isAdminView?: boolean;
  isFromLearningPath?: boolean;
}

const HEADER_DETAIL_MAX_WIDTH = 760;
const JOIN_PANEL_WIDTH = 320;

const ClassRoomHeader = ({ data, isAdminView, isFromLearningPath }: ClassRoomHeaderProps) => {
  const shouldShowProgress = Boolean(isFromLearningPath);

  return (
    <Box>
      <Image
        src={data?.thumbnail_url}
        alt="banner"
        width="100%"
        height="auto"
        ratio="21/9"
        sx={{ borderRadius: { xs: 1, md: 3 } }}
      />
      <Box pt={{ xs: 2, md: 5 }} pb={{ xs: 0, md: 5 }}>
        <Box>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 3, md: 4 }}
            alignItems={{ xs: "stretch", md: "flex-start" }}
          >
            <Stack flex={1} minWidth={0}>
              <Stack spacing={3} maxWidth={HEADER_DETAIL_MAX_WIDTH} width="100%">
                <Typography component="h1" variant="h3" className="leading-9 text-[24px] md:leading-11 md:text-[36px]">
                  {data?.title}
                </Typography>
                {shouldShowProgress ? (
                  <ClassRoomProgressBar value={data.progress?.progressPercentage ?? 0} size="md" />
                ) : null}
                <ClassRoomDetailBox data={data} isFromLearningPath={isFromLearningPath} />
              </Stack>
            </Stack>
            <Box sx={{ width: { xs: "100%", md: JOIN_PANEL_WIDTH }, flexShrink: 0 }}>
              <ClassRoomJoin data={data} isAdminView={isAdminView} isFromLearningPath={isFromLearningPath} />
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default ClassRoomHeader;

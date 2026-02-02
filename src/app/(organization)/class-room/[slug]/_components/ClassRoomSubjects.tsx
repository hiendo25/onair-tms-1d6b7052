import { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";

import { ClassRoomDetailWithProgress } from "@/services/class-room/class-room-progress-mapping.service";
import { CLASSROOM_DETAIL_SECTION_TITLES } from "../_constants";

import { ClassRoomSubjectCard } from "./ClassRoomSubjectCard";

interface ClassRoomSubjectsProps {
  data: ClassRoomDetailWithProgress;
  isFromLearningPath?: boolean;
  isAdminView?: boolean;
}

export default function ClassRoomSubjects({
  data,
  isFromLearningPath,
  isAdminView,
}: ClassRoomSubjectsProps) {
  const coursePeriods = useMemo(() => {
    if (data.room_type !== "single") return [];

    return data.sessions?.[0]?.courses_period || [];
  }, [data.room_type, data.sessions]);

  if (coursePeriods.length === 0) return null;

  const classRoomSlug = data.slug ?? undefined;

  return (
    <Stack spacing={3}>
      <Typography
        component="h2"
        variant="h3"
        className="leading-9 text-[24px] md:leading-11 md:text-[26px]"
      >
        {CLASSROOM_DETAIL_SECTION_TITLES.SUBJECTS}
      </Typography>
      <Box
        sx={{
          overflowX: "auto",
          pb: 1,
        }}
      >
        <Stack direction="row" spacing={2}>
          {coursePeriods.map((coursePeriod) => (
            <ClassRoomSubjectCard
              key={coursePeriod.id}
              coursePeriod={coursePeriod}
              classRoomSlug={classRoomSlug}
              isFromLearningPath={isFromLearningPath}
              isAdminView={isAdminView}
              classRoomEndAt={data.end_at}
            />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

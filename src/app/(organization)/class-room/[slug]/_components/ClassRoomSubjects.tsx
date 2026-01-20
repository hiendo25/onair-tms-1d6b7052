import { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";

import { ClassRoomDetailWithProgress } from "@/services/class-room/class-room-progress-mapping.service";

import { ClassRoomSubjectCard } from "./ClassRoomSubjectCard";

interface ClassRoomSubjectsProps {
  data: ClassRoomDetailWithProgress;
  isFromLearningPath?: boolean;
}

export default function ClassRoomSubjects({ data, isFromLearningPath }: ClassRoomSubjectsProps) {
  const coursePeriods = useMemo(() => {
    if (data.room_type !== "single") return [];

    return data.sessions?.[0]?.courses_period || [];
  }, [data.room_type, data.sessions]);

  if (coursePeriods.length === 0) return null;

  const classRoomSlug = data.slug ?? undefined;

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography component="h1" variant="h3" className="leading-9 text-[24px] md:leading-11 md:text-[26px]">
          Môn học
        </Typography>
      </Stack>

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
              classRoomEndAt={data.end_at}
            />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

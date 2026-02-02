"use client";

import { Box, Stack } from "@mui/material";

import { ClassRoomDetailWithProgress } from "@/services/class-room/class-room-progress-mapping.service";
import { JOIN_HORIZONTAL_ZONE_CLASS } from "../_constants";

import ClassRoomExamSection from "./ClassRoomExamSection";
import ClassRoomGeneralInfoSection from "./ClassRoomGeneralInfoSection";
import ClassRoomJoinHorizontal from "./ClassRoomJoinHorizontal";
import ClassRoomSubjects from "./ClassRoomSubjects";

interface ClassRoomStudentSectionsProps {
  data: ClassRoomDetailWithProgress;
  isFromLearningPath: boolean;
  showJoinHorizontal: boolean;
}

export default function ClassRoomStudentSections({
  data,
  isFromLearningPath,
  showJoinHorizontal,
}: ClassRoomStudentSectionsProps) {
  return (
    <Stack spacing={4}>
      <ClassRoomSubjects data={data} isFromLearningPath={isFromLearningPath} />
      <ClassRoomExamSection data={data} enableNavigate />

      <Box className={`${JOIN_HORIZONTAL_ZONE_CLASS} invisible`} />

      {showJoinHorizontal && (
        <Box className="z-101 top-0 left-0 sticky w-full bg-white pt-3 pb-2">
          <ClassRoomJoinHorizontal data={data} isFromLearningPath={isFromLearningPath} />
        </Box>
      )}

      <ClassRoomGeneralInfoSection data={data} isFromLearningPath={isFromLearningPath} />
    </Stack>
  );
}

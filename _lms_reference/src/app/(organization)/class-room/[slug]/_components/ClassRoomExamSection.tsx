"use client";

import React, { useMemo, useState } from "react";
import { Box, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import type { ClassRoomDetailWithProgress } from "@/services/class-room/class-room-progress-mapping.service";
import EmptyData from "@/shared/ui/EmptyData";
import { CLASSROOM_DETAIL_SECTION_TITLES, CLASSROOM_DETAIL_TEXT } from "../_constants";
import { useClassRoomExams } from "../_hooks/useClassRoomExams";
import { useClassRoomExamSummary } from "../_hooks/useClassRoomExamSummary";
import { useClassRoomStudentAssignmentsStatus } from "../_hooks/useClassRoomStudentAssignmentsStatus";

import ClassRoomExamCard from "./ClassRoomExamCard";

interface ClassRoomExamSectionProps {
  data: ClassRoomDetailWithProgress;
  enableNavigate?: boolean;
  enableAdminNavigate?: boolean;
}

export default function ClassRoomExamSection({
  data,
  enableNavigate = false,
  enableAdminNavigate = false,
}: ClassRoomExamSectionProps) {
  const router = useRouter();
  const { id: employeeId } = useUserOrganization((state) => state.currentEmployee);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const exams = useClassRoomExams(data);
  const assignmentConfigIds = useMemo(() => exams.map((exam) => exam.assignmentConfigId), [exams]);
  const { data: examSummary } = useClassRoomExamSummary({
    classRoomId: data.id,
    assignmentConfigIds,
  });
  const { data: studentAssignmentsStatus } = useClassRoomStudentAssignmentsStatus({
    classRoomId: data.id,
    employeeId,
    assignmentConfigIds,
    enabled: enableNavigate,
  });
  const summaryMap = useMemo(
    () => new Map((examSummary?.assignments ?? []).map((item) => [item.assignmentConfigId, item])),
    [examSummary?.assignments],
  );
  const assignmentStatusMap = useMemo(
    () =>
      new Map(
        (studentAssignmentsStatus?.assignments ?? []).map((item) => [item.assignmentConfigId, item]),
      ),
    [studentAssignmentsStatus?.assignments],
  );
  const returnPath = data.slug ? `/class-room/${data.slug}` : null;
  const returnPathQuery = returnPath ? `?returnPath=${encodeURIComponent(returnPath)}` : "";
  const selectedAssignmentStatus = selectedAssignmentId
    ? assignmentStatusMap.get(selectedAssignmentId)
    : null;
  const canViewResult = selectedAssignmentStatus?.gradingStatus === "graded";

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, assignmentId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAssignmentId(assignmentId);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedAssignmentId(null);
  };

  const handleViewResult = () => {
    if (!selectedAssignmentId || !employeeId) {
      return;
    }
    router.push(
      PATHS.MY_ASSIGNMENTS.RESULT(selectedAssignmentId, employeeId) + returnPathQuery,
    );
    handleCloseMenu();
  };

  if (exams.length === 0) {
    return (
      <Stack spacing={3}>
        <Typography
          component="h2"
          variant="h3"
          className="leading-9 text-[24px] md:leading-11 md:text-[26px]"
        >
          {CLASSROOM_DETAIL_SECTION_TITLES.EXAMS}
        </Typography>

        <EmptyData
          title={CLASSROOM_DETAIL_TEXT.EXAMS_EMPTY_TITLE}
          description={CLASSROOM_DETAIL_TEXT.EXAMS_EMPTY_DESCRIPTION}
        />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography
        component="h2"
        variant="h3"
        className="leading-9 text-[24px] md:leading-11 md:text-[26px]"
      >
        {CLASSROOM_DETAIL_SECTION_TITLES.EXAMS}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(5, minmax(0, 1fr))",
          },
        }}
      >
        {exams.map((exam) => {
          const summary = summaryMap.get(exam.assignmentConfigId);
          const examWithSummary = {
            ...exam,
            passedCount: summary?.passedCount ?? exam.passedCount,
            failedCount: summary?.failedCount ?? exam.failedCount,
          };

          return (
            <ClassRoomExamCard
              key={exam.assignmentConfigId}
              exam={examWithSummary}
              hideResultStats={enableNavigate}
              onMenuClick={
                enableNavigate
                  ? (event) => handleOpenMenu(event, exam.assignmentConfigId)
                  : undefined
              }
              onClick={
                enableNavigate && employeeId
                  ? () => router.push(PATHS.MY_ASSIGNMENTS.SUBMIT(exam.assignmentConfigId, employeeId))
                  : enableAdminNavigate
                    ? () => router.push(PATHS.ASSIGNMENTS.DETAIL_ASSIGNMENT(exam.assignmentConfigId))
                    : undefined
              }
            />
          );
        })}
      </Box>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleViewResult} disabled={!canViewResult}>
          Xem kết quả
        </MenuItem>
      </Menu>
    </Stack>
  );
}

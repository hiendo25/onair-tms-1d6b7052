"use client";

import { Box, CircularProgress, Stack } from "@mui/material";

import EmptyData from "@/shared/ui/EmptyData";
import PageContainer from "@/shared/ui/PageContainer";
import {
  JOIN_HORIZONTAL_ZONE_CLASS,
  MAIN_LAYOUT_CONTENT_SELECTOR,
  queryClassName,
} from "../_constants";
import { useClassRoomDetail } from "../_hooks/useClassRoomDetail";
import { useClassRoomScrollSpy } from "../_hooks/useClassRoomScrollSpy";

import ClassRoomAdminTabs from "./ClassRoomAdminTabs";
import ClassRoomHeader from "./ClassRoomHeader";
import ClassRoomSeries from "./ClassRoomSeries";
import ClassRoomStudentSections from "./ClassRoomStudentSections";

interface ClassRoomDetailSectionProps {
  slug: string;
}

export default function ClassRoomDetailSection({ slug }: ClassRoomDetailSectionProps) {
  const {
    classRoomData,
    isLoading,
    isError,
    errorMessage,
    isAdminView,
    isFromLearningPath,
    learningPathId,
    breadcrumbs,
    pageTitle,
  } = useClassRoomDetail(slug);

  const { showJoinHorizontal } = useClassRoomScrollSpy({
    sectionClassName: queryClassName,
    joinZoneClassName: JOIN_HORIZONTAL_ZONE_CLASS,
    scrollContainerSelector: MAIN_LAYOUT_CONTENT_SELECTOR,
    enabled: Boolean(classRoomData),
  });

  if (isLoading) {
    return (
      <PageContainer title={pageTitle} breadcrumbs={breadcrumbs}>
        <Box className="flex items-center justify-center py-10">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (isError || !classRoomData) {
    return (
      <PageContainer title={pageTitle} breadcrumbs={breadcrumbs}>
        <EmptyData
          title="Không tìm thấy lớp học"
          description={errorMessage ?? "Vui lòng thử lại sau."}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={pageTitle} breadcrumbs={breadcrumbs}>
      <Stack position="relative">
        <ClassRoomHeader
          data={classRoomData}
          isAdminView={isAdminView}
          isFromLearningPath={isFromLearningPath}
        />
        <ClassRoomSeries
          data={classRoomData}
          isAdminView={isAdminView}
          isFromLearningPath={isFromLearningPath}
        />
        {isAdminView ? (
          <ClassRoomAdminTabs
            data={classRoomData}
            isFromLearningPath={isFromLearningPath}
            showJoinHorizontal={showJoinHorizontal}
            learningPathId={learningPathId}
          />
        ) : (
          <ClassRoomStudentSections
            data={classRoomData}
            isFromLearningPath={isFromLearningPath}
            showJoinHorizontal={showJoinHorizontal}
          />
        )}
      </Stack>
    </PageContainer>
  );
}

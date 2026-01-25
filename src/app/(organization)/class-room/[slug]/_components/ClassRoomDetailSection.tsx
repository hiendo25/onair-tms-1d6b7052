"use client";

import { Box, CircularProgress, Divider, Stack } from "@mui/material";

import EmptyData from "@/shared/ui/EmptyData";
import PageContainer from "@/shared/ui/PageContainer";
import {
  JOIN_HORIZONTAL_ZONE_CLASS,
  MAIN_LAYOUT_CONTENT_SELECTOR,
  queryClassName,
} from "../_constants";
import { useClassRoomDetail } from "../_hooks/useClassRoomDetail";
import { useClassRoomScrollSpy } from "../_hooks/useClassRoomScrollSpy";

import ClassRoomAgenda from "./ClassRoomAgenda";
import ClassRoomDescriptions from "./ClassRoomDes";
import ClassRoomDocuments from "./ClassRoomDocuments";
import ClassRoomHeader from "./ClassRoomHeader";
import ClassRoomJoinHorizontal from "./ClassRoomJoinHorizontal";
import ClassRoomObjectives from "./ClassRoomObjectives";
import ClassRoomSeries from "./ClassRoomSeries";
import ClassRoomSubjects from "./ClassRoomSubjects";

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
        <ClassRoomSubjects data={classRoomData} isFromLearningPath={isFromLearningPath} />
        <Divider className={`${JOIN_HORIZONTAL_ZONE_CLASS} invisible`} />

        {showJoinHorizontal && (
          <Box className="z-101 top-0 left-0 sticky w-full bg-white pt-3 pb-2">
            <ClassRoomJoinHorizontal data={classRoomData} isFromLearningPath={isFromLearningPath} />
          </Box>
        )}

        <Box sx={{ width: "100%", mt: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", pb: 4 }}>
            <Box mt={6} className={queryClassName}>
              <ClassRoomDescriptions description={classRoomData.description ?? ""} />
            </Box>
            {!isFromLearningPath && (
              <Box mt={4} className={queryClassName}>
                <ClassRoomAgenda data={classRoomData} />
              </Box>
            )}
            <Box mt={6} className={queryClassName}>
              <ClassRoomDocuments data={classRoomData} />
            </Box>
            <Box mt={6}>
              <ClassRoomObjectives data={classRoomData} />
            </Box>
          </Box>
        </Box>
      </Stack>
    </PageContainer>
  );
}

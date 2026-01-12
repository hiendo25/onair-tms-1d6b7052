"use client";
import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Divider, Stack } from "@mui/material";
import { useSearchParams } from "next/navigation";

import { ROUTE_QUERY_KEYS } from "@/constants/route-query.constant";
import { useGetClassRoomQuery } from "@/modules/class-room-management/operations/query";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import EmptyData from "@/shared/ui/EmptyData";
import PageContainer from "@/shared/ui/PageContainer";
import { queryClassName } from "../_constants";

import ClassRoomAgenda from "./ClassRoomAgenda";
import ClassRoomDescriptions from "./ClassRoomDes";
import ClassRoomDocuments from "./ClassRoomDocuments";
import ClassRoomHeader from "./ClassRoomHeader";
import ClassRoomJoinHorizontal from "./ClassRoomJoinHorizontal";
import ClassRoomObjectives from "./ClassRoomObjectives";
import ClassRoomSeries from "./ClassRoomSeries";
import ClassRoomSubjects from "./ClassRoomSubjects";

const offsetValue = -0.1;
const outOfMainJoinZoneClassName = "join-horizontal-zone";

interface ClassRoomDetailSectionProps {
  slug: string;
}

export default function ClassRoomDetailSection({ slug }: ClassRoomDetailSectionProps) {
  const { id: employeeId, type: employeeType } = useUserOrganization((state) => state.currentEmployee);
  const searchParams = useSearchParams();
  const learningPathId = searchParams.get(ROUTE_QUERY_KEYS.LEARNING_PATH_ID);
  const isFromLearningPath = Boolean(learningPathId);
  const [showJoinHorizontal, setShowJoinHorizontal] = useState<boolean>(false);

  const [tabValue, setTabValue] = useState(0);
  const {
    data: classRoomResponse,
    isLoading,
    isError,
    error,
  } = useGetClassRoomQuery(slug, { learningPathId });

  const handleChangeTab = (event: React.SyntheticEvent, value: number) => {
    const sections = document.getElementsByClassName(queryClassName);
    if (sections[value]) sections[value].scrollIntoView({ behavior: "smooth" });

    setTabValue(value);
  };

  const handleScroll = (e: Event) => {
    const scrollElement = document.querySelector(".main-layout__content");
    if (!scrollElement) return;

    const innerHeight = scrollElement.clientHeight * offsetValue;
    const scrollPosition = scrollElement.scrollTop + innerHeight;
    const sections = document.querySelectorAll(`.${queryClassName}`);
    const eventTab = document.querySelector(`.${outOfMainJoinZoneClassName}`);

    let newActiveSection: number | null = null;

    sections.forEach((section, index) => {
      const sectionTop = (section as HTMLDivElement).offsetTop;
      const sectionBottom = sectionTop + section.clientHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        newActiveSection = index;
      }
    });

    if (scrollPosition >= (eventTab as HTMLDivElement)?.offsetTop) setShowJoinHorizontal(true);
    else setShowJoinHorizontal(false);

    if (newActiveSection !== null) setTabValue(newActiveSection);
  };

  useEffect(() => {
    const scrollElement = document.querySelector(".main-layout__content");
    if (!scrollElement) return;

    scrollElement.addEventListener("scroll", handleScroll);

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const classRoomData = classRoomResponse?.data ?? null;
  const errorMessage =
    classRoomResponse?.error?.message ?? (error instanceof Error ? error.message : null);

  if (isLoading) {
    return (
      <PageContainer title="Chi tiết lớp học" breadcrumbs={[{ title: "Lớp học", path: "/class-room/list" }]}>
        <Box className="flex items-center justify-center py-10">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (isError || !classRoomData) {
    return (
      <PageContainer title="Chi tiết lớp học" breadcrumbs={[{ title: "Lớp học", path: "/class-room/list" }]}>
        <EmptyData
          title="Không tìm thấy lớp học"
          description={errorMessage ?? "Vui lòng thử lại sau."}
        />
      </PageContainer>
    );
  }

  const isAdminView = classRoomData.owner?.id === employeeId || employeeType === "admin" || employeeType === "teacher";

  return (
    <PageContainer
      title="Chi tiết lớp học"
      breadcrumbs={[
        { title: "Lớp học", path: "/class-room/list" },
        { title: classRoomData.title || "Chi tiết", path: `/class-room/${classRoomData.slug}` },
      ]}
    >
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
        <Divider className={`${outOfMainJoinZoneClassName} invisible`} />

        {showJoinHorizontal && (
          <Box className="z-101 top-0 left-0 sticky w-full bg-white pt-3 pb-2">
            <ClassRoomJoinHorizontal data={classRoomData} isFromLearningPath={isFromLearningPath} />
          </Box>
        )}

        <Box sx={{ width: "100%", mt: 3 }} >
          <Box sx={{ borderBottom: 1, borderColor: "divider", pb: 4 }}>
            {/* <Tabs
              value={tabValue}
              onChange={handleChangeTab}
              sx={{
                "& .Mui-selected": { color: "#333" },
                "& .MuiTabs-indicator": { backgroundColor: "#0050FF", height: 3 },
              }}
            >
              <Tab label="Nội dung lớp học" />
              <Tab label="Agenda" />
              <Tab label="Tài liệu" />
            </Tabs> */}

            <Box mt={6} className={`${queryClassName}`}>
              <ClassRoomDescriptions description={classRoomData.description!} />
            </Box>
            {
              !isFromLearningPath && (
                <Box mt={4} className={`${queryClassName}`}>
                  <ClassRoomAgenda data={classRoomData} />
                </Box>
              )
            }
            <Box mt={6} className={`${queryClassName}`}>
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

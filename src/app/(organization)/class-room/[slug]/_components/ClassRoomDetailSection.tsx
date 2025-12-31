"use client";
import React, { useEffect, useState } from "react";
import { Box, Divider, Stack, Tab, Tabs } from "@mui/material";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { ROUTE_QUERY_KEYS, ROUTE_QUERY_VALUES } from "@/constants/route-query.constant";
import { useGetClassRoomQuery } from "@/modules/class-room-management/operations/query";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import PageContainer from "@/shared/ui/PageContainer";
import { queryClassName } from "../_constants";

import ClassRoomAgenda from "./ClassRoomAgenda";
import ClassRoomDocuments from "./ClassRoomDocuments";
import ClassRoomHeader from "./ClassRoomHeader";
import ClassRoomJoinHorizontal from "./ClassRoomJoinHorizontal";
import ClassRoomSeries from "./ClassRoomSeries";
import ClassRoomSubjects from "./ClassRoomSubjects";

const offsetValue = -0.1;
const outOfMainJoinZoneClassName = "join-horizontal-zone";

interface ClassRoomDetailSectionProps {
  data: NonNullable<GetClassRoomBySlugResponse["data"]>;
}

export default function ClassRoomDetailSection({ data }: ClassRoomDetailSectionProps) {
  const { id: employeeId, type: employeeType } = useUserOrganization((state) => state.currentEmployee);
  const searchParams = useSearchParams();
  const isFromLearningPath =
    searchParams.get(ROUTE_QUERY_KEYS.SOURCE) === ROUTE_QUERY_VALUES.LEARNING_PATH;
  const [showJoinHorizontal, setShowJoinHorizontal] = useState<boolean>(false);

  const [tabValue, setTabValue] = useState(0);

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

  // useEffect(() => {
  //   if (!data || !data) return;

  //   const classRoomData = data;

  //   const canAccess =
  //     classRoomData.employees.find((employee) => employee.employee?.id === user.id) ||
  //     classRoomData.owner?.id === user.id ||
  //     user.employeeType === "admin" ||
  //     classRoomData.sessions.find((section) => section.courses_period?.some((coursePeriod) => coursePeriod.teacher?.id === user.id));

  //   if (!canAccess) return window.history.length > 2 ? router.back() : router.push("/");
  // }, [data]);

  const classRoomData = data;

  const isAdminView = classRoomData.owner?.id === employeeId || employeeType === "admin" || employeeType === "teacher";

  return (
    <PageContainer
      title="Chi tiết lớp học"
      breadcrumbs={[
        { title: "Lớp học", path: "/class-room/list" },
        { title: classRoomData.title || "Chi tiết", path: `/class-room/${data.slug}` },
      ]}
    >
      <Stack position="relative">
        <ClassRoomHeader data={classRoomData} isAdminView={isAdminView} />
        <ClassRoomSeries data={classRoomData} isAdminView={isAdminView} />
        <ClassRoomSubjects data={data} isFromLearningPath={isFromLearningPath} />
        <Divider className={`${outOfMainJoinZoneClassName} invisible`} />

        {showJoinHorizontal && (
          <Box className="z-101 top-0 left-0 sticky w-full bg-white pt-3 pb-2">
            <ClassRoomJoinHorizontal data={classRoomData} />
          </Box>
        )}

        <Box sx={{ width: "100%", mt: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", pb: 4 }}>
            <Tabs
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
            </Tabs>

            <Box sx={{ pt: 2 }} className={`${queryClassName}`}>
              <div
                dangerouslySetInnerHTML={{
                  __html: classRoomData.description || "<p>Chưa có nội dung lớp học</p>",
                }}
              />
            </Box>
            <Box mt={4} className={`${queryClassName}`}>
              <ClassRoomAgenda data={classRoomData} />
            </Box>
            <Box mt={4} className={`${queryClassName}`}>
              <ClassRoomDocuments data={classRoomData} />
            </Box>
          </Box>
        </Box>
      </Stack>
    </PageContainer>
  );
}

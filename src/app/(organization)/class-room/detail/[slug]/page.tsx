"use client";
import { useGetClassRoomQuery } from "@/modules/class-room-management/operations/query";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import PageContainer from "@/shared/ui/PageContainer";
import { Box, Divider, Stack, Tab, Tabs } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ClassRoomAgenda from "./_components/ClassRoomAgenda";
import ClassRoomDocuments from "./_components/ClassRoomDocuments";
import ClassRoomHeader from "./_components/ClassRoomHeader";
import ClassRoomJoinHorizontal from "./_components/ClassRoomJoinHorizontal";
import ClassRoomSeries from "./_components/ClassRoomSeries";
import { queryClassName } from "./_constants";

const offsetValue = -0.1;
const outOfMainJoinZoneClassName = "join-horizontal-zone";

export default function ClassRoomDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const user = useUserOrganization((state) => state.data);
  const [showJoinHorizontal, setShowJoinHorizontal] = useState<boolean>(false);

  const [tabValue, setTabValue] = useState(0);

  const handleChangeTab = (event: React.SyntheticEvent, value: number) => {
    const sections = document.getElementsByClassName(queryClassName);
    if (sections[value]) sections[value].scrollIntoView({ behavior: "smooth" });

    setTabValue(value);
  };

  const { data, isLoading } = useGetClassRoomQuery(slug);

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

  useEffect(() => {
    if (!data || !data.data) return;

    const classRoomData = data.data;

    const canAccess =
      classRoomData.employees.find((employee) => employee.employee?.id === user.id) ||
      classRoomData.owner?.id === user.id ||
      user.employeeType === "admin" ||
      classRoomData.sessions.find((section) => section.teachers?.some((teacher) => teacher.employee?.id === user.id));

    if (!canAccess) return window.history.length > 2 ? router.back() : router.push("/");
  }, [data]);

  if (isLoading && !data) return <div>Loading...</div>;

  if (!isLoading && ((data && !data.data) || !data)) return <div>Class room not found</div>;

  const classRoomData = data?.data;

  if (!classRoomData) return <div>Class room not found</div>;

  const isAdminView =
    classRoomData.owner?.id === user.id || user.employeeType === "admin" || user.employeeType === "teacher";
    
  return (
    <PageContainer
      title="Chi tiết lớp học"
      breadcrumbs={[
        { title: "Lớp học", path: "/class-room/list" },
        { title: classRoomData.title || "Chi tiết", path: `/class-room/${slug}` },
      ]}
    >
      <Stack position="relative">
        <ClassRoomHeader data={classRoomData} isAdminView={isAdminView} />
        <ClassRoomSeries data={classRoomData} isAdminView={isAdminView} />
        <Divider className={`${outOfMainJoinZoneClassName} invisible`} />

        {showJoinHorizontal && (
          <Box className="z-101 top-0 left-0 sticky w-full bg-white pt-3 pb-2">
            <ClassRoomJoinHorizontal data={classRoomData} />
          </Box>
        )}

        <Box sx={{ width: "100%", mt: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
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

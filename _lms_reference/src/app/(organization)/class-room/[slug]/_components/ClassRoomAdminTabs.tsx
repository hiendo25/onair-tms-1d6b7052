"use client";

import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import { Box, Tab } from "@mui/material";

import { useTabs } from "@/hooks/useTabs";
import { ClassRoomDetailWithProgress } from "@/services/class-room/class-room-progress-mapping.service";
import { CustomTabList } from "@/shared/ui/CustomTab/TabList";
import {
  CLASSROOM_DETAIL_TAB_ITEMS,
  CLASSROOM_DETAIL_TAB_KEYS,
  JOIN_HORIZONTAL_ZONE_CLASS,
} from "../_constants";

import ClassRoomExamSection from "./ClassRoomExamSection";
import ClassRoomGeneralInfoSection from "./ClassRoomGeneralInfoSection";
import ClassRoomJoinHorizontal from "./ClassRoomJoinHorizontal";
import ClassRoomStudentsSection from "./ClassRoomStudentsSection";
import ClassRoomSubjects from "./ClassRoomSubjects";

interface ClassRoomAdminTabsProps {
  data: ClassRoomDetailWithProgress;
  isFromLearningPath: boolean;
  showJoinHorizontal: boolean;
  learningPathId?: string | null;
}

export default function ClassRoomAdminTabs({
  data,
  isFromLearningPath,
  showJoinHorizontal,
  learningPathId,
}: ClassRoomAdminTabsProps) {
  const { value, onChange } = useTabs(CLASSROOM_DETAIL_TAB_KEYS.OVERVIEW);

  return (
    <TabContext value={value}>
      <CustomTabList
        onChange={onChange}
        sx={{
          paddingBlock: "1.25rem",
          ".MuiTabs-list": {
            gap: "1rem",
          },
          ".MuiTab-root": {
            textTransform: "inherit",
          },
        }}
      >
        {CLASSROOM_DETAIL_TAB_ITEMS.map((item) => (
          <Tab key={item.tabKey} label={item.tabLabel} value={item.tabKey} className="px-0" />
        ))}
      </CustomTabList>

      <Box className={`${JOIN_HORIZONTAL_ZONE_CLASS} invisible`} />

      {showJoinHorizontal && (
        <Box className="z-101 top-0 left-0 sticky w-full bg-white pt-3 pb-2">
          <ClassRoomJoinHorizontal data={data} isFromLearningPath={isFromLearningPath} isAdminView />
        </Box>
      )}

      <TabPanel className="p-0" value={CLASSROOM_DETAIL_TAB_KEYS.OVERVIEW}>
        <ClassRoomGeneralInfoSection data={data} isFromLearningPath={isFromLearningPath} />
      </TabPanel>
      <TabPanel className="p-0" value={CLASSROOM_DETAIL_TAB_KEYS.SUBJECTS}>
        <ClassRoomSubjects data={data} isFromLearningPath={isFromLearningPath} isAdminView />
      </TabPanel>
      <TabPanel className="p-0" value={CLASSROOM_DETAIL_TAB_KEYS.EXAMS}>
        <ClassRoomExamSection data={data} enableAdminNavigate />
      </TabPanel>
      <TabPanel className="p-0" value={CLASSROOM_DETAIL_TAB_KEYS.STUDENTS}>
        <ClassRoomStudentsSection data={data} learningPathId={learningPathId} />
      </TabPanel>
    </TabContext>
  );
}

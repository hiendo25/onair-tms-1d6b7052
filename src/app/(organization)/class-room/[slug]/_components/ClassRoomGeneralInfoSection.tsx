import { Box } from "@mui/material";

import { ClassRoomDetailWithProgress } from "@/services/class-room/class-room-progress-mapping.service";
import { queryClassName } from "../_constants";

import ClassRoomAgenda from "./ClassRoomAgenda";
import ClassRoomDescriptions from "./ClassRoomDes";
import ClassRoomDocuments from "./ClassRoomDocuments";
import ClassRoomObjectives from "./ClassRoomObjectives";

interface ClassRoomGeneralInfoSectionProps {
  data: ClassRoomDetailWithProgress;
  isFromLearningPath: boolean;
}

export default function ClassRoomGeneralInfoSection({
  data,
  isFromLearningPath,
}: ClassRoomGeneralInfoSectionProps) {
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", pb: 4 }}>
        <Box className={queryClassName}>
          <ClassRoomDescriptions description={data.description ?? ""} />
        </Box>
        {!isFromLearningPath && (
          <Box mt={4} className={queryClassName}>
            <ClassRoomAgenda data={data} />
          </Box>
        )}
        <Box mt={6} className={queryClassName}>
          <ClassRoomDocuments data={data} />
        </Box>
        <Box mt={6}>
          <ClassRoomObjectives data={data} />
        </Box>
      </Box>
    </Box>
  );
}

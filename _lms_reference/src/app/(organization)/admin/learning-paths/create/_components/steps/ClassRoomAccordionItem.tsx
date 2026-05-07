import React, { memo } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";

import LearningPathChip from "@/modules/learning-paths/components/LearningPathChip";
import type { ClassRoom } from "@/modules/learning-paths/learning-path-form.schema";

interface ClassRoomAccordionItemProps {
  classRoom: ClassRoom;
  expanded: boolean;
  hasError?: boolean;
  onExpandChange: (expanded: boolean) => void;
  onDelete: () => void;
}

// Helper function to format schedule
const formatSchedule = (startAt?: string, endAt?: string) => {
  if (!startAt || !endAt) return "";

  const startDate = new Date(startAt);
  const endDate = new Date(endAt);

  // Get day of week in Vietnamese
  const daysOfWeek = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const dayOfWeek = daysOfWeek[startDate.getDay()];

  // Format time as HH:mm
  const startTime = startDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  const endTime = endDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });

  return `${dayOfWeek} ${startTime} - ${endTime}`;
};

// Helper function to get channel provider label
const getChannelProviderLabel = (provider?: string) => {
  if (!provider) return null;

  const lowerProvider = provider.toLowerCase();
  if (lowerProvider.includes("zoom")) return "Zoom";
  if (lowerProvider.includes("google") || lowerProvider.includes("meet")) return "Google Meet";
  return provider;
};

// Helper function to get room type label
const getRoomTypeLabel = (roomType?: string) => {
  switch (roomType) {
    case "single":
      return "Đơn";
    case "multiple":
      return "Chuỗi";
    default:
      return "";
  }
};

// Helper function to get session type label and color
const getSessionTypeInfo = (sessionType?: string) => {
  switch (sessionType) {
    case "live":
      return { label: "Live", color: "success" as const };
    case "online":
      return { label: "Online", color: "info" as const };
    case "offline":
      return { label: "Offline", color: "secondary" as const };
    default:
      return { label: "", color: "default" as const };
  }
};

const ClassRoomAccordionItem: React.FC<ClassRoomAccordionItemProps> = ({
  classRoom,
  expanded,
  hasError,
  onExpandChange,
  onDelete,
}) => {
  const sessionTypeInfo = getSessionTypeInfo(classRoom.session_type);
  const roomTypeLabel = getRoomTypeLabel(classRoom.room_type);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => onExpandChange(isExpanded)}
      sx={{
        border: "1px solid",
        borderColor: hasError ? "error.main" : "divider",
        borderRadius: "8px !important",
        bgcolor: "white",
        "&:before": {
          display: "none",
        },
        boxShadow: "none",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          borderColor: "divider",
          "& .MuiAccordionSummary-content": {
            margin: "12px 0",
            alignItems: "center",
          },
          "& .MuiAccordionSummary-expandIconWrapper": {
            marginRight: 1,
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, pr: 2 }}>
          {/* Classroom Title with Badge */}
          <Chip
            label={`${sessionTypeInfo.label}${roomTypeLabel ? ` - ${roomTypeLabel}` : ""}`}
            color={sessionTypeInfo.color}
            size="small"
            sx={{ borderRadius: "6px" }}
          />
          <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1 }}>
            {classRoom.name}
          </Typography>

          {/* Session count indicator */}
          {classRoom.sessions && classRoom.sessions.length > 0 && (
            <Chip
              label={`${classRoom.sessions.length} môn học`}
              size="small"
              color="default"
              variant="outlined"
              sx={{ fontWeight: 500, borderColor: "darkgray" }}
            />
          )}

          {/* Delete Button */}
          <Box
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Xóa lớp học"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: 1,
              p: 1.5,
              cursor: "pointer",
              color: "grey.600",
              transition: "background-color 0.2s",
              border: "1px solid",
              borderColor: "grey.500",
            }}
          >
            <DeleteIcon fontSize="small" />
          </Box>
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0, pb: 2 }}>
        {/* Sessions/Course Periods List */}
        {classRoom.sessions && classRoom.sessions.length > 0 && (
          <List disablePadding sx={{ borderRadius: 1 }}>
            {classRoom.sessions.map((session, sessionIndex) => (
              <Box key={session.id}>
                {sessionIndex > 0 && <Divider />}
                <ListItem sx={{ py: 1.5, px: 2 }}>
                  <Stack spacing={1} width="100%">
                    {/* Course title chip */}
                    {session.course && (
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <LearningPathChip
                          icon={<BookIcon sx={{ fontSize: 18, color: "text.secondary" }} />}
                          label={`Môn học ${sessionIndex + 1}`}
                        />

                        <Typography variant="body2">
                          {session?.course?.title}
                        </Typography>
                      </Stack>
                    )}

                    {/* Teacher, Platform, and Schedule */}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {/* Teacher */}
                      {session.teacher && (
                        <LearningPathChip
                          icon={<PersonIcon sx={{ fontSize: 16 }} />}
                          label={`GV ${session.teacher.full_name}`}
                        />
                      )}

                      {/* Platform */}
                      {session.channel_provider && (
                        <LearningPathChip
                          icon={<VideoCallIcon sx={{ fontSize: 16, color: "text.secondary" }} />}
                          label={getChannelProviderLabel(session.channel_provider)}
                        />
                      )}

                      {/* Schedule */}
                      {session.start_at && session.end_at && (
                        <LearningPathChip
                          icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
                          label={formatSchedule(session.start_at, session.end_at)}
                        />
                      )}
                    </Stack>
                  </Stack>
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </AccordionDetails>
    </Accordion >
  );
};

export default memo(ClassRoomAccordionItem);

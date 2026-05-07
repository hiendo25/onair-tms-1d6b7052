"use client";

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
  Card,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";

import { PATHS } from "@/constants/path.constant";
import type { PhaseWithClassRooms } from "@/repository/learning-paths";

import {
  formatSessionTime,
  getClassRoomTitle,
  getPhaseLabel,
  SECTION_CARD_SX,
} from "./learning-path-detail.utils";
import LearningPathChip from "./LearningPathChip";

interface LearningPathDetailPhasesSectionProps {
  phases: PhaseWithClassRooms[];
  phaseCount: number;
}

export default function LearningPathDetailPhasesSection({
  phases,
  phaseCount,
}: LearningPathDetailPhasesSectionProps) {
  return (
    <Card sx={SECTION_CARD_SX}>
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={700}>
              Giai đoạn học tập <span className="font-normal text-sm text-action-disabled">({phaseCount} giai đoạn)</span>
            </Typography>
          </Stack>

          {phaseCount === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Chưa có giai đoạn nào trong lộ trình.
            </Typography>
          ) : (
            phases.map((phase, phaseIndex) => {
              const phaseClassRooms = phase.phase_class_rooms ?? [];
              const phaseClassRoomsCount = phase.phase_class_rooms_count ?? 0;

              return (
                <Accordion
                  key={phase.id}
                  className="border-b border-[#929eab33] rounded-bl-none rounded-br-none"
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Stack>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {getPhaseLabel(phase, phaseIndex)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {phaseClassRoomsCount} lớp học
                        </Typography>
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                          Mô tả giai đoạn
                        </Typography>
                        <Typography variant="body2" color="text.secondary" className="whitespace-pre-line max-h-60 overflow-scroll">
                          {phase.description || "Chưa có mô tả cho giai đoạn này."}
                        </Typography>
                      </Box>

                      <Stack spacing={2}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Lớp học trong giai đoạn
                        </Typography>

                        {phaseClassRoomsCount === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            Chưa có lớp học nào trong giai đoạn.
                          </Typography>
                        ) : (
                          phaseClassRooms.map((classRoomItem, classRoomIndex) => {
                            const classRoom = classRoomItem.class_room;
                            const sessions = classRoom.class_sessions ?? [];
                            const classRoomHref = classRoom.slug
                              ? PATHS.CLASSROOMS.DETAIL_CLASSROOM(classRoom.slug)
                              : null;
                            const cardLinkProps = classRoomHref ? { component: Link, href: classRoomHref } : {};

                            return (
                              <Card
                                key={classRoomItem.id}
                                {...cardLinkProps}
                                variant="outlined"
                                sx={{
                                  borderRadius: 2,
                                  borderColor: "divider",
                                  textDecoration: "none",
                                  color: "inherit",
                                  cursor: classRoomHref ? "pointer" : "default",
                                  transition: "all 0.2s ease",
                                  "&:hover": classRoomHref
                                    ? {
                                      borderColor: "primary.main",
                                      boxShadow: "0 10px 20px rgba(15, 23, 42, 0.08)",
                                    }
                                    : undefined,
                                }}
                              >
                                <Box sx={{ p: 2 }}>
                                  <Stack spacing={1.5}>
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                      <Box
                                        sx={{
                                          width: 32,
                                          height: 32,
                                          borderRadius: 1,
                                          bgcolor: "grey.100",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          fontWeight: 700,
                                        }}
                                      >
                                        {classRoomIndex + 1}
                                      </Box>
                                      <Stack spacing={0.5}>
                                        <Typography variant="subtitle2" fontWeight={700}>
                                          {getClassRoomTitle(classRoomItem)}
                                        </Typography>
                                      </Stack>
                                    </Stack>

                                    {sessions.length === 0 ? (
                                      <Typography variant="body2" color="text.secondary">
                                        Chưa có buổi học nào cho lớp này.
                                      </Typography>
                                    ) : (
                                      <Stack spacing={1.5} divider={<Divider flexItem />}>
                                        {sessions.map((session, sessionIndex) => {
                                          const primaryCourse = session.class_sessions_courses_period?.[0];
                                          const courseTitle =
                                            primaryCourse?.courses?.title || session.title || "Buổi học";
                                          const teacherName =
                                            primaryCourse?.teacher?.profiles?.full_name ||
                                            session.class_session_teacher?.[0]?.teacher?.profiles?.full_name;

                                          return (
                                            <Stack key={session.id} spacing={1}>
                                              <Stack direction="row" spacing={1} alignItems="center">
                                                <LearningPathChip
                                                  icon={<BookIcon sx={{ fontSize: 18, color: "text.secondary" }} />}
                                                  label={`Môn học ${sessionIndex + 1}`}
                                                />
                                                <Typography variant="body2">
                                                  {courseTitle}
                                                </Typography>
                                              </Stack>
                                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                                {teacherName && (
                                                  <LearningPathChip
                                                    icon={<PersonIcon />}
                                                    label={`GV ${teacherName}`}
                                                  />
                                                )}
                                                {session.channel_provider && (
                                                  <LearningPathChip
                                                    icon={<VideoCallIcon />}
                                                    label={session.channel_provider}
                                                  />
                                                )}
                                                <LearningPathChip
                                                  icon={<ScheduleIcon />}
                                                  label={formatSessionTime(session.start_at, session.end_at)}
                                                />
                                              </Stack>
                                            </Stack>
                                          );
                                        })}
                                      </Stack>
                                    )}
                                  </Stack>
                                </Box>
                              </Card>
                            );
                          })
                        )}
                      </Stack>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}
        </Stack>
      </Box>
    </Card >
  );
}

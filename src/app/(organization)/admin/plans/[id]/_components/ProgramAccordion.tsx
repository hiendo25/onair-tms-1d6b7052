"use client";

import * as React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import { fDateTime, FORMAT_DATE_TIME_CLEANER } from "@/lib";
import { PlanProgramDetail } from "@/modules/plans/types";

interface ProgramAccordionProps {
  programs: PlanProgramDetail[];
  programsCount: number;
}

export default function ProgramAccordion({
  programs,
  programsCount,
}: ProgramAccordionProps) {
  const [expandedDescriptions, setExpandedDescriptions] = React.useState<Record<string, boolean>>({});
  const [truncatedDescriptions, setTruncatedDescriptions] = React.useState<Record<string, boolean>>({});
  const descriptionRefs = React.useRef<Record<string, HTMLElement | null>>({});
  const [expandedTopicDescriptions, setExpandedTopicDescriptions] = React.useState<Record<string, boolean>>({});
  const [truncatedTopicDescriptions, setTruncatedTopicDescriptions] = React.useState<Record<string, boolean>>({});
  const topicDescriptionRefs = React.useRef<Record<string, HTMLElement | null>>({});

  const toggleDescription = (programId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [programId]: !prev[programId],
    }));
  };

  const toggleTopicDescription = (topicId: string) => {
    setExpandedTopicDescriptions(prev => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  // Check if description is truncated
  React.useEffect(() => {
    const newTruncatedState: Record<string, boolean> = {};

    programs.forEach(program => {
      if (program.description) {
        const element = descriptionRefs.current[program.id];
        if (element) {
          // Compare scrollHeight with clientHeight to detect overflow
          const isTruncated = element.scrollHeight > element.clientHeight;
          newTruncatedState[program.id] = isTruncated;
        }
      }
    });

    setTruncatedDescriptions(newTruncatedState);
  }, [programs]);

  // Check if topic description is truncated
  React.useEffect(() => {
    const newTruncatedState: Record<string, boolean> = {};

    programs.forEach(program => {
      if (program.topics) {
        program.topics.forEach(topic => {
          if (topic.description) {
            const element = topicDescriptionRefs.current[topic.id];
            if (element) {
              // Compare scrollHeight with clientHeight to detect overflow
              const isTruncated = element.scrollHeight > element.clientHeight;
              newTruncatedState[topic.id] = isTruncated;
            }
          }
        });
      }
    });

    setTruncatedTopicDescriptions(newTruncatedState);
  }, [programs]);

  if (programs.length === 0) return null;

  return (
    <Card sx={{ mb: 3, bgcolor: "white" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Chi tiết kế hoạch đào tạo{" "}
          <Typography component="span" variant="body2" color="text.secondary">
            ({programsCount} chương trình)
          </Typography>
        </Typography>

        <Stack spacing={2}>
          {programs.map((program, index) => {
            const isDescriptionExpanded = expandedDescriptions[program.id] || false;

            return (
              <Accordion
                key={program.id}
                sx={{
                  bgcolor: "white",
                  "&:before": { display: "none" },
                  boxShadow: "0 12px 28px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(145, 158, 171, 0.40)",
                  borderRadius: "12px",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#000" }} />}
                  sx={{
                    minHeight: "auto",
                    "&:hover": {
                      bgcolor: "grey.50",
                    },
                    "& .MuiAccordionSummary-content": {
                      my: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    },
                  }}
                >
                  <Box>
                    <Chip
                      label={`Chương trình ${index + 1}`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#000", mb: 0.5 }}>
                      {program.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                      {program.startDate && program.endDate ? `${fDateTime(program.startDate, FORMAT_DATE_TIME_CLEANER)} - ${fDateTime(program.endDate, FORMAT_DATE_TIME_CLEANER)}` : "Chưa có lịch"}
                    </Typography>

                    {/* Program Description with Expand/Collapse */}
                    {program.description && (
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.primary",
                            fontSize: "0.875rem",
                            display: "inline",
                          }}
                        >
                          {isDescriptionExpanded ? (
                            <>
                              {program.description}{" "}
                              {truncatedDescriptions[program.id] && (
                                <Typography
                                  component="span"
                                  variant="body2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDescription(program.id);
                                  }}
                                  sx={{
                                    color: "primary.main",
                                    cursor: "pointer",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    whiteSpace: "nowrap",
                                    "&:hover": {
                                      textDecoration: "underline",
                                    },
                                  }}
                                >
                                  Thu gọn
                                </Typography>
                              )}
                            </>
                          ) : (
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                ref={(el) => {
                                  descriptionRefs.current[program.id] = el;
                                }}
                                sx={{
                                  color: "text.primary",
                                  fontSize: "0.875rem",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {program.description}
                              </Typography>{" "}
                              {truncatedDescriptions[program.id] && (
                                <Typography
                                  component="span"
                                  variant="body2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDescription(program.id);
                                  }}
                                  sx={{
                                    color: "primary.main",
                                    cursor: "pointer",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    whiteSpace: "nowrap",
                                    "&:hover": {
                                      textDecoration: "underline",
                                    },
                                  }}
                                >
                                  Xem thêm
                                </Typography>
                              )}
                            </>
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: "white", borderTop: "1px solid #e0e0e0", p: 0, borderRadius: 1, mt: 0.5 }}>
                  {program.topics && program.topics.length > 0 ? (
                    <Stack spacing={0}>
                      {program.topics.map((topic, topicIndex) => (
                        <Box key={topic.id}>
                          {/* Topic Header - Level 1 (No left padding, Chip + Title) */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              px: 0,
                              py: 1.5,
                              pl: 2,
                            }}
                          >
                            {/* Topic Chip - Dynamically generated name */}
                            <Chip
                              label={`Chủ đề ${topicIndex + 1}`}
                              size="small"
                              variant="filled"
                              sx={{
                                bgcolor: "#212B36",
                                '& span': {
                                  color: "white !important"
                                }
                              }}
                            />
                            {/* Topic Title */}
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {topic.name}
                            </Typography>
                          </Box>

                          {/* Topic Description with Expand/Collapse */}
                          {topic.description && (
                            <Box sx={{ bgcolor: "grey.200", p: 1, mx: 2, mb: 1.5, borderRadius: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.primary",
                                  fontSize: "0.875rem",
                                  display: "inline",
                                }}
                              >
                                {expandedTopicDescriptions[topic.id] ? (
                                  <>
                                    {topic.description}{" "}
                                    {truncatedTopicDescriptions[topic.id] && (
                                      <Typography
                                        component="span"
                                        variant="body2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleTopicDescription(topic.id);
                                        }}
                                        sx={{
                                          color: "primary.main",
                                          cursor: "pointer",
                                          fontSize: "0.875rem",
                                          fontWeight: 500,
                                          whiteSpace: "nowrap",
                                          "&:hover": {
                                            textDecoration: "underline",
                                          },
                                        }}
                                      >
                                        Thu gọn
                                      </Typography>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      ref={(el) => {
                                        topicDescriptionRefs.current[topic.id] = el;
                                      }}
                                      sx={{
                                        color: "text.primary",
                                        fontSize: "0.875rem",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 1,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {topic.description}
                                    </Typography>{" "}
                                    {truncatedTopicDescriptions[topic.id] && (
                                      <Typography
                                        component="span"
                                        variant="body2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleTopicDescription(topic.id);
                                        }}
                                        sx={{
                                          color: "primary.main",
                                          cursor: "pointer",
                                          fontSize: "0.875rem",
                                          fontWeight: 500,
                                          whiteSpace: "nowrap",
                                          "&:hover": {
                                            textDecoration: "underline",
                                          },
                                        }}
                                      >
                                        Xem thêm
                                      </Typography>
                                    )}
                                  </>
                                )}
                              </Typography>
                            </Box>
                          )}
                          <Stack spacing={0}>
                            {topic.courses.map((course) => (
                              <Box key={course.id}>
                                {/* Course Header */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    pl: 6,
                                    pr: 2,
                                    py: 1.5,
                                  }}
                                >
                                  <MenuBookIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {course.title}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : program.courses && program.courses.length > 0 ? (
                    <Stack spacing={1} sx={{ p: 2 }}>
                      {program.courses.map((course) => (
                        <Box key={course.id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <MenuBookIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {course.title}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Chưa có nội dung chương trình
                      </Typography>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

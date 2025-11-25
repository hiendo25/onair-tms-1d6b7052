"use client";

import * as React from "react";
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";
import { ProgramDetail } from "../../_components/mock-data";

interface ProgramAccordionProps {
  programs: ProgramDetail[];
  programsCount: number;
}

export default function ProgramAccordion({
  programs,
  programsCount,
}: ProgramAccordionProps) {
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
          {programs.map((program, index) => (
            <Accordion
              key={program.id}
              sx={{
                bgcolor: "rgba(0, 80, 255, 0.12)",
                "&:before": { display: "none" },
                boxShadow: "none",
                border: "1px solid rgba(145, 158, 171, 0.40)",
                borderRadius: "8px",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#000" }} />}
                sx={{
                  minHeight: "auto",
                  "&:hover": {
                    bgcolor: "rgba(0, 80, 255, 0.12)",
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
                    {program.startDate} - {program.endDate}
                  </Typography>
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
                            {topic.title}
                          </Typography>
                        </Box>

                        {/* Courses within Topic - Level 2 (Indented 32px, no gray background) */}
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
                                <Typography variant="body2" color="text.secondary">
                                  ({course.classesCount} lớp)
                                </Typography>
                              </Box>

                              {/* Classes List - Level 3 (Indented 64px total) */}
                              <Stack spacing={0}>
                                {course.classes.map((classInstance, classIndex) => (
                                  <Box
                                    key={classInstance.id}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      pl: 10,
                                      pr: 2,
                                      py: 1.5,
                                    }}
                                  >
                                    {/* Lớp Label */}
                                    <Typography
                                      variant="body2"
                                      sx={{ minWidth: "30px", color: "text.secondary" }}
                                    >
                                      Lớp
                                    </Typography>

                                    {/* Class Code Chip */}
                                    <Chip
                                      label={classInstance.classCode}
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                    />

                                    {/* Delivery Mode */}
                                    <Typography variant="body2" sx={{ minWidth: "60px" }}>
                                      {classInstance.deliveryMode}
                                    </Typography>

                                    {/* Instructor */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1 }}>
                                      <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                      <Typography variant="body2">{classInstance.instructor}</Typography>
                                    </Box>

                                    {/* Date */}
                                    <Typography variant="body2" sx={{ minWidth: "90px", textAlign: "right" }}>
                                      {classInstance.date}
                                    </Typography>
                                  </Box>
                                ))}
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
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
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}


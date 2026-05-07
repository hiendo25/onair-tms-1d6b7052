"use client";

import React, { useState } from "react";
import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";

import { FORMAT_DATE_STANDARD, FORMAT_TIME } from "@/lib";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";

interface ClassRoomAgendaProps {
  data: NonNullable<GetClassRoomBySlugResponse["data"]>;
}

const ClassRoomAgenda = ({ data }: ClassRoomAgendaProps) => {
  const sessions = data?.sessions ?? [];
  const isSingle = data?.room_type === "single";
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(0);
  const [expanded, setExpanded] = useState<number>(-1);

  const handleChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : -1);
  };

  if (sessions.length === 0 || sessions.every((session) => session.agendas.length === 0))
    return (
      <Stack alignItems={"center"}>
        <Typography variant="h5" fontWeight="bold" mb={3} color="#002880">
          Agenda (Lịch trình lớp học)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chưa có lịch trình cho lớp học này.
        </Typography>
      </Stack>
    );

  return (
    <Stack alignItems={"center"}>
      <Typography variant="h5" fontWeight="bold" mb={3} color="#002880">
        Agenda (Lịch trình lớp học)
      </Typography>

      {!isSingle && (
        <Box sx={{ width: "100%", overflowX: "auto", pb: 1 }}>
          <Stack flexDirection={"row"} sx={{ width: "fit-content" }}>
            {sessions.map((session, index) => (
              <Button
                key={session.id}
                variant={currentSessionIndex === index ? "contained" : "outlined"}
                color={currentSessionIndex === index ? "primary" : "inherit"}
                sx={{
                  textTransform: "none",
                  borderTopLeftRadius: index === 0 ? "8px" : 0,
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: index === sessions.length - 1 ? "8px" : 0,
                  borderBottomRightRadius: 0,
                }}
                onClick={() => {
                  setCurrentSessionIndex(index);
                  setExpanded(-1);
                }}
              >
                Buổi {index + 1}
              </Button>
            ))}
          </Stack>
        </Box>
      )}
      <Stack width={{ xs: "100%", md: "70%" }}>
        {sessions[currentSessionIndex]?.agendas.map((agenda, index) => (
          <Accordion key={index} expanded={expanded === index} onChange={handleChange(index)}>
            <AccordionSummary>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={{ xs: 1, sm: 2 }}
                justifyContent={"space-between"}
                width="100%"
              >
                <Stack sx={{ width: { xs: "100%", sm: "auto" } }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="#002880">
                    {dayjs(agenda.start_at).format(FORMAT_TIME)} -{" "}
                    {dayjs(agenda.end_at).add(2, "hour").format(FORMAT_TIME)}
                  </Typography>
                  <Typography variant="body2">{dayjs().format(FORMAT_DATE_STANDARD)}</Typography>
                </Stack>
                <Stack className="transition-all duration-200" flex={1} width="100%">
                  <Typography variant="h6" fontWeight="bold" color="#0038B2">
                    {agenda.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    height={index !== expanded ? "fit-content" : 0}
                    color="text.secondary"
                    maxWidth={{ xs: "100%", sm: 500 }}
                    className="line-clamp-1 transition-all duration-200"
                    textOverflow={"ellipsis"}
                  >
                    {agenda.description}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: expanded === index ? "#FFAB00" : "#0050FF",
                    borderRadius: 9999,
                    alignSelf: { xs: "flex-end", sm: "center" },
                  }}
                >
                  <ExpandMore
                    style={{
                      color: "#FFFFFF",
                      transform: expanded === index ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease-in-out",
                      width: 18,
                      height: 18,
                    }}
                  />
                </Box>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{agenda.description}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Stack>
  );
};

export default ClassRoomAgenda;

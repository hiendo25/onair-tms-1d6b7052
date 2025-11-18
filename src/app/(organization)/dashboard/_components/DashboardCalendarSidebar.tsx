"use client";

import React from "react";
import dayjs from "dayjs";
import {
  Avatar,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { CalendarSidebar, CalenderStatus } from "@/shared/ui/calendar";
import { mockEvents } from "./mock/dashboardData";

const DashboardCalendarSidebar = () => {
  const [date, setDate] = React.useState(dayjs().format("YYYY-MM-DD"));
  const [statusFilter, setStatusFilter] = React.useState<CalenderStatus[]>([]);

  const sortedEvents = React.useMemo(
    () =>
      [...mockEvents].sort(
        (a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf(),
      ),
    [],
  );

  const filteredEvents = React.useMemo(
    () =>
      statusFilter.length === 0
        ? sortedEvents
        : sortedEvents.filter((event) => statusFilter.includes(event.status)),
    [sortedEvents, statusFilter],
  );

  const selectedDateEvents = React.useMemo(
    () =>
      filteredEvents.filter((event) =>
        dayjs(event.start).isSame(dayjs(date), "day"),
      ),
    [filteredEvents, date],
  );

  const calendarMethods = React.useMemo(
    () => ({
      date,
      filters: {
        state: { status: statusFilter },
        setField: (field: "status", value: CalenderStatus[]) => {
          if (field === "status") {
            setStatusFilter(value);
          }
        },
      },
      onChangeDate: (newDate: string) => setDate(newDate),
      onOpenForm: () => {
        // Placeholder action - replace with real modal or drawer if needed.
        console.log("Open calendar form (demo).");
      },
    }),
    [date, statusFilter],
  );

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "white",
        borderRadius: 2,
        border: "1px solid #edf1f7",
      }}
    >
      <Stack>
        <CalendarSidebar
          events={filteredEvents}
          calendarMethods={calendarMethods}
        />
        <Stack spacing={1.5} p={2}>
          <Typography variant="subtitle1" fontWeight={600} className="text-sm">
            Lớp học trong ngày {dayjs(date).format("DD/MM/YYYY")}
          </Typography>
          <Stack spacing={1.25}>
            {selectedDateEvents.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: "#F5F8FF",
                  border: "none",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Không có lớp học nào trong ngày đã chọn.
                </Typography>
              </Paper>
            ) : (
              selectedDateEvents.map((event) => (
                <Paper
                  key={event.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: "#F5F8FF",
                    border: "none"
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 1.2,
                        bgcolor: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      <Stack spacing={0} alignItems="center" sx={{ lineHeight: 1 }}>
                        <Typography variant="h6" fontWeight={600} className="text-xl">
                          {dayjs(event.start).format("DD")}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          className="text-xs"
                        >
                          {dayjs(event.start).format("dd")}
                        </Typography>
                      </Stack>
                    </Box>
                    <Stack spacing={0.5} flex={1}>
                      <Typography variant="subtitle2" fontWeight={700} className="line-clamp-1">
                        {event.title}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={event.mode}
                          color={event.mode === "Online" ? "primary" : "success"}
                          sx={{ height: 24, fontWeight: 600 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {event.time}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Avatar
                      src={event.avatarUrl}
                      alt="Giảng viên"
                      sx={{ width: 32, height: 32 }}
                    />
                  </Stack>
                </Paper>
              ))
            )}
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default DashboardCalendarSidebar;

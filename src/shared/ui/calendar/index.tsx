"use client";

import React from "react";
import { groupBy } from "lodash";

import { useSearchParams } from "next/navigation";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import {
    Box,
    NoSsr,
    Checkbox,
    FormGroup,
    CheckboxProps,
    LinearProgress,
    FormControlLabel,
} from "@mui/material";

import dayjs from "dayjs";

export enum CalenderStatus {
    PENDING = "PENDING",
    AVAILABLE = "AVAILABLE",
    APPROVED = "APPROVED",
    DISABLED = "DISABLED",
}

export const CALENDER_SPECS = {
    [CalenderStatus.AVAILABLE]: {
        color: "#9723f9",
        colorName: "secondary",
        label: "Chưa được đặt",
        value: CalenderStatus.AVAILABLE,
    },
    [CalenderStatus.PENDING]: {
        color: "#FFAB00",
        colorName: "warning",
        label: "Chờ duyệt",
        value: CalenderStatus.PENDING,
    },
    [CalenderStatus.APPROVED]: {
        color: "#00B8D9",
        colorName: "info",
        label: "Đã duyệt",
        value: CalenderStatus.APPROVED,
    },
    [CalenderStatus.DISABLED]: null,
};


const ROUTE_PARAMS = {
    PROJECT_ID: "projectId",
    FRAME_ID: "frameId",
    STATUS_FRAME: "status_frame",
    SELECTED_DATE: "selectedDate",
    TYPE: "type",
    CONTENT_MODERATION_ID: "contentModerationId",
    REFUND_ID: "refundId",
    QUERY: "q",
    STATUS: "status",
    PAGE: "page",
};

interface PropTypes {
    events: any[];
    loading?: boolean;
    calendarMethods: any;
}

export const CalendarSidebar = (props: PropTypes) => {
    const { events, loading, calendarMethods } = props;
    const queryParams = useSearchParams();

    const { date, filters, onChangeDate, onOpenForm } = calendarMethods;

    const dataFiltered = React.useMemo(() => {
        if (filters.state.status.length === 0) {
            return events;
        }
        return events.filter((el: any) => {
            return filters.state.status.includes(el?.status);
        });
    }, [events, filters.state.status]);

    const dataGroup = React.useMemo(() => {
        return groupBy(
            dataFiltered?.filter((el: any) => (el?.frames?.length ?? 0) > 0) ?? [],
            ({ start }) => dayjs(start).format("YYYY/MM/DD"),
        );
    }, [dataFiltered]);

    const hasStatusFrame = Boolean(queryParams.get(ROUTE_PARAMS.STATUS_FRAME));

    const handleChangeStatus = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const params = new URLSearchParams(window.location.search);
            if (params.get(ROUTE_PARAMS.STATUS_FRAME)) {
                params.delete(ROUTE_PARAMS.STATUS_FRAME);
                const newUrl = `${window.location.pathname}?${params.toString()}`;
                window.history.replaceState(null, "", newUrl);
                filters.setField("status", []);
            }
            if (!filters.state.status.includes(e.target.value)) {
                filters.setField("status", [...filters.state.status, e.target.value]);

                return;
            }
            filters.setField(
                "status",
                filters.state.status.filter((el: string) => el !== e.target.value),
            );
        },
        [filters],
    );

    return (
        <>
            {/* <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Button
                    variant="outlined"
                    onClick={() => onChangeDate(dayjs().format("YYYY-MM-DD"))}
                >
                    Hôm nay
                </Button>
                <Button
                    variant="contained"
                    onClick={onOpenForm}
                    color="primary"
                >
                    Tạo lịch trống
                </Button>
            </Stack> */}
            <NoSsr>
                <StaticDatePicker
                    loading={loading}
                    renderLoading={() => (
                        <LinearProgress
                            color="inherit"
                            sx={{
                                top: 0,
                                left: "5%",
                                width: "90%",
                                height: 2,
                                borderRadius: 0,
                                position: "absolute",
                            }}
                        />
                    )}
                    slots={{
                        toolbar: () => null,
                        actionBar: () => null,
                        day: (cell) => {
                            const els = dataGroup[dayjs(cell.day).format("YYYY/MM/DD")] ?? [];
                            const indicatorColor =
                                (els.find((el: any) => el.status === CalenderStatus.APPROVED) &&
                                    CALENDER_SPECS[CalenderStatus.APPROVED]?.color) ||
                                (els.find((el: any) => el.status === CalenderStatus.PENDING) &&
                                    CALENDER_SPECS[CalenderStatus.PENDING]?.color) ||
                                (els.find((el: any) => el.status === CalenderStatus.AVAILABLE) &&
                                    CALENDER_SPECS[CalenderStatus.AVAILABLE]?.color) ||
                                "#16a34a";

                            return (
                                <Stack
                                    alignItems="center"
                                    justifyContent="center"
                                    position="relative"
                                >
                                    <PickersDay {...cell} />
                                    {els?.length > 0 && (
                                        <Box
                                            position="absolute"
                                            bottom={4}
                                            width={4}
                                            height={4}
                                            borderRadius="50%"
                                            sx={{
                                                bgcolor: cell.selected ? "#fff" : indicatorColor,
                                                border: `1px solid ${indicatorColor}`,
                                                boxShadow: cell.selected
                                                    ? `0 0 0 1px ${indicatorColor}`
                                                    : "none",
                                            }}
                                        />
                                    )}
                                </Stack>
                            );
                        },
                    }}
                    dayOfWeekFormatter={(v) => v.format("ddd")}
                    defaultValue={dayjs(date)}
                    value={dayjs(date)}
                    onChange={(newValue) => {
                        onChangeDate(dayjs(newValue).format("YYYY-MM-DD"));
                    }}
                    showDaysOutsideCurrentMonth
                    sx={{
                        borderRadius: 1.5,
                        bgcolor: "white",
                        minWidth: "unset",
                        '& .MuiDateCalendar-root': {
                            height: 300,
                        },
                        "& .MuiPickersCalendarHeader-label": {
                            textTransform: "capitalize",
                        },
                        "& .onair-5wchs2-MuiDateCalendar-root": {
                            width: "100%"
                        },
                    }}
                />
            </NoSsr>
        </>
    );
};

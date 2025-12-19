"use client";
import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { viVN } from "@mui/x-date-pickers/locales";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import Link from "next/link";

import { ClassRoomRuntimeStatusFilter, ClassRoomStatusFilter, ClassRoomTypeFilter, ClassSessionModeFilter } from "@/repository/class-room/type";
import { SearchIcon } from "@/shared/assets/icons";
import { SelectOption } from "@/shared/ui/form/SelectOption";
import { RUNTIME_STATUS_OPTIONS, SESSION_MODE_OPTIONS, TYPE_OPTIONS } from "../constants";
interface ClassRoomFiltersProps {
  search: string;
  startDate?: string | null;
  endDate?: string | null;
  runtimeStatus: ClassRoomRuntimeStatusFilter;
  status: ClassRoomStatusFilter;
  type: ClassRoomTypeFilter;
  sessionMode: ClassSessionModeFilter;
  onSearchChange: (value: string) => void;
  onDateChange: (field: "startDate" | "endDate", value: string | null) => void;
  onRuntimeStatusChange: (runtimeStatus: ClassRoomRuntimeStatusFilter) => void;
  onStausChange: (status: ClassRoomStatusFilter) => void;
  onTypeChange: (status: ClassRoomTypeFilter) => void;
  onSessionModeChange: (mode: ClassSessionModeFilter) => void;
}

const parseDate = (value?: string | null): Dayjs | null => {
  if (!value) {
    return null;
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

export default function ClassRoomFilters({
  search,
  startDate,
  endDate,
  runtimeStatus,
  status,
  type,
  sessionMode,
  onTypeChange,
  onSessionModeChange,
  onSearchChange,
  onDateChange,
  onRuntimeStatusChange,
  onStausChange,
}: ClassRoomFiltersProps) {
  const fieldBaseSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#fff",
      borderRadius: 1.5,
      "& fieldset": { borderColor: "divider" },
      "&:hover fieldset": { borderColor: "primary.light" },
      "&.Mui-focused fieldset": {
        borderColor: "primary.main",
        boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.12)",
      },
    },
  };

  const selectSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#fff",
      borderRadius: 1.5,
      "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.light" },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "primary.main",
        boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.12)",
      },
    },
  };

  const filterItemSx = {
    display: "flex",
    flexDirection: "column",
    gap: 0.75,
    minWidth: 0,
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="vi"
      localeText={viVN.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(auto-fit, minmax(220px, 1fr))",
            sm: "repeat(auto-fit, minmax(200px, 1fr))",
            lg: "repeat(7, minmax(0, 1fr))",
          },
          gap: { xs: 1.5, md: 2 },
          alignItems: "end",
          p: { xs: 2, md: 2.5 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "#f8fafc",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        <Box sx={filterItemSx}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Tìm kiếm
          </Typography>
          <TextField
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm kiếm..."
            size="small"
            fullWidth
            sx={fieldBaseSx}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        <Box sx={filterItemSx}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Ngày bắt đầu
          </Typography>
          <DatePicker
            value={parseDate(startDate)}
            onChange={(newValue) => onDateChange("startDate", newValue ? newValue.toISOString() : null)}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                sx: fieldBaseSx,
              },
            }}
          />
        </Box>
        <Box sx={filterItemSx}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Ngày kết thúc
          </Typography>
          <DatePicker
            value={parseDate(endDate)}
            onChange={(newValue) => onDateChange("endDate", newValue ? newValue.toISOString() : null)}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                sx: fieldBaseSx,
              },
            }}
          />
        </Box>
        <Box sx={{ ...filterItemSx, ...selectSx }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Trạng thái diễn ra
          </Typography>
          <SelectOption
            onChange={(runtimeStatus) => onRuntimeStatusChange(runtimeStatus)}
            value={runtimeStatus}
            options={RUNTIME_STATUS_OPTIONS}
            size="small"
          />
        </Box>
        {/* <Box>
            <SelectOption
              inputLabel="Trạng thái xuất bản"
              onChange={(status) => onStausChange(status)}
              value={status}
              options={PUBLICATION_STATUS_OPTIONS}
              size="small"
            />
          </Box> */}
        <Box sx={{ ...filterItemSx, ...selectSx }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Loại lớp học
          </Typography>
          <SelectOption
            onChange={(type) => onTypeChange(type)}
            value={type}
            options={TYPE_OPTIONS}
            size="small"
          />
        </Box>
        <Box sx={{ ...filterItemSx, ...selectSx }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Hình thức buổi học
          </Typography>
          <SelectOption
            onChange={(mode) => onSessionModeChange(mode)}
            value={sessionMode}
            options={SESSION_MODE_OPTIONS}
            size="small"
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: { xs: "stretch", lg: "flex-end" },
            gridColumn: { xs: "1 / -1", lg: "auto" },
          }}
        >
          <Link href="/admin/class-room/create" style={{ width: "100%" }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                height: 42,
                borderRadius: 1.5,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "0 6px 14px rgba(25, 118, 210, 0.2)",
                },
              }}
            >
              Tạo lớp học
            </Button>
          </Link>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

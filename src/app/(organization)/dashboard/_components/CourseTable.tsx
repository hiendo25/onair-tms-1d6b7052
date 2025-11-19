import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";

import { courseRows } from "./mock/dashboardData";
import { panelSx } from "./mock/panelSx";

const CourseTable = () => (
  <Paper sx={{ ...panelSx, p: 2.5 }}>
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      spacing={1.5}
      alignItems={{ xs: "flex-start", sm: "center" }}
      sx={{ mb: 2 }}
    >
      <Typography variant="h6" fontWeight={600}>
        Lớp học trong tháng
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" size="small" color="primary">
          Tạo khảo sát
        </Button>
        <Button variant="outlined" size="small" color="primary">
          Tạo môn học
        </Button>
        <Button variant="contained" size="small">
          Tạo lớp học
        </Button>
      </Stack>
    </Stack>

    <Box
      sx={{
        borderRadius: 1.5,
        overflow: "hidden",
        border: "1px solid #e7ebf3",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 0.8fr 1.2fr 1fr",
          bgcolor: "#f8fafc",
          px: 2,
          py: 1.5,
          gap: 1,
        }}
      >
        {["Tên lớp học", "Loại lớp học", "Học viên", "Giảng viên", "Thời gian diễn ra"].map(
          (col) => (
            <Typography
              key={col}
              variant="body2"
              color="text.secondary"
              fontWeight={700}
            >
              {col}
            </Typography>
          ),
        )}
      </Box>

      <Stack spacing={0} divider={<Divider />}>
        {courseRows.map((row) => (
          <Box
            key={row.id}
            sx={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr 0.8fr 1.2fr 1fr",
              px: 2,
              py: 1.75,
              gap: 1,
              alignItems: "center",
              bgcolor: "#fff",
            }}
          >
            <Stack spacing={0.6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={row.label}
                  size="small"
                  sx={{
                    bgcolor: row.mode === "Trực tuyến (Online)" ? "#FF662B1F" : "#0050FF29",
                    color: row.mode === "Trực tuyến (Online)" ? "#9A3E1A" : "#0038B2",
                    height: 24,
                    "& .MuiChip-label": {
                      color: "unset",
                    },
                  }}
                />
              </Stack>
              <Typography className="font-normal text-xs text-[#212B36] line-clamp-2">
                {row.name}
              </Typography>
            </Stack>

            <Chip
              label={row.mode}
              size="small"
              sx={{
                bgcolor: row.mode === "Trực tuyến (Online)" ? "#FF662B29" : "#9723F93D",
                color: row.mode === "Trực tuyến (Online)" ? "#9A3E1A" : "#6E05C6",
                height: 26,
                justifySelf: "flex-start",
                "& .MuiChip-label": {
                  color: "unset",
                },
              }}
            />

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <PeopleAltOutlinedIcon className="w-4 h-4" />
              <Typography className="font-normal text-xs text-[#212B36]">
                {row.students}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar src={row.avatar} alt={row.lecturer} sx={{ width: 24, height: 24 }} />
              <Typography className="font-normal text-xs text-[#212B36]">
                {row.lecturer}
              </Typography>
            </Stack>

            <Stack spacing={0.5}>
              {row.times.map((time) => (
                <Typography key={time} className="font-normal text-xs text-[#212B36]">
                  {time}
                </Typography>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  </Paper>
);

export default CourseTable;

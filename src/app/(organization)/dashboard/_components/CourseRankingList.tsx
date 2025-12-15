import * as React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

import TimeRangeSwitcher from "./TimeRangeSwitcher";
import { courseRankingByRange, TimeRange } from "./mock/dashboardData";
import { panelSx } from "./mock/panelSx";

type CourseListItemProps = {
  text: string;
  color: any;
  rating: number;
  accent: "primary" | "danger";
};

const MAX_RATING = 5;

const CourseListItem = ({ text, color, rating, accent }: CourseListItemProps) => {
  const trackColor = accent === "primary" ? "#dbeafe" : "#fee2e2";
  const percentage = (rating / MAX_RATING) * 100;
  const displayRating = Number.isInteger(rating) ? rating.toFixed(0) : rating.toFixed(1);

  return (
    <Stack spacing={0.75}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body2" color="text.primary" fontWeight={600} sx={{ flex: 1 }}>
          {text}
        </Typography>
        <Typography
          variant="body2"
          fontWeight={700}
          color={accent === "primary" ? "primary.main" : "#ef4444"}
        >
          {displayRating}/{MAX_RATING}
        </Typography>
      </Stack>
      <Box sx={{ height: 6, bgcolor: trackColor, borderRadius: 999 }}>
        <Box sx={{ width: `${percentage}%`, height: "100%", borderRadius: 999, bgcolor: color }} />
      </Box>
    </Stack>
  );
};

type Props = {
  variant?: "top" | "low";
};

const CourseRankingList = ({ variant = "top" }: Props) => {
  const [range, setRange] = React.useState<TimeRange>("week");
  const courses = React.useMemo(
    () => courseRankingByRange[range][variant],
    [range, variant],
  );
  const palette = variant === "low" ? "#FF3324" : "#0050FF";
  const accent: "primary" | "danger" = variant === "low" ? "danger" : "primary";
  const title =
    variant === "low" ? "Top lớp học đánh giá thấp nhất" : "Top lớp học đánh giá cao nhất";

  return (
    <Paper sx={{ ...panelSx, p: 2.5, height: "100%" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        <TimeRangeSwitcher value={range} onChange={setRange} />
      </Stack>
      <Stack spacing={1.75}>
        {courses.map((course, index) => (
          <CourseListItem
            key={`${course.title}-${index}`}
            text={course.title}
            rating={course.rating}
            color={palette}
            accent={accent}
          />
        ))}
      </Stack>
    </Paper>
  );
};

export default CourseRankingList;

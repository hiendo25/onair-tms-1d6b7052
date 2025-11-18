import * as React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

import { lowRatedCourses, topRatedCourses } from "./mock/dashboardData";
import { panelSx } from "./mock/panelSx";

type CourseListItemProps = {
  text: string;
  color: any;
  rating: string;
  students: string;
};

const CourseListItem = ({ text, color, rating, students }: CourseListItemProps) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    <Box
      sx={{
        width: 12,
        height: 12,
        borderRadius: "3px",
        bgcolor: color,
      }}
    />
    <Typography variant="body2" color="text.primary" sx={{ flex: 1 }}>
      {text}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {students}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {rating}
    </Typography>
  </Stack>
);

type RankingBlockProps = {
  title: string;
  courses: typeof topRatedCourses;
};

const cardColors = ["#fca5ff", "#a5b4fc", "#7ce1ff", "#87a5ff", "#b1c5ff"];

const RankingBlock = ({ title, courses }: RankingBlockProps) => (
  <Paper sx={{ ...panelSx, p: 2.5 }}>
    <Typography variant="h6" fontWeight={700} sx={{ mb: 1.25 }}>
      {title}
    </Typography>
    <Stack spacing={1.25}>
      {courses.map((course, index) => (
        <CourseListItem
          key={course.title}
          text={course.title}
          students={course.students}
          rating={course.rating}
          color={cardColors[index]}
        />
      ))}
    </Stack>
  </Paper>
);

const CourseRankingList = () => (
  <Stack spacing={2}>
    <RankingBlock title="Top lớp học đánh giá cao nhất" courses={topRatedCourses} />
    <RankingBlock title="Top lớp học đánh giá thấp nhất" courses={lowRatedCourses} />
  </Stack>
);

export default CourseRankingList;

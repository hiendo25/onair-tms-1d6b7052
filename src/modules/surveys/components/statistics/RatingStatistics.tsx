import React from "react";
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { Star01Icon } from "@/shared/assets/icons";

export interface RatingStatisticsProps {
  stats: {
    ratings: { rating: number; ratingCount: number }[];
    subtotal: number;
    averageRating: number;
  };
}
function RatingStatistics({ stats }: RatingStatisticsProps) {
  const { ratings, averageRating, subtotal } = stats;

  const sortedRatings = [...ratings].sort((a, b) => b.rating - a.rating);

  const getPercent = (count: number) => {
    return Math.floor((count * 100) / subtotal);
  };
  return (
    <Box>
      <Box sx={{ backgroundColor: "grey.50", p: 2, borderRadius: 1, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Điểm trung bình
          </Typography>
          <Typography variant="h4" color="primary.main" fontWeight="bold">
            {averageRating}
          </Typography>
        </Stack>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.50" }}>
              <TableCell>Mức điểm</TableCell>
              <TableCell align="center">Số lượng</TableCell>
              <TableCell align="center">Tỷ lệ (%)</TableCell>
              <TableCell>Phân bố</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRatings.map((rating) => (
              <TableRow key={rating.rating}>
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {Array.from({ length: rating.rating }).map((_, i) => (
                      <Star01Icon key={i} className="fill-amber-500 stroke-amber-500" />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell align="center">{rating.ratingCount}</TableCell>
                <TableCell align="center">{getPercent(rating.ratingCount)}%</TableCell>
                <TableCell>
                  <div className="bg-gray-100 w-full rounded-xl overflow-hidden">
                    <Box
                      sx={{
                        height: 16,
                        width: `${getPercent(rating.ratingCount)}%`,
                        maxWidth: "100%",
                        backgroundColor: "warning.main",
                        borderRadius: 1,
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: "grey.50", fontWeight: "bold" }}>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  Tổng cộng
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" fontWeight="bold">
                  {stats.subtotal}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" fontWeight="bold">
                  100%
                </Typography>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
export default RatingStatistics;

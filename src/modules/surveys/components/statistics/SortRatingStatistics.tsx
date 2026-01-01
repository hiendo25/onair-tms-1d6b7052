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

export interface SortRatingStatisticsProps {
  stats: {
    options: {
      optionId: string;
      optionText: string;
      score: number;
    }[];
    subtotal: number;
    totalScore: number;
  };
}
const SortRatingStatistics: React.FC<SortRatingStatisticsProps> = ({ stats: { options, totalScore } }) => {
  const getPercentScore = (score: number) => {
    if (score === 0 || totalScore === 0) return 0;
    return Math.floor((score * 100) / totalScore);
  };
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "grey.50" }}>
            <TableCell>Lựa chọn</TableCell>
            <TableCell align="center">Điểm đánh giá</TableCell>
            <TableCell>% trên tổng số lượt sắp xếp đánh giá</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {options.map((stat) => (
            <TableRow key={stat.optionId}>
              <TableCell>{stat.optionText}</TableCell>
              <TableCell align="center">{stat.score}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" sx={{ minWidth: 50 }}>
                    {`${getPercentScore(stat.score)}%`}
                  </Typography>
                  <div className="bg-gray-100 w-full rounded-xl overflow-hidden">
                    <Box
                      sx={{
                        height: 16,
                        width: `${getPercentScore(stat.score)}%`,
                        maxWidth: "100%",
                        backgroundColor: "success.main",
                        borderRadius: 1,
                      }}
                    />
                  </div>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default SortRatingStatistics;

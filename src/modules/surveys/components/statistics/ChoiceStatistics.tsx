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

export interface ChoiceStatisticsProps {
  stats: {
    options: {
      optionId: string;
      optionText: string;
      count: number;
    }[];
    subtotal: number;
  };
}
const ChoiceStatistics: React.FC<ChoiceStatisticsProps> = ({ stats: { options, subtotal } }) => {
  const getPercent = (count: number) => {
    if (count === 0 || subtotal === 0) return 0;
    return Math.floor((count * 100) / subtotal);
  };
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "grey.50" }}>
            <TableCell>Lựa chọn</TableCell>
            <TableCell align="center">Lượt chọn</TableCell>
            <TableCell>% trên tổng số người trả lời</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {options.map((stat) => (
            <TableRow key={stat.optionId}>
              <TableCell>{stat.optionText}</TableCell>
              <TableCell align="center">{stat.count}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" sx={{ minWidth: 50 }}>
                    {`${getPercent(stat.count)}%`}
                  </Typography>
                  <div className="bg-gray-100 w-full rounded-xl overflow-hidden">
                    <Box
                      sx={{
                        height: 16,
                        width: `${getPercent(stat.count)}%`,
                        maxWidth: "100%",
                        backgroundColor: "primary.main",
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
export default ChoiceStatistics;

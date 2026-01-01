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

export interface YesNoStatisticsProps {
  stats: {
    yes: {
      count: number;
      percentage: number;
    };
    no: {
      count: number;
      percentage: number;
    };
    subtotal: number;
  };
}
type YesNoType = "yes" | "no";
const YesNoStatistics: React.FC<YesNoStatisticsProps> = ({ stats }) => {
  const getOptionYesNoName = (type: "yes" | "no") => {
    return {
      yes: "có",
      no: "Không",
    }[type];
  };
  const OPTIONS: YesNoType[] = ["yes", "no"];
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
          {OPTIONS.map((opt) => (
            <TableRow key={opt}>
              <TableCell>{getOptionYesNoName(opt as YesNoType)}</TableCell>
              <TableCell align="center">{stats[opt].count}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" sx={{ minWidth: 50 }}>
                    {`${stats[opt].percentage}%`}
                  </Typography>
                  <div className="bg-gray-100 w-full rounded-xl overflow-hidden">
                    <Box
                      sx={{
                        height: 16,
                        width: `${stats[opt].percentage}%`,
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
export default YesNoStatistics;

import { Box } from "@mui/material";
import dayjs from "dayjs";

import TableData, { TableDataProps } from "@/shared/ui/TableData";

type ResponseItem = { content: string; createdAt: string; id: string; fullName: string; avatar?: string };
export interface TextStatisticsProps {
  responses: ResponseItem[];
}
function TextStatistics({ responses }: TextStatisticsProps) {
  const tableColumn: TableDataProps<ResponseItem>["columns"] = [
    {
      id: "content",
      field: "content",
      headerName: "Câu trả lời",
    },
    {
      id: "createdAt",
      field: "createdAt",
      headerName: "Ngày gửi",
      renderCell(value, { createdAt }) {
        return dayjs(createdAt).format("DD/MM/YYYY");
      },
    },
  ];
  return (
    <TableData
      bordered={false}
      showRowCount
      rows={responses}
      columns={tableColumn}
      pagination={{
        total: responses.length,
        page: 1,
        pageSize: 5,
        perPageOptions: [5, 10, 15, 20],
      }}
    />
  );
}
export default TextStatistics;

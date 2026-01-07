import { Box, Typography } from "@mui/material";
import Image from "next/image";

import { GetLevelsResponse } from "@/repository/level";
import { TableDataProps } from "@/shared/ui/TableData";

const getLevelColumns = (): TableDataProps<NonNullable<GetLevelsResponse["data"]>[number]>["columns"] => [
  {
    id: "title",
    field: "title",
    headerName: "Tên danh hiệu",
    renderCell(value, { icon, title }) {
      if (!icon) return <Typography variant="body2" component="p">
        {title}
      </Typography>;
      return <Box className="flex items-center gap-1">
        <Image src={icon} alt={title} width={32} height={32} />
        <Typography variant="body2" component="p">
          {title}
        </Typography>
      </Box>;
    },
  },
  {
    id: "score_required",
    field: "score_required",
    headerName: "Điều kiện đạt",
    renderCell(value, { score_required }) {
      return `${score_required.toLocaleString()} điểm`;
    },
  },
];
export { getLevelColumns };

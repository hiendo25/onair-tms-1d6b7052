import { Chip, InputAdornment } from "@mui/material";
import dayjs from "dayjs";
import Image from "next/image";

import { GetLevelsResponse } from "@/repository/level";
import { CheckCircleIcon, CloseIcon } from "@/shared/assets/icons";
import { TableDataProps } from "@/shared/ui/TableData";

const getLevelColumns = (): TableDataProps<NonNullable<GetLevelsResponse["data"]>[number]>["columns"] => [
  {
    id: "icon",
    field: "icon",
    headerName: "Huy hiệu",
    renderCell(value, { icon, title }) {
      if (!icon) return <span>no icon</span>;
      return <Image src={icon} alt={title} width={48} height={48} />;
    },
  },
  {
    id: "title",
    field: "title",
    headerName: "Tên danh hiệu",
  },
  {
    id: "score_required",
    field: "score_required",
    headerName: "Điểm số yêu cầu",
    renderCell(value, { score_required }) {
      return score_required.toLocaleString();
    },
  },
  {
    id: "status",
    field: "status",
    headerName: "Trạng thái",
    width: 180,
    renderCell(value, { status }) {
      return status === "active" ? (
        <>
          <Chip label="Đang kích hoạt" color="success" variant="filled" />
        </>
      ) : (
        <>
          <Chip label="Ngừng kích hoạt" color="error" variant="filled" />
        </>
      );
    },
  },
  {
    id: "created_by",
    field: "created_by",
    headerName: "Người tạo",
    renderCell(value, row) {
      return row.createdBy.profiles?.full_name;
    },
  },
  {
    id: "created_at",
    field: "created_at",
    headerName: "Ngày tạo",
    renderCell(value, { created_at }) {
      return dayjs(created_at).format("DD/MM/YYYY, HH:mm");
    },
  },
];
export { getLevelColumns };

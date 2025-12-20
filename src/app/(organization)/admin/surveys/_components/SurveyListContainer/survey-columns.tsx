import { GetSurveysResponse } from "@/repository/surveys";
type SurveyRow = NonNullable<GetSurveysResponse["data"]>[number];
import { Chip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { get } from "lodash";

import { TableDataProps } from "@/shared/ui/TableData";

export const surveyColumns: TableDataProps<SurveyRow>["columns"] = [
  {
    id: "title",
    field: "title",
    headerName: "Tên khảo sát",
    renderCell(value, { title, description }) {
      return (
        <div>
          <Typography className="text-sm font-semibold">{title}</Typography>
          <Typography className="text-xs line-clamp-2 text-gray-600" variant="body2">
            {description}
          </Typography>
        </div>
      );
    },
  },
  {
    id: "questions",
    field: "questions",
    headerName: "SL câu hỏi",
    width: 120,
    renderCell(value, { questions }) {
      const question = questions[0];
      return (
        <Chip
          color="default"
          size="small"
          variant="filled"
          label={question ? question.count : "--"}
          className="w-6 h-6 min-h-6 text-gray-900"
        />
      );
    },
  },
  {
    id: "created_by",
    field: "created_by",
    headerName: "Người tạo",
    renderCell(value, { createdBy }) {
      const owner = get(createdBy, "profiles");
      return <Typography className="font-semibold text-sm">{owner ? owner.full_name : "--"}</Typography>;
    },
    width: 200,
  },
  {
    id: "created_at",
    field: "created_at",
    headerName: "Ngày tạo",
    renderCell(value, row) {
      return dayjs(row.created_at).format("HH:mm, DD/MM/YYYY");
    },
    width: 180,
  },
];

import React from "react";
import { Typography } from "@mui/material";
import dayjs from "dayjs";

import { XCircleIcon } from "@/shared/assets/icons";
interface EmployeeImportItemProps {
  index: number;
  fullName: string;
  email: string;
  type: string;
  code: string;
  phoneNumber: string;
  gender: string;
  startAt: string;
}
const EmployeeImportItem: React.FC<EmployeeImportItemProps> = ({ index, code, fullName, email, gender, startAt }) => {
  return (
    <div className="employee-import-item">
      <div className="flex gap-4">
        <div className="employee-import-name w-10">
          <Typography className="text-sm">{index + 1}</Typography>
        </div>
        <div className="employee-import-name w-24">
          <Typography className="text-sm">{code}</Typography>
        </div>
        <div className="employee-import-name flex-1">
          <Typography className="text-sm">{fullName}</Typography>
        </div>
        <div className="employee-import-name flex-1">
          <Typography className="text-sm">{email}</Typography>
        </div>
        <div className="employee-import-name w-20">
          <Typography className="text-sm">{gender}</Typography>
        </div>
        <div className="employee-import-name w-20">
          <Typography className="text-sm">
            {startAt ? dayjs(startAt, "YYYY-MM-DD").format("DD/MM/YYYY") : null}
          </Typography>
        </div>
        <div className="employee-import-name w-40">
          <XCircleIcon className="w-4 h-4" color="red" />
        </div>
      </div>
    </div>
  );
};
export default EmployeeImportItem;

import React, { memo } from "react";
import { useOptimistic } from "react";
import { CircularProgress, Stack, Typography } from "@mui/material";

import { EmployeeType } from "@/model/employee.model";
import { Gender } from "@/model/profile.model";
import { AlertCircleIcon, CheckCircleIcon, XCircleIcon } from "@/shared/assets/icons";
import TableData, { TableDataProps } from "@/shared/ui/TableData";

type EmployeeThreadStatus = "idle" | "pending" | "success" | "error";

type EmployeeThreadItem = {
  index: number;
  code: string;
  fullName: string;
  dateOfBirth: string;
  startAt: string;
  gender: Gender;
  phoneNumber: string;
  email: string;
  fieldErrors?: { path: string; message: string }[];
  existedEmail: boolean;
  existedCode: boolean;
  status: EmployeeThreadStatus;
  message?: string;
  type: EmployeeType;
};

type EmployeeThreadUpdateState = {
  index: number;
  status: EmployeeThreadStatus;
  message?: string;
};
export interface EmployeeImportThreadProps {
  threads: EmployeeThreadItem[];
  isLoading?: boolean;
}
const EmployeeImportThread: React.FC<EmployeeImportThreadProps> = ({ threads, isLoading = false }) => {
  const [optimisticEmployees, _] = useOptimistic<EmployeeThreadItem[], EmployeeThreadUpdateState>(
    threads,
    (state, updateThread) => {
      return state.map((item) => {
        return item.index === updateThread.index
          ? { ...item, status: updateThread.status, message: updateThread.message }
          : item;
      });
    },
  );

  const getErrorMessages = (errors: EmployeeThreadItem["fieldErrors"], path: string) => {
    return errors?.filter((err) => err.path === path);
  };

  const tableColumns: TableDataProps<EmployeeThreadItem>["columns"] = [
    {
      headerName: "STT",
      field: "index",
      id: "index",
      width: 60,
      renderCell(value, { index }) {
        return <Typography className="text-sm">{index + 1}</Typography>;
      },
    },
    {
      headerName: "Mã *",
      field: "code",
      id: "code",
      width: 80,
      renderCell(value, { code, fieldErrors, existedCode }) {
        const errors = getErrorMessages(fieldErrors, "code");
        return (
          <div>
            <Typography className="text-sm">{code}</Typography>
            {errors?.map((err, index) => (
              <Typography key={index} className="text-xs text-red-600">
                {err.message}
              </Typography>
            ))}
          </div>
        );
      },
    },
    {
      headerName: "Họ và tên *",
      field: "fullName",
      id: "fullName",
      renderCell(value, { fieldErrors, fullName }) {
        const errors = getErrorMessages(fieldErrors, "fullName");
        return (
          <div>
            <Typography className="text-sm">{fullName}</Typography>
            {errors?.map((err, index) => (
              <Typography key={index} className="text-xs text-red-600">
                {err.message}
              </Typography>
            ))}
          </div>
        );
      },
    },
    {
      headerName: "Email *",
      field: "email",
      id: "email",
      renderCell(value, { existedEmail, fieldErrors, email }) {
        const errors = getErrorMessages(fieldErrors, "email");
        return (
          <div>
            <Typography className="text-sm">{email}</Typography>
            {errors?.map((err, index) => (
              <Typography key={index} className="text-xs text-red-600">
                {err.message}
              </Typography>
            ))}
          </div>
        );
      },
    },
    {
      headerName: "Loại tài khoản *",
      field: "type",
      id: "type",
      width: 180,
      renderCell(value, { fieldErrors, type }) {
        const errors = getErrorMessages(fieldErrors, "employeeType");
        return (
          <div>
            <Typography className="text-sm">{type}</Typography>
            {errors?.map((err, index) => (
              <Typography key={index} className="text-xs text-red-600">
                {err.message}
              </Typography>
            ))}
          </div>
        );
      },
    },
    {
      headerName: "Số điện thoại",
      field: "phoneNumber",
      id: "phoneNumber",
      renderCell(value, row) {
        const errors = getErrorMessages(row.fieldErrors, "phoneNumber");
        return (
          <div>
            <Typography className="text-sm">{row.phoneNumber}</Typography>
            {errors?.map((err, index) => (
              <Typography key={index} className="text-xs text-red-600">
                {err.message}
              </Typography>
            ))}
          </div>
        );
      },
    },

    {
      headerName: "Ngày sinh",
      field: "dateOfBirth",
      id: "dateOfBirth",
      width: 160,
      renderCell(value, { fieldErrors, dateOfBirth }) {
        const errors = getErrorMessages(fieldErrors, "dateOfBirth");
        return (
          <div>
            <Typography className="text-sm">{dateOfBirth}</Typography>
            {errors?.map((err, index) => (
              <Typography key={index} className="text-xs text-red-600">
                {err.message}
              </Typography>
            ))}
          </div>
        );
      },
    },
    {
      headerName: "Giới tính",
      field: "gender",
      id: "gender",
      width: 120,
      renderCell(value, { gender, fieldErrors }) {
        const errors = getErrorMessages(fieldErrors, "gender");
        return (
          <div>
            <Typography className="text-sm">{gender}</Typography>
            {errors?.map((err, index) => (
              <Typography key={index} className="text-xs text-red-600">
                {err.message}
              </Typography>
            ))}
          </div>
        );
      },
    },
    {
      headerName: "Ngày làm việc",
      field: "startAt",
      id: "startAt",
      renderCell(value, { startAt, fieldErrors }) {
        const errors = getErrorMessages(fieldErrors, "startAt");
        return (
          <div>
            <Typography className="text-sm">{startAt}</Typography>
            {errors?.map((err, index) => (
              <Typography key={index} className="text-xs text-red-600">
                {err.message}
              </Typography>
            ))}
          </div>
        );
      },
    },
    {
      headerName: "Trạng thái",
      field: "status",
      id: "status",
      width: 180,
      renderCell(value, { status, existedCode, existedEmail, fieldErrors }) {
        if (fieldErrors?.length) {
          return (
            <Stack direction="row" gap={1} alignItems="center">
              <AlertCircleIcon color="red" className="w-4 h-4" />
              <Typography className="text-xs text-red-600">Không hợp lệ</Typography>
            </Stack>
          );
        }

        if (existedCode) {
          return (
            <Stack direction="row" gap={1} alignItems="center">
              <AlertCircleIcon color="red" className="w-4 h-4" />
              <Typography className="text-xs text-red-600">Code đã tồn tại trên hệ thống.</Typography>
            </Stack>
          );
        }
        if (existedEmail) {
          return (
            <Stack direction="row" gap={1} alignItems="center">
              <AlertCircleIcon color="red" className="w-4 h-4" />
              <Typography className="text-xs text-red-600">Email đã tồn tại trên hệ thống.</Typography>
            </Stack>
          );
        }

        return (
          <Stack direction="row" gap={1} alignItems="center">
            <CheckCircleIcon className="w-4 h-4" color="success" />
            <Typography className="text-xs text-green-600">Hợp lệ</Typography>
          </Stack>
        );
      },
    },
    {
      field: "action",
      id: "action",
      fixed: "right",
      width: 120,
      renderCell(value, { status }) {
        if (status === "pending") {
          return (
            <Stack direction="row" gap={1} alignItems="center">
              <CircularProgress size={16} />
              <Typography className="text-gray-600 text-sm">Đang tạo</Typography>
            </Stack>
          );
        }
        if (status === "success") {
          return (
            <Stack direction="row" gap={1} alignItems="center">
              <CheckCircleIcon className="w-4 h-4" color="success" />
              <Typography className="text-gray-600 text-sm ">Đã tạo</Typography>
            </Stack>
          );
        }
        if (status === "error") {
          return (
            <Stack direction="row" gap={1} alignItems="center">
              <XCircleIcon className="w-4 h-4" color="red" />
              <Typography className="text-gray-600 text-sm ">Lỗi</Typography>
            </Stack>
          );
        }
        return "--";
      },
    },
  ];

  return (
    <div className="employee-import-thread">
      <TableData
        bordered={false}
        rows={optimisticEmployees}
        rowKey="index"
        columns={tableColumns}
        ssr={false}
        pagination={{
          total: threads.length,
          pageSize: 50,
        }}
        minWidth={1600}
      />
    </div>
  );
};
export default memo(EmployeeImportThread);

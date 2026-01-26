"use client";
import React, { startTransition, useMemo, useState } from "react";
import { Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import useNotifications from "@/hooks/useNotifications/useNotifications";
import BranchSelector, { BranchSelectorProps } from "@/modules/branch/container/BranchSelector";
import DepartmentSelector, { DepartmentSelectorProps } from "@/modules/department/container/DepartmentSelector";
import { useCreateEmployeeMutation, useValidateImportEmployeeMutation } from "@/modules/employees/operations/mutation";
import { EmployeeParseItemWithValidate } from "@/services/employees/employee.dto";
import { AlertCircleIcon, CheckCircleIcon, UsersIcon2 } from "@/shared/assets/icons";
import { cn } from "@/utils";

import EmployeeImportThread from "./EmployeeImportThread";
import { EmployeeImportThreadProps } from "./EmployeeImportThread";
import FileDropzone from "./FileDropzone";

type EmployeeThreadItem = EmployeeImportThreadProps["threads"][number];

interface EmployeeImportProps {
  className?: string;
}
const EmployeeImport: React.FC<EmployeeImportProps> = () => {
  const router = useRouter();
  const notifications = useNotifications();

  const [threads, setThreads] = useState<EmployeeThreadItem[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>();
  const [selectedBranchId, setSelectedBranchId] = useState<string>();
  const { mutate, isPending: isLoadingList, data: dataValidated, error } = useValidateImportEmployeeMutation();
  const { mutateAsync: createEmployeeAsync } = useCreateEmployeeMutation();

  const isDisableButtonCreate = useMemo(() => {
    if (!threads.length) return true;
    return threads.some((item) => item.fieldErrors?.length || item.existedCode || item.existedEmail);
  }, [threads]);

  const employeeItems = useMemo(() => {
    const validItem: EmployeeParseItemWithValidate[] = [];
    const inValidItem: EmployeeParseItemWithValidate[] = [];
    dataValidated?.data.forEach((item) => {
      if (!item.errors && !item.existedCode && !item.existedEmail) {
        validItem.push(item);
      } else {
        inValidItem.push(item);
      }
    });
    return {
      validItem,
      inValidItem,
    };
  }, [dataValidated?.data]);

  const handleChangeInputFile = (file: File) => {
    mutate(file, {
      onSuccess(data) {
        const records = data.data.map<EmployeeThreadItem>((data, index) => ({
          index,
          code: data.code,
          dateOfBirth: data.dateOfBirth,
          fullName: data.fullName,
          startAt: data.startDate,
          gender: data.gender,
          phoneNumber: data.phoneNumber,
          email: data.email,
          type: data.employeeType,
          fieldErrors: data.errors,
          existedCode: data.existedCode,
          existedEmail: data.existedEmail,
          status: "idle",
        }));
        setThreads(records);
      },
      onError(error) {
        console.log(error);
        setThreads([]);
      },
    });
  };

  const handleUpdateThreadTasks = async () => {
    if (!selectedDepartmentId) return;

    threads.forEach((thread) => {
      setThreads((prev) => prev.map((item) => ({ ...item, status: "pending" })));
    });

    const tasks = threads.map((record, index) =>
      createEmployeeAsync({
        code: record.code,
        email: record.email,
        fullName: record.fullName,
        dateOfBirth: record.dateOfBirth,
        startAt: record.startAt,
        type: record.type,
        gender: record.gender,
        phoneNumber: record.phoneNumber,
        departmentId: selectedDepartmentId,
        branchId: selectedBranchId,
        managerId: undefined,
        roleId: undefined,
      })
        .then((res) => {
          startTransition(() => {
            setThreads((prev) =>
              prev.map((item, i) => (i === index ? { ...item, status: "success", message: "success" } : item)),
            );
          });
        })
        .catch((err) => {
          startTransition(() => {
            setThreads((prev) =>
              prev.map((item, i) => (i === index ? { ...item, status: "error", message: err.message } : item)),
            );
          });
        }),
    );

    Promise.allSettled(tasks).then(() => {
      console.log("All threads finished");
    });
  };

  const handleRemoveFile = () => {
    setThreads([]);
  };

  const handleSelectDepartment: DepartmentSelectorProps["onSelect"] = (departmentIds) => {
    setSelectedDepartmentId(departmentIds[0]);
  };

  const handleSelectBranch: BranchSelectorProps["onSelect"] = (branchIds) => {
    setSelectedBranchId(branchIds[0]);
  };
  return (
    <Box sx={{ py: 3 }}>
      <FileDropzone onChange={handleChangeInputFile} onRemove={handleRemoveFile} errorMessage={error?.message} />
      <div className="h-6"></div>

      {isLoadingList && <LinearProgress />}

      <div
        className={cn({
          hidden: !threads.length,
        })}
      >
        <div className="flex gap-4 mb-6">
          <Stack direction="row" gap={1} alignItems="center">
            <UsersIcon2 className="w-6 h-6" />
            <Typography>
              {`${employeeItems.validItem.length}/${employeeItems.validItem.length + employeeItems.inValidItem.length}`}{" "}
              hợp lệ.
            </Typography>
          </Stack>
          <div className="flex-1"></div>
          <div>
            <DepartmentSelector
              values={selectedDepartmentId ? [selectedDepartmentId] : undefined}
              onSelect={handleSelectDepartment}
            />
          </div>
          <div>
            <BranchSelector values={selectedBranchId ? [selectedBranchId] : undefined} onSelect={handleSelectBranch} />
          </div>
          <Button variant="contained" disabled={isDisableButtonCreate} onClick={handleUpdateThreadTasks}>
            Lưu danh sách
          </Button>
        </div>
        <EmployeeImportThread threads={threads} />
      </div>
    </Box>
  );
};

export default EmployeeImport;

interface EmployeeImportSumaryProps {
  invalidCount: number;
  validCount: number;
  total: number;
}
const EmployeeImportSumary: React.FC<EmployeeImportSumaryProps> = ({ invalidCount, validCount, total }) => {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-blue-100 px-3 py-4 rounded-lg flex gap-4">
        <UsersIcon2 className="w-12 h-12" />
        <div>
          <Typography className="text-sm">Tổng cộng</Typography>
          <Typography className="text-2xl font-semibold">{total}</Typography>
        </div>
      </div>
      <div className="bg-green-100 px-3 py-4 rounded-lg flex gap-4 text-green-600">
        <CheckCircleIcon className="w-12 h-12" />
        <div>
          <Typography className="text-sm">Hợp lệ</Typography>
          <Typography className="text-2xl font-semibold">{validCount}</Typography>
        </div>
      </div>
      <div className="bg-gray-100 px-3 py-4 rounded-lg flex gap-4 text-red-600">
        <AlertCircleIcon className="w-12 h-12" />
        <div>
          <Typography className="text-sm">Không hợp lệ</Typography>
          <Typography className="text-2xl font-semibold">{invalidCount}</Typography>
        </div>
      </div>
    </div>
  );
};

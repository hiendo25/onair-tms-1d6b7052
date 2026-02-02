import React, { useEffect, useState } from "react";
import { MenuItem, Select, Stack } from "@mui/material";
import { InputAdornment, TextField } from "@mui/material";

import BranchSelector, { BranchSelectorProps } from "@/modules/branch/container/BranchSelector";
import DepartmentSelector, { DepartmentSelectorProps } from "@/modules/department/container/DepartmentSelector";
import { SearchIcon } from "@/shared/assets/icons";

type EmployeeFilterValues = {
  branchId?: string;
  departmentId?: string;
  searchText?: string;
  status: "active" | "inactive" | "all";
};
export interface EmployeeFilterProps {
  values: EmployeeFilterValues;
  onFilter: (type: "branch" | "department" | "search" | "status", values: EmployeeFilterValues) => void;
}
const EmployeeFilter: React.FC<EmployeeFilterProps> = ({ values, onFilter }) => {
  const { branchId, departmentId, searchText, status } = values;

  const handleChangeStatus: StatusSelectorProps["onChange"] = (value) => {
    onFilter("status", { ...values });
  };

  const handleSearchText = (value: string) => {
    onFilter?.("search", { ...values, searchText: value });
  };

  const handleChangeDepartment: DepartmentSelectorProps["onSelect"] = (departmentIds) => {
    const departmentId = departmentIds[0];
    if (departmentId) onFilter("department", { ...values, departmentId });
  };
  const handleChangeBranch: BranchSelectorProps["onSelect"] = (branchIds) => {
    const branchId = branchIds[0];
    if (branchId) onFilter("branch", { ...values, branchId });
  };

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flex: 1 }}>
      <TextField
        placeholder="Tìm kiếm..."
        value={searchText}
        onChange={(e) => handleSearchText(e.target.value)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ maxWidth: 200 }}
      />
      <div>
        <DepartmentSelector values={departmentId ? [departmentId] : undefined} onChange={handleChangeDepartment} />
      </div>
      <div>
        <BranchSelector values={branchId ? [branchId] : undefined} onChange={handleChangeBranch} />
      </div>
      <StatusSelector value={status} onChange={handleChangeStatus} />
    </Stack>
  );
};
export default EmployeeFilter;

type StatusValue = "active" | "inactive" | "all";
interface StatusSelectorProps {
  value: StatusValue;
  onChange: (value: StatusValue) => void;
}
const StatusSelector: React.FC<StatusSelectorProps> = ({ value, onChange }) => {
  const STATUS_OPTIONS: { label: string; value: StatusValue }[] = [
    { label: "Tất cả", value: "all" },
    { label: "Hoạt động", value: "inactive" },
    { label: "Không hoạt động", value: "active" },
  ];

  return (
    <Select
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      displayEmpty
      sx={{ minWidth: 150 }}
      MenuProps={{
        PaperProps: {
          sx: (theme) => ({
            border: `1px solid ${theme.palette.grey[300]}`,
          }),
        },
      }}
    >
      {STATUS_OPTIONS.map((opt) => (
        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 14 }}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  );
};

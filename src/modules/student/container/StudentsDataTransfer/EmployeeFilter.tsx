import React, { memo, SetStateAction, useRef, useState } from "react";
import { useId } from "react";
import {
  Box,
  Button,
  ButtonProps,
  FilledInput,
  FilledInputProps,
  FormControl,
  IconButton,
  InputAdornment,
  List,
  MenuItem,
  Popover,
  Select,
  SelectProps,
  Typography,
} from "@mui/material";

import { FilterFunnelIcon, SearchIcon } from "@/shared/assets/icons";
import EmptyData from "@/shared/ui/EmptyData";
import { cn } from "@/utils";

import BranchSelector, { BranchSelectorProps } from "./BranchSelector";
import DepartmentSelector, { DepartmentSelectorProps } from "./DepartmentSelector";

type SearchKeyName = "full_name" | "email" | "code";
export interface EmployeeFilterProps {
  className?: string;
  selectedDepartmentIds?: DepartmentSelectorProps["values"];
  selectedBranchIds?: BranchSelectorProps["values"];
  onSearch?: (key: SearchKeyName, value: string) => void;
  onChange?: (type: "department" | "branch") => (values: string[]) => void;
  querySearch: { key: SearchKeyName; search: string };
}
const TAB_KEY = {
  branch: "branch",
  department: "department",
  role: "role",
} as const;

const KEY_NAME_OPTIONS: { label: string; value: SearchKeyName }[] = [
  { label: "Email", value: "email" },
  { label: "Tên", value: "full_name" },
  { label: "Code", value: "code" },
];

const EmployeeFilter: React.FC<EmployeeFilterProps> = ({
  className,
  selectedDepartmentIds = [],
  selectedBranchIds = [],
  querySearch,
  onSearch,
  onChange,
}) => {
  const [currentTabMenu, setCurrentTabMenu] = useState<keyof typeof TAB_KEY>(TAB_KEY.department);
  const [keyName, setKeyName] = useState<SearchKeyName>("full_name");
  const id = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();

  const filterId = useRef(`employee-filter-${id}`);

  const open = !!anchorEl;

  const handleClose = () => {
    setAnchorEl(undefined);
  };
  const handleOpenFilter: ButtonProps["onClick"] = (evt) => {
    setAnchorEl(evt.currentTarget);
  };

  const handleSelectDepartmentIds: DepartmentSelectorProps["onSelect"] = (departmentId) => {
    let newList = [...selectedDepartmentIds];
    const isExist = newList.includes(departmentId);
    newList = isExist ? newList.filter((it) => it !== departmentId) : [...newList, departmentId];

    onChange?.("department")(newList);
  };
  const handleSelectBranch: BranchSelectorProps["onSelect"] = (branchId) => {
    let newList = [...selectedBranchIds];
    const isExist = newList.includes(branchId);
    newList = isExist ? newList.filter((it) => it !== branchId) : [...newList, branchId];

    onChange?.("branch")(newList);
  };

  const handleSearch: FilledInputProps["onChange"] = (evt) => {
    const value = evt.target.value;
    onSearch?.(keyName, value);
  };

  const handleChangeKey: SelectProps<SearchKeyName>["onChange"] = (evt) => {
    setKeyName(evt.target.value);
  };

  const TAB_MENU_LIST: { label: string; key: keyof typeof TAB_KEY; children?: React.ReactNode }[] = [
    {
      label: "Chi nhánh",
      key: TAB_KEY.branch,
      children: <BranchSelector values={selectedBranchIds} onSelect={handleSelectBranch} />,
    },
    {
      label: "Phòng ban",
      key: TAB_KEY.department,
      children: <DepartmentSelector onSelect={handleSelectDepartmentIds} values={selectedDepartmentIds} />,
    },
    {
      label: "Vai trò",
      key: TAB_KEY.role,
      children: (
        <Typography sx={{ fontSize: "0.875rem" }} variant="body2">
          Đang trống
        </Typography>
      ),
    },
  ];

  return (
    <div className="w-full flex items-center gap-3">
      <div className="flex bg-gray-100 gap-1 rounded-lg p-1">
        <FormControl size="small" variant="filled" sx={{ width: 100 }}>
          <Select
            value={keyName}
            onChange={handleChangeKey}
            sx={{
              height: 36,
              background: "white",
              "&.MuiFilledInput-root": {
                backgroundColor: "white",
              },
            }}
            MenuProps={{
              sx: (theme) => ({
                ".MuiList-root ": {
                  padding: 1,
                },
              }),
            }}
          >
            {KEY_NAME_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.875rem" }}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <FilledInput
            placeholder="Tìm kiếm..."
            onChange={handleSearch}
            endAdornment={
              <InputAdornment position="end">
                <SearchIcon className="w-5 h-5" />
              </InputAdornment>
            }
            size="small"
            className="w-full max-w-80"
            sx={(theme) => ({
              "&:hover": {
                background: theme.palette.grey[200],
              },
              "&.Mui-focused": {
                background: theme.palette.grey[200],
              },
            })}
          />
        </FormControl>
      </div>
      <div>
        <IconButton
          aria-describedby={filterId.current}
          onClick={handleOpenFilter}
          // sx={{ paddingBlock: 1, minWidth: "auto" }}
          size="small"
          className="bg-transparent"
        >
          <FilterFunnelIcon className="w-5 h-5" />
        </IconButton>
        <Popover
          id={filterId.current}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <div className="w-[480px] max-h-[400px]">
            <div className="grid grid-cols-3 gap-2 p-4">
              {TAB_MENU_LIST.map((tab) => (
                <div
                  key={tab.key}
                  className={cn("flex-1", {
                    "border-l-px": true,
                  })}
                >
                  <div className="mb-3">
                    <Typography className="font-medium">{tab.label}</Typography>
                  </div>
                  <Box
                    sx={(theme) => ({
                      scrollbarWidth: "thin",
                      flex: 1,
                      flexDirection: "column",
                      overflowY: "auto",
                    })}
                  >
                    {tab.children}
                  </Box>
                </div>
              ))}
            </div>
          </div>
        </Popover>
      </div>
    </div>
  );
};

export default memo(EmployeeFilter);

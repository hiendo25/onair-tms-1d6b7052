import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useId } from "react";
import {
  Box,
  Button,
  ButtonProps,
  FilledInput,
  FilledInputProps,
  FormControl,
  InputAdornment,
  MenuItem,
  Popover,
  Select,
  SelectProps,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import { FilterFunnelIcon, SearchIcon } from "@/shared/assets/icons";

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

type TabKeys = "branch" | "department" | "role";

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
  const [search, setSearch] = useState(querySearch);
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

  const handleSelectDepartmentIds = useCallback<Exclude<DepartmentSelectorProps["onSelect"], undefined>>(
    (departmentId) => {
      let newList = [...selectedDepartmentIds];
      const isExist = newList.includes(departmentId);
      newList = isExist ? newList.filter((it) => it !== departmentId) : [...newList, departmentId];

      onChange?.("department")(newList);
    },
    [onChange, selectedDepartmentIds],
  );
  const handleSelectBranch = useCallback<Exclude<BranchSelectorProps["onSelect"], undefined>>(
    (branchId) => {
      let newList = [...selectedBranchIds];
      const isExist = newList.includes(branchId);
      newList = isExist ? newList.filter((it) => it !== branchId) : [...newList, branchId];

      onChange?.("branch")(newList);
    },
    [onChange, selectedBranchIds],
  );

  const handleSearch: FilledInputProps["onChange"] = (evt) => {
    const value = evt.target.value;
    const searchKey = search.key;
    onSearch?.(searchKey, value);
    setSearch((prev) => ({
      ...prev,
      key: searchKey,
      search: value,
    }));
  };

  const handleChangeSearchKey: SelectProps<SearchKeyName>["onChange"] = (evt) => {
    const key = evt.target.value;
    setSearch((prev) => ({
      ...prev,
      key,
    }));
  };

  const TAB_MENU_LIST: SimpleBasicTabProps["items"] = useMemo(() => {
    return [
      {
        label: "Chi nhánh",
        key: "branch",
        panel: <BranchSelector values={selectedBranchIds} onSelect={handleSelectBranch} />,
      },
      {
        label: "Phòng ban",
        key: "department",
        panel: <DepartmentSelector onSelect={handleSelectDepartmentIds} values={selectedDepartmentIds} />,
      },
      {
        label: "Vai trò",
        key: "role",
        panel: (
          <Typography sx={{ fontSize: "0.875rem" }} variant="body2" color="textDisabled">
            Đang trống
          </Typography>
        ),
      },
    ];
  }, [handleSelectBranch, handleSelectDepartmentIds, selectedDepartmentIds, selectedBranchIds]);

  return (
    <div className="w-full flex items-center gap-3">
      <div className="flex bg-gray-100 gap-1 rounded-lg p-1  max-w-96 flex-1">
        <FormControl size="small" variant="filled" sx={{ width: 100 }}>
          <Select
            value={search.key}
            onChange={handleChangeSearchKey}
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
            value={search.search}
            onChange={handleSearch}
            spellCheck={false}
            size="small"
            endAdornment={
              <InputAdornment position="end">
                <SearchIcon className="w-5 h-5" />
              </InputAdornment>
            }
            className="w-full"
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
        <Button
          aria-describedby={filterId.current}
          onClick={handleOpenFilter}
          sx={(theme) => ({
            background: theme.palette.grey[200],
            color: theme.palette.grey[800],
            height: "44px",
            "&:hover": {
              background: theme.palette.grey[200],
              boxShadow: "none",
            },
            "&.Mui-focused": {
              background: theme.palette.grey[200],
            },
          })}
          startIcon={
            <InputAdornment position="start">
              <FilterFunnelIcon className="w-5 h-5" />
            </InputAdornment>
          }
        >
          Bộ lọc
        </Button>
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
          <div className="w-[320px] max-h-[400px]">
            <SimpleBasicTabs items={TAB_MENU_LIST} />
          </div>
        </Popover>
      </div>
    </div>
  );
};

export default memo(EmployeeFilter);

interface TabPanelProps {
  children?: React.ReactNode;
  tabKey: TabKeys;
  value: TabKeys;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, tabKey, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== tabKey}
      id={`simple-tabpanel-${tabKey}`}
      aria-labelledby={`simple-tab-${tabKey}`}
      {...other}
    >
      {value === tabKey && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(key: string) {
  return {
    id: `simple-tab-${key}`,
    "aria-controls": `simple-tabpanel-${key}`,
  };
}

interface SimpleBasicTabProps {
  items: { label: string; key: TabKeys; panel?: React.ReactNode }[];
}
const SimpleBasicTabs: React.FC<SimpleBasicTabProps> = ({ items }) => {
  const [value, setValue] = React.useState<TabKeys>("branch");

  const handleChange = (event: React.SyntheticEvent, newValue: TabKeys) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="Employee filter basic tab"
        variant="scrollable"
        // orientation="vertical"
      >
        {items.map((tab) => (
          <Tab
            key={tab.key}
            value={tab.key}
            label={tab.label}
            {...a11yProps(tab.key)}
            sx={{
              textTransform: "initial",
            }}
          />
        ))}
      </Tabs>
      {items.map((tab, index) => (
        <CustomTabPanel key={tab.key} value={value} tabKey={tab.key}>
          {tab.panel}
        </CustomTabPanel>
      ))}
    </Box>
  );
};

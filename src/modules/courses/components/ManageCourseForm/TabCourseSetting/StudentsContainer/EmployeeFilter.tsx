import { FilterFunnelIcon, SearchIcon } from "@/shared/assets/icons";
import { Box, Button, ButtonProps, FilledInput, List, MenuItem, Popover, Typography } from "@mui/material";
import { memo, SetStateAction, useRef, useState } from "react";
import { useId } from "react";
import DepartmentSelector, { DepartmentSelectorProps } from "./DepartmentSelector";
import BranchSelector, { BranchSelectorProps } from "./BranchSelector";
import EmptyData from "@/shared/ui/EmptyData";

export interface EmployeeFilterProps {
  className?: string;
  selectedDepartmentIds?: DepartmentSelectorProps["values"];
  seletectedBranchIds?: BranchSelectorProps["values"];
  setSelectedDepartmentIds: React.Dispatch<SetStateAction<string[]>>;
  setSelectedBranchIds: React.Dispatch<SetStateAction<string[]>>;
  onSearch?: (value: string) => void;
}
const TAB_KEY = {
  branch: "branch",
  department: "department",
  role: "role",
} as const;

const TAB_MENU_LIST = [
  {
    label: "Chi nhánh",
    key: TAB_KEY.branch,
  },
  {
    label: "Phòng ban",
    key: TAB_KEY.department,
  },
  {
    label: "Vai trò",
    key: TAB_KEY.role,
  },
];
const EmployeeFilter: React.FC<EmployeeFilterProps> = ({
  className,
  selectedDepartmentIds,
  seletectedBranchIds,
  onSearch,
  setSelectedDepartmentIds,
  setSelectedBranchIds,
}) => {
  const [currentTabMenu, setCurrentTabMenu] = useState<keyof typeof TAB_KEY>(TAB_KEY.department);
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
    setSelectedDepartmentIds((prev) => {
      const newList = [...prev];
      const isExist = newList.includes(departmentId);
      return isExist ? newList.filter((it) => it !== departmentId) : [...newList, departmentId];
    });
  };
  const handleSelectBranch: BranchSelectorProps["onSelect"] = (branchId) => {
    setSelectedBranchIds((prev) => {
      const newList = [...prev];
      const isExist = newList.includes(branchId);
      return isExist ? newList.filter((it) => it !== branchId) : [...newList, branchId];
    });
  };

  return (
    <div className="w-full flex items-center">
      <div className="flex-1 flex">
        <FilledInput
          placeholder="Tìm kiếm..."
          onChange={(evt) => onSearch?.(evt.target.value)}
          endAdornment={<SearchIcon />}
          size="small"
          className="w-full max-w-[240px]"
        />
      </div>
      <div>
        <Button
          aria-describedby={filterId.current}
          variant="outlined"
          color="inherit"
          onClick={handleOpenFilter}
          sx={{ paddingBlock: 1, minWidth: "auto" }}
          startIcon={<FilterFunnelIcon className="w-3 h-3" />}
          size="small"
        >
          <Typography sx={{ fontSize: "0.875rem" }}>Lọc</Typography>
          {/* <span className="w-5 h-5 text-xs bg-gray-600 rounded-full inline-flex items-center justify-center ml-2 text-white">
                {1}
              </span> */}
        </Button>
        <Popover
          id={filterId.current}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <div className="flex gap-2 min-w-[450px] max-h-[400px]">
            <div className="w-36">
              <List>
                {TAB_MENU_LIST.map((item) => (
                  <MenuItem
                    key={item.key}
                    onClick={() => setCurrentTabMenu(item.key)}
                    sx={(theme) => ({
                      backgroundColor: item.key === currentTabMenu ? theme.palette.grey[200] : undefined,
                    })}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </List>
            </div>
            <Box
              sx={(theme) => ({
                scrollbarWidth: "thin",
                flex: 1,
                flexDirection: "column",
                overflowY: "auto",
                p: 2,
                borderLeft: "1px solid",
                borderColor: theme.palette.grey[200],
              })}
            >
              <div>
                {currentTabMenu === "branch" ? (
                  <BranchSelector values={seletectedBranchIds} onSelect={handleSelectBranch} />
                ) : currentTabMenu === "department" ? (
                  <DepartmentSelector onSelect={handleSelectDepartmentIds} values={selectedDepartmentIds} />
                ) : currentTabMenu === "role" ? (
                  <div className="flex items-center justify-center p-4">
                    <EmptyData iconSize="small" description="Hiện chưa có vai trò nào." />
                  </div>
                ) : null}
              </div>
            </Box>
          </div>
        </Popover>
      </div>
    </div>
  );
};

export default memo(EmployeeFilter);

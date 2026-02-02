import React, { Activity, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Pagination,
  styled,
  Typography,
} from "@mui/material";

import useDebounce from "@/hooks/useDebounce";
import { useUserOrganization } from "@/modules/organization";
import { ChevronDownIcon, SearchIcon } from "@/shared/assets/icons";
import useClickOutSide from "@/shared/ui/form/MultipleSelectField/useClickOutside";
import { cn } from "@/utils";
import { useGetEmployeesV2Query } from "../operations/query";
export interface EmployeeSelectorProps {
  className?: string;
  values?: string[];
  multiple?: boolean;
  excludes?: string[];
  onSelect?: (employeeIds: string[]) => void;
  onChange?: (employeeIds: string[]) => void;
  placeholder?: string;
  label?: string;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  className,
  onSelect,
  onChange,
  values,
  multiple = false,
  excludes,
  placeholder,
  label,
}) => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const organizationId = useUserOrganization((state) => state.currentOrganization.orgId);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [employeeQueryParams, setEmployeeQueryParams] = useState<{ page: number; pageSize: number; search: string }>({
    page: 1,
    pageSize: 10,
    search: "",
  });
  const { data, isPending } = useGetEmployeesV2Query({
    page: employeeQueryParams.page,
    pageSize: employeeQueryParams.pageSize,
    filter: {
      field: "name",
      value: useDebounce(employeeQueryParams.search, 600),
    },
    organizationId,
  });

  const employeeList = data?.data || [];
  const totalItem = data?.total;
  const pageSize = data?.pageSize;

  const employeeOptions = employeeList.map<EmployeeMenuItem>((epl) => ({
    id: epl.id,
    label: (
      <>
        {epl.profile?.fullName} <Chip component="span" label={epl.employeeCode} size="small" className="ml-2" />
      </>
    ),
    value: epl.id,
  }));

  const handleSelect: EmployeeMenuListProps["onSelect"] = (selectedValue) => {
    let selectedValuesArr: string[];

    if (multiple) {
      const selectedSet = new Set(selectedEmployeeIds);
      if (selectedSet.has(selectedValue)) {
        selectedSet.delete(selectedValue);
      } else {
        selectedSet.add(selectedValue);
      }
      selectedValuesArr = [...selectedSet];
    } else {
      selectedValuesArr = selectedEmployeeIds[0] === selectedValue ? [] : [selectedValue];
    }

    const handler = onChange ?? onSelect;
    if (handler) {
      handler(selectedValuesArr);
      return;
    }

    setSelectedEmployeeIds(selectedValuesArr);
  };

  const handleSearchName = (search: string) => {
    setEmployeeQueryParams((prev) => ({ ...prev, page: 1, search }));
  };
  const handleChangePage = (event: React.ChangeEvent<unknown>, page: number) => {
    setEmployeeQueryParams((prev) => ({ ...prev, page }));
  };
  const getEmployeeName = useCallback(
    (optionId: string) => {
      const employeeMap = new Map(employeeList.map((item) => [item.id, item]));

      const employee = employeeMap.get(optionId);

      if (!employee) return null;

      return employee.profile?.fullName;
    },
    [employeeList],
  );

  useClickOutSide(selectorRef, () => {
    setOpenDialog(false);
  });

  useEffect(() => {
    if (!onSelect && !onChange) return;

    setSelectedEmployeeIds(values ?? []);
  }, [values, onSelect, onChange]);

  return (
    <div ref={selectorRef} className="branch-selector relative">
      <div
        className="branch-selector__btn flex items-center border border-gray-300 h-10 rounded-lg px-2 cursor-pointer"
        onClick={() => setOpenDialog((prev) => !prev)}
      >
        <div className="flex-1 h-full flex items-center">
          {!selectedEmployeeIds.length && (
            <Typography sx={{ fontSize: 14 }} color="text.secondary">
              {placeholder}
            </Typography>
          )}
          {selectedEmployeeIds.map((selectedId) => (
            <Typography key={selectedId} sx={{ fontSize: 14 }}>
              {getEmployeeName(selectedId)}
            </Typography>
          ))}
        </div>
        <ChevronDownIcon
          className={cn("w-4 h-4 text-gray-600", {
            "rotate-180": openDialog,
          })}
        />
      </div>
      <Activity mode={openDialog ? "visible" : "hidden"}>
        <Box
          component="div"
          sx={(theme) => ({
            position: "absolute",
            width: "100%",
            zIndex: 10,
            border: "1px solid",
            borderColor: theme.palette.grey[400],
            backgroundColor: "white",
            marginTop: "1px",
            padding: "12px",
            borderRadius: 1,
            boxShadow: "0 4px 6px -4px rgb(0,0,0,0.3)",
          })}
        >
          <div>
            <FormControl>
              <OutlinedInput
                placeholder="Tìm kiếm"
                size="small"
                fullWidth
                onChange={(evt) => handleSearchName(evt.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <SearchIcon className="w-4 h-4" />
                  </InputAdornment>
                }
              />
            </FormControl>
            <div className="h-4" />
          </div>
          <Box
            sx={(theme) => ({
              scrollbarWidth: "thin",
              maxHeight: 300,
              marginTop: "1px",
              overflowY: "auto",
              scrollbarColor: "red",
              msScrollbarTrackColor: "blue",
              msScrollbarBaseColor: "green",
              msScrollbarHighlightColor: "blueviolet",
            })}
          >
            {placeholder && (
              <MenuItem disabled value="" sx={{ fontSize: 14 }}>
                {placeholder}
              </MenuItem>
            )}
            {isPending && (
              <div className="px-2 py-3">
                <div className="pulse animate-pulse flex flex-col gap-3">
                  <div className="flex gap-2">
                    <div className="w-4 h-4 rounded-xl bg-gray-100"></div>
                    <div className="bg-gray-100 h-4 rounded-lg flex-1 max-w-[40%]" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-4 h-4 rounded-xl bg-gray-100"></div>
                    <div className="bg-gray-100 h-4 rounded-lg flex-1 max-w-[80%]" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-4 h-4 rounded-xl bg-gray-100"></div>
                    <div className="bg-gray-100 h-4 rounded-lg flex-1 max-w-[60%]" />
                  </div>
                </div>
              </div>
            )}
            {!isPending && (
              <EmployeeMenuList items={employeeOptions} values={selectedEmployeeIds} onSelect={handleSelect} />
            )}
          </Box>
          <div className="pt-3">
            <Pagination
              count={data ? Math.ceil(data.total / data.pageSize) : 0}
              page={data?.page || 1}
              onChange={handleChangePage}
              size="small"
              sx={{
                borderRadius: 4,
                ".MuiButtonBase-root": {
                  minWidth: 24,
                  height: 24,
                  fontSize: 12,
                },
              }}
            />
          </div>
        </Box>
      </Activity>
    </div>
  );
};
export default memo(EmployeeSelector);

type EmployeeMenuItem = { id: string; value: string; label: React.ReactNode };
interface EmployeeMenuListProps {
  values?: string[];
  items: EmployeeMenuItem[];
  asChild?: boolean;
  depth?: number;
  onSelect: (value: string) => void;
}
const EmployeeMenuList: React.FC<EmployeeMenuListProps> = ({
  items,
  asChild = false,
  depth = 0,
  onSelect,
  values = [],
}) => {
  const isChecked = (value: string) => {
    return values.some((item) => item === value);
  };
  return items.map((item) => (
    <StyledMenuItem
      key={item.value}
      value={item.value}
      onClick={() => onSelect(item.value)}
      disableRipple
      disableGutters
    >
      <CheckboxStyled checked={isChecked(item.value)} size="small" />
      <Typography sx={{ fontSize: 14 }}>{item.label}</Typography>
    </StyledMenuItem>
  ));
};

const CheckboxStyled = styled(Checkbox)((theme) => ({
  margin: "4px 8px 4px 0px",
}));

const StyledMenuItem = styled(MenuItem)(() => ({
  "&:hover": {
    backgroundColor: "white",
  },
}));

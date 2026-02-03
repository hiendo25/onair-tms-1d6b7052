import React, { useEffect, useState } from "react";
import { MenuItem, Typography } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import { useGetDepartmentsQuery } from "@/modules/department/operations/query";
import { useUserOrganization } from "@/modules/organization";
export interface DepartmentSelectorProps {
  values?: string[];
  multiple?: boolean;
  className?: string;
  onSelect?: (departmentId: string[]) => void;
  onChange?: (departmentId: string[]) => void;
}
const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  className,
  onSelect,
  values,
  onChange,
  multiple = false,
}) => {
  const organizationId = useUserOrganization((state) => state.currentOrganization.orgId);
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const { data: departmentsData, isPending } = useGetDepartmentsQuery({ organizationId });

  const departmentList = departmentsData?.items || [];

  const handleChange = (event: SelectChangeEvent<typeof departmentIds>) => {
    const {
      target: { value },
    } = event;

    const selectedValues = typeof value === "string" ? value.split(",") : value;

    if (onChange) {
      onChange?.(selectedValues);
      return;
    }

    if (onSelect) {
      onSelect?.(selectedValues);
      return;
    }
    setDepartmentIds(selectedValues);
  };

  const getDepartmentName = (optionId: string) => {
    return departmentsData?.items.find((item) => item.id === optionId)?.name;
  };

  useEffect(() => {
    if (!onSelect && !onChange) return;

    setDepartmentIds(values ?? []);
  }, [values, onSelect, onChange]);

  return (
    <Select
      multiple={multiple}
      displayEmpty
      labelId="department-select-label"
      id="department-selector"
      value={departmentIds}
      onChange={handleChange}
      renderValue={(selected) => {
        if (selected?.length === 0) {
          return (
            <Typography sx={{ fontSize: 14 }} color="text.secondary">
              Chọn phòng ban
            </Typography>
          );
        }

        return selected.map((item) => getDepartmentName(item)).join(", ");
      }}
      fullWidth
      sx={{
        ".MuiPaper-root": {
          border: "1px solid blue",
        },
      }}
      MenuProps={{
        PaperProps: {
          sx: (theme) => ({
            border: `1px solid ${theme.palette.grey[300]}`,
            maxHeight: 350,
          }),
        },
      }}
    >
      <MenuItem value="" disabled sx={{ fontSize: 14 }}>
        Chọn phòng ban
      </MenuItem>
      {departmentList.map((item) => (
        <MenuItem key={item.id} value={item.id} sx={{ fontSize: 14 }}>
          {item.name}
        </MenuItem>
      ))}
    </Select>
  );
};
export default DepartmentSelector;

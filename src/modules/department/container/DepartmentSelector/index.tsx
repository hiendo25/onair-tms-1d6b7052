import React, { useEffect, useMemo, useState } from "react";
import { FormControl, FormLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";

import { useGetDepartmentsQuery } from "@/modules/department/operations/query";
import { useUserOrganization } from "@/modules/organization";
export interface DepartmentSelectorProps {
  className?: string;
  onSelect?: (departmentId: string[]) => void;
  values?: string[];
  multiple?: boolean;
}
const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ className, onSelect, values, multiple = false }) => {
  const organizationId = useUserOrganization((state) => state.currentOrganization.orgId);
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const { data: departmentsData, isPending } = useGetDepartmentsQuery(
    { organizationId },
    {
      enabled: true,
    },
  );

  const departmentList = departmentsData?.data || [];

  const handleChange = (event: SelectChangeEvent<typeof departmentIds>) => {
    const {
      target: { value },
    } = event;

    const selectedValues = typeof value === "string" ? value.split(",") : value;

    if (onSelect) {
      onSelect?.(selectedValues);
      return;
    }
    setDepartmentIds(selectedValues);
  };

  const getDepartmentName = (optionId: string) => {
    return departmentsData?.data.find((item) => item.id === optionId)?.name;
  };

  useEffect(() => {
    if (!onSelect) return;

    setDepartmentIds(values ?? []);
  }, [values, onSelect]);

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
    >
      <MenuItem value="" disabled>
        Chọn phòng ban
      </MenuItem>
      {departmentList.map((item) => (
        <MenuItem key={item.id} value={item.id}>
          {item.name}
        </MenuItem>
      ))}
    </Select>
  );
};
export default DepartmentSelector;

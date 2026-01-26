import React, { memo, useEffect, useState } from "react";
import { MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";

import { useUserOrganization } from "@/modules/organization";
import { useGetBranchesQuery } from "../operations/query";
export interface BranchSelectorProps {
  className?: string;
  onSelect?: (branchIds: string[]) => void;
  values?: string[];
  multiple?: boolean;
}
const BranchSelector: React.FC<BranchSelectorProps> = ({ className, onSelect, values, multiple = false }) => {
  const organizationId = useUserOrganization((state) => state.currentOrganization.orgId);
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const {
    data: branchesData,
    isLoading,
    error,
  } = useGetBranchesQuery(
    {
      organizationId: organizationId!,
    },
    {
      enabled: !!organizationId,
    },
  );
  const departmentList = branchesData?.data || [];

  const handleChange = (event: SelectChangeEvent<typeof branchIds>) => {
    const {
      target: { value },
    } = event;

    const selectedValues = typeof value === "string" ? value.split(",") : value;
    if (onSelect) {
      onSelect?.(selectedValues);
      return;
    }

    setBranchIds(selectedValues);
  };

  const getBranchName = (optionId: string) => {
    return branchesData?.data.find((item) => item.id === optionId)?.name;
  };

  useEffect(() => {
    if (!values) return;

    setBranchIds(values);
  }, [values]);

  return (
    <Select
      multiple={multiple}
      displayEmpty
      labelId="branch-select-label"
      id="branch-selector"
      value={branchIds}
      onChange={handleChange}
      renderValue={(selected) => {
        if (selected?.length === 0) {
          return (
            <Typography sx={{ fontSize: 14 }} color="text.secondary">
              Chọn chi nhánh
            </Typography>
          );
        }

        return selected.map((item) => getBranchName(item)).join(", ");
      }}
      fullWidth
    >
      <MenuItem value="" disabled>
        Chọn chi nhánh
      </MenuItem>
      {departmentList.map((item) => (
        <MenuItem key={item.id} value={item.id}>
          {item.name}
        </MenuItem>
      ))}
    </Select>
  );
};
export default memo(BranchSelector);

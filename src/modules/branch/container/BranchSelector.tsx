import React, { memo, useEffect, useState } from "react";
import { MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";

import { useUserOrganization } from "@/modules/organization";
import { useGetBranchesQuery } from "../operations/query";
export interface BranchSelectorProps {
  className?: string;
  values?: string[];
  multiple?: boolean;
  onSelect?: (branchIds: string[]) => void;
  onChange?: (branchIds: string[]) => void;
}
const BranchSelector: React.FC<BranchSelectorProps> = ({ className, onSelect, onChange, values, multiple = false }) => {
  const organizationId = useUserOrganization((state) => state.currentOrganization.orgId);
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const { data: branchesData } = useGetBranchesQuery({
    organizationId,
  });
  const departmentList = branchesData?.data || [];

  const handleChange = (event: SelectChangeEvent<typeof branchIds>) => {
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

    setBranchIds(selectedValues);
  };

  const getBranchName = (optionId: string) => {
    return branchesData?.data.find((item) => item.id === optionId)?.name;
  };

  useEffect(() => {
    if (!onSelect && !onChange) return;

    setBranchIds(values ?? []);
  }, [values, onSelect, onChange]);

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
        Chọn chi nhánh
      </MenuItem>
      {departmentList.map((item) => (
        <MenuItem key={item.id} value={item.id} sx={{ fontSize: 14 }}>
          {item.name}
        </MenuItem>
      ))}
    </Select>
  );
};
export default memo(BranchSelector);

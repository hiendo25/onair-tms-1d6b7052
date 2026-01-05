import React, { useMemo } from "react";
import { Alert, Checkbox, FormControlLabel } from "@mui/material";

import { useGetBranchesQuery } from "@/modules/branch/operations/query";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import { useGetOrganizationUnitDepartmentOrBranchQuery } from "@/modules/organization-units/operations/query";

export interface BranchSelectorProps {
  className?: string;
  onSelect?: (itemId: string) => void;
  values?: string[];
}
const BranchSelector: React.FC<BranchSelectorProps> = ({ className, onSelect, values }) => {
  const organizationId = useUserOrganization((state) => state.currentOrganization.orgId);
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

  const departmentList = useMemo(() => {
    return branchesData?.data || [];
  }, [branchesData?.data]);

  const hasChecked = (itemId: string) => {
    return values?.some((val) => val === itemId);
  };

  return (
    <div className="department">
      {departmentList.map((item) => (
        <div key={item.id}>
          <FormControlLabel
            control={<Checkbox size="small" />}
            label={item.name}
            checked={hasChecked(item.id)}
            onChange={(evt, checked) => onSelect?.(item.id)}
            sx={{
              ".MuiFormControlLabel-label": { fontSize: "0.875rem" },
            }}
          />
        </div>
      ))}
    </div>
  );
};
export default BranchSelector;

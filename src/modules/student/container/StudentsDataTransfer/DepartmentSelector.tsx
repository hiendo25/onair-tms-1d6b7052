import React, { useMemo } from "react";
import { Alert, Checkbox, FormControlLabel, Typography } from "@mui/material";

import { useGetDepartmentsQuery } from "@/modules/department/operations/query";
import { useUserOrganization } from "@/modules/organization";
import { useGetOrganizationUnitDepartmentOrBranchQuery } from "@/modules/organization-units/operations/query";
export interface DepartmentSelectorProps {
  className?: string;
  onSelect?: (itemId: string) => void;
  values?: string[];
}
const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ className, onSelect, values }) => {
  const organizationId = useUserOrganization((state) => state.currentOrganization.orgId);
  const { data: departmentsData, isPending } = useGetDepartmentsQuery(
    { organizationId },
    {
      enabled: true,
    },
  );

  const departmentList = useMemo(() => {
    return departmentsData?.data || [];
  }, [departmentsData?.data]);

  const hasChecked = (itemId: string) => {
    return values?.some((val) => val === itemId);
  };

  return (
    <div className="department-selector">
      {departmentList.length ? (
        <div className="department-list">
          {departmentList.map((item) => (
            <div key={item.id}>
              <FormControlLabel
                control={<Checkbox size="small" />}
                label={item.name}
                checked={hasChecked(item.id)}
                onChange={(evt, checked) => onSelect?.(item.id)}
                sx={{ ".MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <Typography variant="body2" color="textDisabled">
            Đang trống
          </Typography>
        </div>
      )}
    </div>
  );
};
export default DepartmentSelector;

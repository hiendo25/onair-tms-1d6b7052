import { useGetOrganizationUnitDepartmentOrBranchQuery } from "@/modules/organization-units/operations/query";
import { Alert, Checkbox, FormControlLabel } from "@mui/material";
import { useMemo } from "react";

export interface BranchSelectorProps {
  className?: string;
  onSelect?: (itemId: string) => void;
  values?: string[];
}
const BranchSelector: React.FC<BranchSelectorProps> = ({ className, onSelect, values }) => {
  const { data: branchData, isPending } = useGetOrganizationUnitDepartmentOrBranchQuery({
    queryParams: { type: "branch" },
  });

  const departmentList = useMemo(() => {
    return branchData?.data || [];
  }, [branchData?.data]);

  const hasChecked = (itemId: string) => {
    return values?.some((val) => val === itemId);
  };

  if (branchData?.error) {
    return <Alert severity="error">{branchData.error.message}</Alert>;
  }

  return (
    <div className="depart-ment">
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
  );
};
export default BranchSelector;

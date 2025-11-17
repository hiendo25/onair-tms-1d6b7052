import { useGetOrganizationUnitDepartmentOrBranchQuery } from "@/modules/organization-units/operations/query";
import { Alert, Checkbox, FormControlLabel } from "@mui/material";
import { useMemo } from "react";

export interface DepartmentSelectorProps {
  className?: string;
  onSelect?: (itemId: string) => void;
  values?: string[];
}
const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ className, onSelect, values }) => {
  const { data: departmentsData, isPending } = useGetOrganizationUnitDepartmentOrBranchQuery({
    queryParams: { type: "department" },
  });

  const departmentList = useMemo(() => {
    return departmentsData?.data || [];
  }, [departmentsData?.data]);

  const hasChecked = (itemId: string) => {
    return values?.some((val) => val === itemId);
  };

  if (departmentsData?.error) {
    return <Alert severity="error">{departmentsData.error.message}</Alert>;
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
export default DepartmentSelector;

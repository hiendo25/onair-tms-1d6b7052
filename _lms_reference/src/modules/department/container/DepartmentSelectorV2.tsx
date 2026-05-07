import React, { Activity, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Checkbox, MenuItem, styled, Typography } from "@mui/material";

import { useUserOrganization } from "@/modules/organization";
import { ChevronDownIcon } from "@/shared/assets/icons";
import useClickOutSide from "@/shared/ui/form/MultipleSelectField/useClickOutside";
import { cn } from "@/utils";
import { useGetDepartmentsQuery } from "../operations/query";
import { GetDepartmentsResponse } from "../type";
export interface DepartmentSelectorV2Props {
  className?: string;
  values?: string[];
  multiple?: boolean;
  onSelect?: (branchIds: string[]) => void;
  onChange?: (branchIds: string[]) => void;
  excludes?: string[];
  error?: boolean;
}

type DepartmentItems = NonNullable<GetDepartmentsResponse["data"]>["items"];
const DepartmentSelectorV2: React.FC<DepartmentSelectorV2Props> = ({
  className,
  onSelect,
  onChange,
  values,
  multiple = false,
  excludes,
  error,
}) => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const organizationId = useUserOrganization((state) => state.currentOrganization.orgId);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);

  const { data: departmentsData } = useGetDepartmentsQuery({
    organizationId,
    excludes,
    pageSize: 99,
  });

  const branchFlatList = useMemo(() => {
    return departmentsData?.items ? flattenDepartments(departmentsData?.items) : [];
  }, [departmentsData]);

  const branchOptions = useMemo(() => {
    if (!departmentsData?.items) return [];

    return mapChildItems(departmentsData?.items);
  }, [departmentsData]);

  const handleSelect: BranchMenuListProps["onSelect"] = (selectedValue) => {
    let selectedValuesArr: string[];

    if (multiple) {
      const selectedSet = new Set(selectedBranchIds);
      if (selectedSet.has(selectedValue)) {
        selectedSet.delete(selectedValue);
      } else {
        selectedSet.add(selectedValue);
      }
      selectedValuesArr = [...selectedSet];
    } else {
      selectedValuesArr = selectedBranchIds[0] === selectedValue ? [] : [selectedValue];
    }

    const handler = onChange ?? onSelect;
    if (handler) {
      handler(selectedValuesArr);
      return;
    }

    setSelectedBranchIds(selectedValuesArr);
  };

  const getBranchName = useCallback(
    (optionId: string) => {
      const branchMap = new Map(branchFlatList.map((item) => [item.id, item]));
      return branchMap.get(optionId)?.name;
    },
    [branchFlatList],
  );

  useClickOutSide(selectorRef, () => {
    setOpenDialog(false);
  });

  useEffect(() => {
    if (!onSelect && !onChange) return;

    setSelectedBranchIds(values ?? []);
  }, [values, onSelect, onChange]);

  return (
    <div ref={selectorRef} className="branch-selector relative">
      <div
        className={cn(
          "branch-selector__btn flex items-center border border-gray-300 h-10 rounded-lg px-2 cursor-pointer",
          {
            "border-gray-300": !error,
            "border-red-500": error,
          },
        )}
        onClick={() => setOpenDialog((prev) => !prev)}
      >
        <div className="flex-1 h-full flex items-center">
          {!selectedBranchIds.length && (
            <Typography sx={{ fontSize: 14 }} color="text.secondary">
              Chọn chi nhánh
            </Typography>
          )}
          {selectedBranchIds.map((branchId) => (
            <Typography key={branchId} sx={{ fontSize: 14 }}>
              {getBranchName(branchId)}
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
          <Box
            sx={(theme) => ({
              scrollbarWidth: "thin",
              maxHeight: 300,
              marginTop: "1px",
              overflowY: "auto",
            })}
          >
            <MenuItem disabled value="" sx={{ fontSize: 14 }}>
              Chọn chi nhánh
            </MenuItem>
            <BranchMenuList items={branchOptions} values={selectedBranchIds} onSelect={handleSelect} />
          </Box>
        </Box>
      </Activity>
    </div>
  );
};
export default memo(DepartmentSelectorV2);

type DepartmentMenuItem = { id: string; value: string; label: string; children: DepartmentMenuItem[] };
interface BranchMenuListProps {
  values?: string[];
  items: DepartmentMenuItem[];
  asChild?: boolean;
  depth?: number;
  onSelect: (value: string) => void;
}
const BranchMenuList: React.FC<BranchMenuListProps> = ({
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
    <React.Fragment key={item.value}>
      <StyledMenuItem value={item.value} onClick={() => onSelect(item.value)} disableRipple disableGutters>
        {asChild && <Typography sx={{ paddingLeft: depth * 3 }} />}
        <CheckboxStyled checked={isChecked(item.value)} size="small" />
        <Typography sx={{ fontSize: 14 }}>{item.label}</Typography>
      </StyledMenuItem>
      {item.children.length ? (
        <BranchMenuList items={item.children} values={values} asChild depth={depth + 1} onSelect={onSelect} />
      ) : null}
    </React.Fragment>
  ));
};

function mapChildItems(items: DepartmentItems): DepartmentMenuItem[] {
  return items.map((item) => {
    let children: DepartmentMenuItem["children"] = [];
    if (item.children?.length) {
      children = mapChildItems(item.children);
    }
    return {
      id: item.id,
      label: item.name,
      value: item.id,
      children: children,
    };
  });
}

function flattenDepartments(items: DepartmentItems) {
  return items.reduce<DepartmentItems>((acc, item) => {
    acc = [...acc, item];
    if (item.children?.length) {
      const childItems = flattenDepartments(item.children);
      acc = [...acc, ...childItems];
    }
    return acc;
  }, []);
}
const CheckboxStyled = styled(Checkbox)((theme) => ({
  margin: "4px 8px 4px 0px",
}));

const StyledMenuItem = styled(MenuItem)(() => ({
  "&:hover": {
    backgroundColor: "white",
  },
}));

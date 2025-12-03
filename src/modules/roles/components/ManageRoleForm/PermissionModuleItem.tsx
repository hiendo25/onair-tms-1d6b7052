"use client";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Grid,
} from "@mui/material";
import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ActionOption } from "../../types";
import { UseRolePermissionsReturn } from "../../hooks/useRolePermissionForm";
import { TPermissionActions } from "@/constants/permission.constant";

interface PermissionModuleItemProps extends Pick<UseRolePermissionsReturn, "setSelectedPermissions" | "toggleAction"> {
  moduleId: string;
  moduleName: string;
  availableActions: ActionOption[];
  defaultExpanded?: boolean;
  selectedActions: Set<TPermissionActions>;
}

const PermissionModuleItem: React.FC<PermissionModuleItemProps> = ({
  moduleId,
  moduleName,
  availableActions,
  defaultExpanded = true,
  selectedActions,
  setSelectedPermissions,
  toggleAction,
}) => {
  const selectedCount = selectedActions.size;
  const totalCount = availableActions.length;
  const isFullySelected = selectedCount === totalCount && totalCount > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  const toggleModule = () => {
    setSelectedPermissions((prev) => {
      const newMap = new Map(prev);
      if (isFullySelected) {
        newMap.delete(moduleId);
      } else {
        const allPerms = new Set<TPermissionActions>(availableActions.map((action) => action.code));
        newMap.set(moduleId, allPerms);
      }
      return newMap;
    });
  };

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      sx={{
        bgcolor: "grey.200",
        p: 0,
        borderRadius: 0,
        "&:first-of-type": {
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        },
        "&:last-of-type": {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        },
        borderLeft: 0,
        borderRight: 0,
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2, bgcolor: "white", borderRadius: 0 }}>
        <FormControlLabel
          onClick={(e) => e.stopPropagation()}
          control={
            <Checkbox
              checked={isFullySelected}
              indeterminate={isPartiallySelected && !isFullySelected}
              onChange={() => toggleModule()}
            />
          }
          label={
            <Typography fontWeight={600} width={"100%"}>
              {moduleName}
              <Typography component="span" color="text.secondary" fontWeight={400} sx={{ ml: 1 }}>
                {`${selectedCount}/${totalCount}`}
              </Typography>
            </Typography>
          }
        />
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 0 }}>
        <FormGroup row sx={{ gap: 1 }}>
          <Grid container spacing={1} ml={3}>
            {availableActions.map((action) => {
              const isSelected = selectedActions.has(action.code);
              return (
                <Grid key={action.code} size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleAction(moduleId, action.code)}
                        size="small"
                      />
                    }
                    label={action.label}
                  />
                </Grid>
              );
            })}
          </Grid>
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(PermissionModuleItem, (prevProps, nextProps) => {
  return (
    prevProps.moduleId === nextProps.moduleId &&
    prevProps.moduleName === nextProps.moduleName &&
    prevProps.availableActions === nextProps.availableActions &&
    prevProps.selectedActions.size === nextProps.selectedActions.size
  );
});

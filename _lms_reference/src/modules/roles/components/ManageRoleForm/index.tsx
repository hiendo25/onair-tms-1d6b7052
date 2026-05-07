import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckBox } from "@mui/icons-material";
import { FormControlLabel, Typography } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";

import { PERMISSION_ACTION_OPTIONS, RESOURCE_OPTIONS } from "@/constants/permission.constant";
import RHFTextField from "@/shared/ui/form/RHFTextField";

import { RoleFormData, roleFormSchema } from "./manage-role-form.schema";
interface ManageRoleFormProps {
  onSubmit?: void;
}
const ManageRoleForm: React.FC<ManageRoleFormProps> = () => {
  const methods = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
  });

  const { control } = methods;
  return (
    <div className="manage-role-form-container">
      <FormProvider {...methods}>
        <RHFTextField control={control} name="title" />
        {RESOURCE_OPTIONS.map((resource) => (
          <div key={resource.code} className="flex justify-between">
            <div className="flex-1">
              <Typography>{resource.label}</Typography>
            </div>
            <div className="resource-actions">
              {PERMISSION_ACTION_OPTIONS.map((action) => (
                <FormControlLabel key={action.code} value={action.code} label={action.label} control={<CheckBox />} />
              ))}
            </div>
          </div>
        ))}
      </FormProvider>
    </div>
  );
};
export default ManageRoleForm;

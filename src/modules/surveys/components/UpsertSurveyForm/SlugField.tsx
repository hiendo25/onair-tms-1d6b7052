import React, { useEffect } from "react";
import { Typography } from "@mui/material";
import { Control, useController, useWatch } from "react-hook-form";

import { slugify } from "@/utils/slugify";

import { UpsertSurveyFormData } from "./survey-form.schema";
interface SlugFieldProps {
  control: Control<UpsertSurveyFormData>;
  disableUpdate?: boolean;
}
const SlugField: React.FC<SlugFieldProps> = ({ control, disableUpdate = false }) => {
  const { field, formState } = useController({ control, name: "slug" });
  const title = useWatch({ control, name: "name" });
  const slug = slugify(title);
  useEffect(() => {
    if (disableUpdate) return;
    field.onChange(slug);
  }, [slug, disableUpdate, field]);
  return (
    <>
      <div className="flex items-center gap-2">
        <Typography className="text-xs">Slug:</Typography>
        <Typography className="text-xs">{field.value || "--"}</Typography>
      </div>
    </>
  );
};
export default SlugField;

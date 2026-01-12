import React, { memo, useEffect } from "react";
import { Typography } from "@mui/material";
import { Control, Controller, useController, useWatch } from "react-hook-form";

import { slugify } from "@/utils/slugify";
import { ClassRoomFormValues } from "../../classroom-form.schema";

interface ClassRoomSlugFieldProps {
  control: Control<ClassRoomFormValues>;
  disableUpdateSlug?: boolean;
  onChange: (...event: any[]) => void;
  value: string;
}
const ClassRoomSlugField: React.FC<ClassRoomSlugFieldProps> = ({
  control,
  onChange,
  value,
  disableUpdateSlug = false,
}) => {
  const title = useWatch({ control, name: "title", exact: true });
  console.log("sluggg");
  useEffect(() => {
    if (disableUpdateSlug) return;
    if (!title) return;

    onChange(slugify(title));
  }, [title, onChange, disableUpdateSlug]);
  return (
    <div className="flex items-center gap-2">
      <Typography className="text-xs">Slug:</Typography>
      <Typography className="text-xs">{value || "--"}</Typography>
    </div>
  );
};
export default memo(ClassRoomSlugField);

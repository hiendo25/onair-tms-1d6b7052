import React, { useEffect } from "react";
import { Typography } from "@mui/material";
import { Control, useController, useWatch } from "react-hook-form";

import { slugify } from "@/utils/slugify";
import { ClassRoom } from "../../classroom-form.schema";

interface ClassRoomSlugFieldProps {
  control: Control<ClassRoom>;
  disableUpdateSlug?: boolean;
}
const ClassRoomSlugField: React.FC<ClassRoomSlugFieldProps> = ({ control, disableUpdateSlug = false }) => {
  const {
    field: { value, onChange },
  } = useController({ control, name: "slug" });
  const title = useWatch({ control, name: "title" });

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
export default ClassRoomSlugField;

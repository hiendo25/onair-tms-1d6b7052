import { ClassRoom } from "../../classroom-form.schema";
import { Control, useController, useWatch } from "react-hook-form";
import { Typography } from "@mui/material";
import { slugify } from "@/utils/slugify";
import { useEffect } from "react";

interface ClassRoomSlugFieldProps {
  control: Control<ClassRoom>;
}
const ClassRoomSlugField: React.FC<ClassRoomSlugFieldProps> = ({ control }) => {
  const { field, formState } = useController({ control, name: "slug" });
  const title = useWatch({ control, name: "title" });
  const slug = slugify(title);
  useEffect(() => {
    field.onChange(slug);
  }, [slug]);
  return (
    <>
      <div className="flex items-center gap-2">
        <Typography className="text-xs">Slug:</Typography>
        <Typography className="text-xs">{slug || "--"}</Typography>
      </div>
    </>
  );
};
export default ClassRoomSlugField;

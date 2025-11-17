import { UpsertCourseFormData } from "../../upsert-course.schema";
import { Control, useController, useWatch } from "react-hook-form";
import { Typography } from "@mui/material";
import { slugify } from "@/utils/slugify";
import { useEffect } from "react";

interface SlugFieldProps {
  control: Control<UpsertCourseFormData>;
}
const SlugField: React.FC<SlugFieldProps> = ({ control }) => {
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
export default SlugField;

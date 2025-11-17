import { FormHelperText, FormLabel, IconButton, Typography } from "@mui/material";
import { UpsertCourseFormData } from "../../upsert-course.schema";
import { Control, useController } from "react-hook-form";
import Image from "next/image";
import { cn } from "@/utils";
import { CloseIcon } from "@/shared/assets/icons";
import { useLibraryStore } from "@/modules/library/store/libraryProvider";

export interface ThumbnailUploaderProps {
  onChange?: (url: string) => void;
  control: Control<UpsertCourseFormData>;
  label?: string;
  subTitle?: string;
  description?: React.ReactNode;
}

const ThumbnailUploader: React.FC<ThumbnailUploaderProps> = ({ control, onChange, label, subTitle, description }) => {
  const openResource = useLibraryStore((state) => state.openLibrary);
  const {
    field,
    fieldState: { error },
  } = useController({ control, name: "thumbnailUrl" });

  const handleRemoveThumbnail = () => {
    field.onChange("");
  };

  const handleOpenResouce = async () => {
    const resource = await openResource({ mode: "single" });
    const resourceItem = resource[0];
    const path = resourceItem?.path;
    if (!resourceItem || !resourceItem.mime_type?.includes("image") || !path) return;

    field.onChange(path);
  };
  return (
    <div>
      <FormLabel component="div" className="mb-2 inline-block">
        {label}
        <span className="text-red-600 ml-1">*</span>
      </FormLabel>
      {subTitle ? <Typography className="text-xs mb-4">{subTitle}</Typography> : null}
      {description ? <div className="description">{description}</div> : null}
      <div
        className={cn(
          "thumbnail-wraper",
          "aspect-video w-[480px] bg-gray-100 rounded-xl border border-dashed border-gray-300",
          "flex items-center justify-center",
        )}
      >
        {field.value && (
          <div className="preview-url aspect-video relative w-full overflow-hidden rounded-xl">
            <Image src={field.value} alt="thumbnail" fill className="w-full h-full object-cover" />
            <IconButton
              sx={{ width: "2rem", height: "2rem", position: "absolute", right: "0.5rem", top: "0.5rem" }}
              onClick={handleRemoveThumbnail}
            >
              <CloseIcon className="w-4 h-4" />
            </IconButton>
          </div>
        )}
        <div
          className={cn("text-center cursor-pointer", {
            "opacity-0 hidden pointer-events-none": field.value,
          })}
          onClick={handleOpenResouce}
        >
          <Image
            src="/assets/icons/upload-cloud.svg"
            width={80}
            height={40}
            alt="upload icon"
            className="mb-3 mx-auto"
          />
          <Typography
            sx={(theme) => ({
              color: theme.palette.primary["dark"],
              backgroundColor: theme.palette.primary["lighter"],
              fontWeight: "bold",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "0.75rem",
            })}
          >
            Tải ảnh lên
          </Typography>
        </div>
      </div>
      {error?.message ? <FormHelperText error={!!error}>{error.message}</FormHelperText> : null}
    </div>
  );
};
export default ThumbnailUploader;

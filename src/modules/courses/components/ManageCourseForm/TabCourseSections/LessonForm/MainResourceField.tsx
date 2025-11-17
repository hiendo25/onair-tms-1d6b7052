import { memo, useCallback } from "react";
import Image from "next/image";
import { Control, useController } from "react-hook-form";
import { useSnackbar } from "notistack";
import { cn } from "@/utils";
import { LessonType } from "@/model/lesson.model";
import { useLibraryStore } from "@/modules/library/store/libraryProvider";
import { FormHelperText, FormLabel, Typography } from "@mui/material";
import { UpsertCourseFormData } from "../../upsert-course.schema";
import VideoViewItem from "./VideoItemView";
import FileViewItem from "./FileViewItem";
export interface MainResourceFieldProps {
  onChange?: (url: string) => void;
  control: Control<UpsertCourseFormData>;
  lessonType: Extract<LessonType, "video" | "file">;
  sectionIndex: number;
  lessonIndex: number;
  subTitle?: string;
}
const MainResourceField: React.FC<MainResourceFieldProps> = ({
  control,
  subTitle,
  sectionIndex,
  lessonIndex,
  lessonType,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ control, name: `sections.${sectionIndex}.lessons.${lessonIndex}.mainResource` });
  const openLibrary = useLibraryStore((state) => state.openLibrary);

  const handleSelectLibrary = async () => {
    const selectingResource = await openLibrary({ mode: "single" });
    const resourceItem = selectingResource[0];

    if (!resourceItem || !resourceItem.path || !resourceItem.mime_type) return;

    if (lessonType === "video" && !resourceItem.mime_type?.includes("video")) {
      enqueueSnackbar("Định dạng không hợp lệ", { variant: "warning" });
      return;
    }

    if (lessonType === "file" && !resourceItem.mime_type?.includes("application/pdf")) {
      enqueueSnackbar("Định dạng không hợp lệ", { variant: "warning" });
      return;
    }

    onChange({
      id: resourceItem.id,
      mimeType: resourceItem.mime_type,
      name: resourceItem.name,
      url: resourceItem.path,
    });
  };

  const handleRemove = useCallback(() => {
    onChange(undefined);
  }, [onChange]);

  return (
    <div>
      <FormLabel component="div" className="mb-2 inline-block">
        {lessonType === "video" ? "Video" : lessonType === "file" ? "Tài liệu PDF" : "--"}
        <span className="text-red-600 ml-1">*</span>
      </FormLabel>
      {subTitle ? <Typography className="text-xs mb-4">{subTitle}</Typography> : null}
      {value ? (
        <>
          {lessonType === "video" && <VideoViewItem videoUrl={value.url} onClickRemove={handleRemove} />}
          {lessonType === "file" && (
            <FileViewItem fileName={value.name} fileUrl={value.url} onClickRemove={handleRemove} />
          )}
        </>
      ) : (
        <div
          className={cn(
            "thumbnail-wraper",
            "aspect-video w-[460px] bg-gray-100 rounded-xl border border-dashed border-gray-300",
            "flex items-center justify-center",
          )}
        >
          <div className="text-center cursor-pointer" onClick={handleSelectLibrary}>
            <Image
              src={
                lessonType === "video"
                  ? "/assets/icons/video-upload-icon.png"
                  : lessonType === "file"
                  ? "/assets/icons/pdf-upload-icon.png"
                  : "/assets/icons/folder-icon.svg"
              }
              width={58}
              height={30}
              quality={100}
              alt="upload icon"
              className="mb-3 mx-auto"
            />
            <Typography
              sx={(theme) => ({
                color: theme.palette.primary["dark"],
                backgroundColor: theme.palette.primary["lighter"],
                fontWeight: "bold",
                borderRadius: "8px",
                padding: "4px 8px",
                fontSize: "0.75rem",
              })}
            >
              {lessonType === "video" ? "Tải lên video" : lessonType === "file" ? "Tải lên PDF" : "Tải lên"}
            </Typography>
          </div>
        </div>
      )}
      {error?.message && <FormHelperText error>{error.message}</FormHelperText>}
    </div>
  );
};
export default memo(MainResourceField);

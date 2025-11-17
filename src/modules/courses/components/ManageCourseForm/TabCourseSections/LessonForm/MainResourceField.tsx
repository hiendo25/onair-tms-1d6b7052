import { FormHelperText, FormLabel, IconButton, Typography } from "@mui/material";
import { UpsertCourseFormData } from "../../upsert-course.schema";
import { Control, useController } from "react-hook-form";
import Image from "next/image";
import { cn } from "@/utils";
import { CloseIcon, FilePdfIcon } from "@/shared/assets/icons";
import { useLibraryStore } from "@/modules/library/store/libraryProvider";
import { LessonType } from "@/model/lesson.model";
import { useSnackbar } from "notistack";
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

  const handleRemove = () => {
    onChange(undefined);
  };
  return (
    <div>
      <FormLabel component="div" className="mb-2 inline-block">
        {lessonType === "video" ? "Video" : lessonType === "file" ? "Tài liệu PDF" : "--"}
        <span className="text-red-600 ml-1">*</span>
      </FormLabel>
      {subTitle ? <Typography className="text-xs mb-4">{subTitle}</Typography> : null}
      {value ? (
        <>
          {lessonType === "video" ? (
            <div className="aspect-video rounded-lg w-[460px] overflow-hidden relative">
              <video src={value.url} controls className="absolute left-0 top-0 w-full h-full object-cover" />
              <IconButton className="w-6 h-6 absolute top-1 right-1" onClick={handleRemove}>
                <CloseIcon className="w-4 h-4" />
              </IconButton>
            </div>
          ) : lessonType === "file" ? (
            <div className="w-32 px-1 mb-2">
              <div className="py-4 px-2 bg-gray-100 relative flex flex-col rounded-lg w-full h-full">
                <div className="file-icon mx-auto mb-4">
                  <FilePdfIcon className="w-10 h-10" />
                </div>
                <div className="file-name line-clamp-2 text-xs text-center">
                  <a href={value.url} target="__blank">
                    {value.name}
                  </a>
                </div>
                <IconButton className="w-6 h-6 absolute top-1 right-1" onClick={handleRemove}>
                  <CloseIcon className="w-4 h-4" />
                </IconButton>
              </div>
            </div>
          ) : lessonType === "assessment" ? (
            "assessment"
          ) : (
            "unknown"
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
export default MainResourceField;

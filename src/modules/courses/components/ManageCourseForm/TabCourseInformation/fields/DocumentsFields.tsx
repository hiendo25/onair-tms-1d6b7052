import { Button, FormLabel, IconButton, Typography } from "@mui/material";
import { UpsertCourseFormData } from "../../upsert-course.schema";
import { Control, useFieldArray } from "react-hook-form";
import Image from "next/image";
import { cn } from "@/utils";
import { CloseIcon, FileExcelIcon, FileImageIcon, FileVideoIcon } from "@/shared/assets/icons";
import { useLibraryStore } from "@/modules/library/store/libraryProvider";
import FileUnknownIcon from "@/shared/assets/icons/FileUnknownIcon";

export interface DocumentsFieldsProps {
  onChange?: (url: string) => void;
  control: Control<UpsertCourseFormData>;
  label?: string;
  subTitle?: string;
  className?: string;
}
const DocumentsFields: React.FC<DocumentsFieldsProps> = ({ control, label, subTitle, className }) => {
  const openLibrary = useLibraryStore((state) => state.openLibrary);

  const {
    fields: documents,
    remove,
    append,
  } = useFieldArray({
    control,
    name: "docs",
    keyName: "_docs",
  });

  const handleSelectLibrary = async () => {
    const selectingItems = await openLibrary({ mode: "multiple", selectedIds: documents.map((item) => item.id) });

    const resourcesItemsMap = new Map(selectingItems.map((item) => [item.id, item]));

    let resourceItemsMaped: UpsertCourseFormData["sections"][number]["lessons"][number]["resources"] = [];
    resourcesItemsMap.forEach((it) => {
      resourceItemsMaped = [
        ...resourceItemsMaped,
        {
          id: it.id,
          mimeType: it.mime_type || "",
          name: it.name,
          url: it.path || "",
        },
      ];
    });
    remove(documents.map((_, index) => index));
    append(resourceItemsMaped);
  };

  const handleClear = () => {
    remove(documents.map((_, index) => index));
  };
  return (
    <div className={className}>
      <FormLabel component="div" className="mb-2 inline-block">
        {label}
      </FormLabel>
      {subTitle ? <Typography className="text-xs mb-4">{subTitle}</Typography> : null}
      {documents.length ? (
        <div>
          <div className="flex flex-wrap mb-4 -mx-2">
            {documents.map((item, _index) => (
              <div key={_index} className="w-32 px-1 mb-2">
                <div className="py-4 px-2 bg-gray-100 relative flex flex-col rounded-lg w-full h-full">
                  <div className="file-icon mx-auto mb-4">
                    {item.mimeType.includes("image") ? (
                      <FileImageIcon className="w-10 h-10" />
                    ) : item.mimeType === "text/csv" ? (
                      <FileExcelIcon className="w-10 h-10" />
                    ) : item.mimeType.includes("video") ? (
                      <FileVideoIcon className="w-10 h-10" />
                    ) : (
                      <FileUnknownIcon className="w-10 h-10" />
                    )}
                  </div>
                  <div className="file-name line-clamp-2 text-xs text-center">
                    <a href={item.url} target="__blank">
                      {item.name}
                    </a>
                  </div>
                  <IconButton className="w-6 h-6 absolute top-1 right-1" onClick={() => remove(_index)}>
                    <CloseIcon className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-x-2">
            <Button variant="fill" size="small" onClick={handleSelectLibrary}>
              Tải lên
            </Button>
            <Button variant="outlined" size="small" onClick={handleClear} color="inherit">
              Xoá hết
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "thumbnail-wraper",
            "aspect-6/2 w-full bg-gray-100 rounded-xl border border-dashed border-gray-300",
            "flex items-center justify-center py-6",
          )}
        >
          <div className="text-center cursor-pointer" onClick={handleSelectLibrary}>
            <Image
              src="/assets/icons/folder-icon.svg"
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
              Tải lên tài liệu
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
};
export default DocumentsFields;

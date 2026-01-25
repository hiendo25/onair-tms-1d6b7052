"use client";
import React, { memo } from "react";
import { Box, Button, FormLabel, IconButton, Typography } from "@mui/material";
import { Control, useFieldArray } from "react-hook-form";
import { useFormContext } from "react-hook-form";

import { useLibraryStore } from "@/modules/library/store/libraryProvider";
import {
  CloseIcon,
  CloudUploadIcon,
  FileExcelIcon,
  FileImageIcon,
  FilePdfIcon,
  FileVideoIcon,
} from "@/shared/assets/icons";
import FileUnknownIcon from "@/shared/assets/icons/FileUnknownIcon";
import { ClassRoomFormValues } from "../../classroom-form.schema";
interface DocumentFieldsProps {
  className?: string;
  control: Control<ClassRoomFormValues>;
}
const DocumentFields: React.FC<DocumentFieldsProps> = ({ className, control }) => {
  const openLibrary = useLibraryStore((state) => state.openLibrary);

  const {
    fields: resourceItems,
    remove,
    append,
  } = useFieldArray({
    control,
    name: "docs",
    keyName: "_docs",
  });

  console.log("render doccc");
  const handleSelectLibrary = async () => {
    const selectingItems = await openLibrary({ mode: "multiple", selectedIds: resourceItems.map((item) => item.id) });

    const resourcesItemsMap = new Map(selectingItems.map((item) => [item.id, item]));

    let resourceAppendItems: Exclude<ClassRoomFormValues["docs"], undefined> = [];
    resourcesItemsMap.forEach((it) => {
      resourceAppendItems = [
        ...resourceAppendItems,
        {
          id: it.id,
          mimeType: it.mime_type || "",
          name: it.name,
          url: it.path || "",
        },
      ];
    });
    remove(resourceItems.map((_, index) => index));
    append(resourceAppendItems);
  };

  return (
    <div className={className}>
      <FormLabel component="div">Tài liệu</FormLabel>
      <Typography sx={{ fontSize: "0.875rem", color: "text.secondary", mb: 3 }}>
        Tải lên các tài liệu, slide hoặc hướng dẫn để hỗ trợ học viên trong quá trình học.
      </Typography>
      {resourceItems.length ? (
        <div className="flex flex-wrap mb-4 -mx-2">
          {resourceItems.map((item, _index) => (
            <div key={item.id} className="w-32 px-1 mb-2">
              <div className="py-4 px-2 bg-gray-100 relative flex flex-col rounded-lg w-full h-full">
                <div className="file-icon mx-auto mb-4">
                  {item.mimeType.includes("image") ? (
                    <FileImageIcon className="w-10 h-10" />
                  ) : item.mimeType === "text/csv" ? (
                    <FileExcelIcon className="w-10 h-10" />
                  ) : item.mimeType.includes("video") ? (
                    <FileVideoIcon className="w-10 h-10" />
                  ) : item.mimeType.includes("application/pdf") ? (
                    <FilePdfIcon className="w-10 h-10" />
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
      ) : null}
      <Button onClick={handleSelectLibrary} startIcon={<CloudUploadIcon className="w-5 h-5" />} size="small">
        Tải lên
      </Button>
    </div>
  );
};
export default memo(DocumentFields);

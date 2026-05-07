import React, { useCallback, useState } from "react";
import { Button, Popover, Stack, TextField, Typography } from "@mui/material";
import { Editor } from "@tiptap/react";

import { editorClasses } from "../../classes";

import { ToolbarItem } from "./toolbar-item";
// import { useStoreLibrary } from "@onair/store/library";

const FILE_TYPES = ["video/mp4", "application/pdf", "image/png", "image/jpeg"];
type LibraryResourceBlockProps = {
  editor: Editor;
};

const LibraryResourceBlock: React.FC<LibraryResourceBlockProps> = ({ editor }) => {
  // const onOpenResource = useStoreLibrary((state) => state.onOpenResource);

  const handleOpenResource = () => {
    // onOpenResource?.({
    //   isMultiple: true,
    //   selecteds: [],
    //   onSelection: (resources) => {
    //     resources.forEach((item) => {
    //       console.log(item);
    //       if (!item.linkUrl) return;
    //       if (item.fileType?.includes("video")) {
    //         editor
    //           ?.chain()
    //           .setCustomVideo({
    //             src: item.linkUrl,
    //           })
    //           .run();
    //       }
    //       if (item.fileType?.includes("image")) {
    //         editor?.chain().setImage({ src: item.linkUrl }).run();
    //       }
    //     });
    //   },
    // });
  };

  return (
    <ToolbarItem
      aria-label="Image"
      className={editorClasses.toolbar.image}
      onClick={handleOpenResource}
      icon={
        <path d="M20 5H4V19L13.2923 9.70649C13.6828 9.31595 14.3159 9.31591 14.7065 9.70641L20 15.0104V5ZM2 3.9934C2 3.44476 2.45531 3 2.9918 3H21.0082C21.556 3 22 3.44495 22 3.9934V20.0066C22 20.5552 21.5447 21 21.0082 21H2.9918C2.44405 21 2 20.5551 2 20.0066V3.9934ZM8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7C9.10457 7 10 7.89543 10 9C10 10.1046 9.10457 11 8 11Z" />
      }
    />
  );
};
export default LibraryResourceBlock;

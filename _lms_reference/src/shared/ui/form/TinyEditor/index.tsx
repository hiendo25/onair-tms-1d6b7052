"use client";
import React, { forwardRef, memo, useEffect } from "react";
import { SxProps, Theme } from "@mui/material";
import FormHelperText from "@mui/material/FormHelperText";
import Stack from "@mui/material/Stack";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import { EditorOptions } from "@tiptap/react";

import { editorClasses } from "./classes";
import { EditorContainer } from "./EditorContainer";
import EditorToolbar from "./EditorToolbar";
import { extensions } from "./extensions";
export type TinyEditorProps = Partial<EditorOptions> & {
  value?: string;
  error?: boolean;
  sx?: SxProps<Theme>;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  helperText?: React.ReactNode;
  onChange?: (value: string) => void;
  slotProps?: {
    wrap: SxProps<Theme>;
    container: SxProps<Theme>;
  };
};

const TinyEditor = forwardRef<HTMLDivElement, TinyEditorProps>(
  (
    {
      sx,
      error,
      onChange,
      slotProps,
      helperText,
      editable = true,
      maxHeight,
      minHeight,
      value: content = "",
      placeholder = "Nội dung",
    },
    ref,
  ) => {
    const editor = useEditor({
      immediatelyRender: false,
      editable,
      content,
      extensions: [
        ...extensions,
        Placeholder.configure({
          placeholder,
          emptyEditorClass: editorClasses.content.placeholder,
        }),
      ],
      onUpdate({ editor }) {
        let html = editor.getHTML();
        if (html === "<p></p>") html = "";
        onChange?.(html);
      },
    });

    useEffect(() => {
      if (!editor) return;

      const currentHTML = editor.getHTML();
      if (currentHTML !== content) {
        editor.commands.setContent(content || "");
      }
    }, [content, editor]);

    return (
      <Stack
        sx={{
          ...(!editable && { cursor: "not-allowed" }),
          ...slotProps?.wrap,
        }}
      >
        <EditorContainer
          error={!!error}
          disabled={!editable}
          minHeight={minHeight}
          maxHeight={maxHeight}
          className={editorClasses.root}
          sx={sx}
        >
          <EditorToolbar editor={editor} />
          <EditorContent
            ref={ref}
            spellCheck="false"
            autoComplete="off"
            autoCapitalize="off"
            editor={editor}
            role="presentation"
            className={editorClasses.content.root}
          />
        </EditorContainer>
        {helperText && <FormHelperText error={!!error}>{helperText}</FormHelperText>}
      </Stack>
    );
  },
);
export default memo(TinyEditor);

import type { SxProps, Theme } from "@mui/material/styles";
import type { Editor, EditorOptions, Extension } from "@tiptap/react";

export type EditorProps = Partial<EditorOptions> & {
  value?: string;
  error?: boolean;
  fullItem?: boolean;
  resourceItem?: boolean;
  resetValue?: boolean;
  sx?: SxProps<Theme>;
  placeholder?: string;
  helperText?: React.ReactNode;
  onChange?: (value: string) => void;
  slotProps?: {
    wrap: SxProps<Theme>;
  };
};

export type EditorToolbarProps = {
  fullScreen: boolean;
  editor: Editor | null;
  onToggleFullScreen: () => void;
  fullItem?: EditorProps["fullItem"];
  resourceItem?: EditorProps["resourceItem"];
};

export type EditorToolbarItemProps = {
  icon?: React.ReactNode;
  label?: string;
  active?: boolean;
  disabled?: boolean;
};

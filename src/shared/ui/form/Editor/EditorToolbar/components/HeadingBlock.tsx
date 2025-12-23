import React, { useCallback, useState } from "react";
import { alpha, MenuItem } from "@mui/material";
import ButtonBase from "@mui/material/ButtonBase";
import Menu from "@mui/material/Menu";

import { ParagraphIcon } from "@/shared/assets/icons";
import type { EditorToolbarProps } from "../../types";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const HEADING_OPTIONS = ["Heading 1", "Heading 2", "Heading 3", "Heading 4", "Heading 5", "Heading 6"];

interface HeadingBlockProps {
  editor: Exclude<EditorToolbarProps["editor"], null>;
}
const HeadingBlock: React.FC<HeadingBlockProps> = ({ editor }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickParagraph = useCallback(() => {
    editor.chain().focus().setParagraph().run();
    setAnchorEl(null);
  }, [editor]);

  const handleClickHeading = useCallback(
    (level: HeadingLevel) => () => {
      editor.chain().focus().toggleHeading({ level }).run();
      setAnchorEl(null);
    },
    [editor],
  );

  const hasActiveHeading = (level: number) => {
    if (!editor) return false;
    return editor.isActive("heading", { level });
  };

  return (
    <>
      <ButtonBase
        id="heading-menu-button"
        aria-label="Heading menu button"
        aria-controls={anchorEl ? "heading-menu-button" : undefined}
        aria-haspopup="true"
        aria-expanded={anchorEl ? "true" : undefined}
        onClick={handleClick}
        sx={{
          px: 1,
          minWidth: 90,
          height: 32,
          textAlign: "center",
          borderRadius: 0.75,
          typography: "body2",
          justifyContent: "space-between",
          border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.2)}`,
        }}
      >
        {(hasActiveHeading(1) && "Heading 1") ||
          (hasActiveHeading(2) && "Heading 2") ||
          (hasActiveHeading(3) && "Heading 3") ||
          (hasActiveHeading(4) && "Heading 4") ||
          (hasActiveHeading(5) && "Heading 5") ||
          (hasActiveHeading(6) && "Heading 6") ||
          "Paragraph"}
        <ParagraphIcon width={16} height={16} className="w-4 h-4 ml-2" />
      </ButtonBase>
      <Menu id="heading-menu" anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
        <MenuItem onClick={handleClickParagraph} sx={{ fontSize: 14 }}>
          Paragraph
        </MenuItem>
        {HEADING_OPTIONS.map((heading, index) => {
          const level = (index + 1) as HeadingLevel;
          return (
            <MenuItem
              key={heading}
              aria-label={heading}
              sx={{
                fontSize: 20 + index - index * 3,
                fontWeight: "bold",
              }}
              onClick={handleClickHeading(level)}
            >
              {heading}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
export default HeadingBlock;

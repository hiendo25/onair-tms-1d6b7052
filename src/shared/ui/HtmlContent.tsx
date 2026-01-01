"use client";
import React, { memo } from "react";
import { ContentCutOutlined } from "@mui/icons-material";
import { styled } from "@mui/material";
import { isNull, isUndefined } from "lodash";

interface HtmlContentProps {
  content?: string | null;
}
const HtmlContent: React.FC<HtmlContentProps> = ({ content = "" }) => {
  if (!content) return null;
  return <WrapContent className="content-wrapper" dangerouslySetInnerHTML={{ __html: content }}></WrapContent>;
};
export default memo(HtmlContent);

const WrapContent = styled("div")(() => ({
  p: {
    marginBottom: "10px",
  },
  "ul, ol": {
    listStyleType: "disc",
    paddingLeft: 20,
    marginBlock: 16,
  },
}));

"use client";
import React, { memo } from "react";
import { styled } from "@mui/material";

interface HtmlContentProps {
  content?: string | null;
}
const HtmlContent: React.FC<HtmlContentProps> = ({ content = "" }) => {
  return <WrapContent className="content-wraper" dangerouslySetInnerHTML={{ __html: content ?? "" }}></WrapContent>;
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

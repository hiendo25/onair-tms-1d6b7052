"use client";
import { Breadcrumbs, breadcrumbsClasses, styled } from "@mui/material";
const PageContentHeader = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  gap: theme.spacing(2),
}));
export default PageContentHeader;

"use client";
import { Breadcrumbs, breadcrumbsClasses, styled } from "@mui/material";
const PageHeaderBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: "center",
  },
}));
export default PageHeaderBreadcrumbs;

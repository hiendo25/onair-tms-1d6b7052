"use client";
import TabList, { TabListProps } from "@mui/lab/TabList";
import { styled } from "@mui/material";
import { useTheme } from "@mui/material";
import { tabClasses } from "@mui/material";

export const CustomTabList = styled((props: TabListProps) => (
  <TabList {...props} />
))(() => {
  const theme = useTheme();
  return {
    borderColor: theme.palette.grey[400],
    fontSize: theme.typography.fontSize,
    //  background: "red",

    [`.MuiTabs-list`]: {
      zIndex: 10,
      position: "relative",
    },
    //  [`.MuiTabs-indicator`]: {
    //    height: "100%",
    //    borderRadius: theme.shape.borderRadius,
    //  },
    [`& .${tabClasses.root}`]: {
      padding: "10px",
      marginBottom: 0,
      [`& .${tabClasses.selected}`]: {
        color: "white",
      },
    },
  };
});

"use client";
import * as React from "react";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import Tab from "@mui/material/Tab";

import { cn } from "@/utils";

interface CustomTabsProps {
  items: {
    tabName: React.ReactNode;
    tabKey: string;
    content?: React.ReactNode;
    isValid?: boolean;
    isError?: boolean;
  }[];
  className?: string;
}

import { CustomTabList } from "./TabList";

const CustomTabs: React.FC<CustomTabsProps> = ({ items, className }) => {
  const [currentTab, setCurrentTab] = React.useState(
    () => items?.[0]?.tabKey || "",
  );
  const handleChange = React.useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      setCurrentTab(newValue);
    },
    [],
  );

  return (
    <div className={cn("custom-tab", className)}>
      <TabContext value={currentTab}>
        <CustomTabList
          onChange={handleChange}
          sx={{
            paddingInline: "1.5rem",
            paddingBlock: "1.25rem",
            ".MuiTabs-list": {
              gap: "1rem",
            },
            ".MuiTab-root": {
              textTransform: "inherit",
            },
          }}
        >
          {items.map(({ tabKey, tabName, isError, isValid }) => (
            <Tab
              key={tabKey}
              label={tabName}
              value={tabKey}
              className={cn("px-0", { "is-error": isError })}
              sx={{
                "&.is-error": {
                  background: "red",
                },
              }}
            />
          ))}
        </CustomTabList>

        {items.map((item) => (
          <TabPanel key={item.tabKey} value={item.tabKey}>
            {item?.content}
          </TabPanel>
        ))}
      </TabContext>
    </div>
  );
};
export default CustomTabs;

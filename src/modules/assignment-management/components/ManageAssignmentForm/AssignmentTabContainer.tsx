"use client";
import * as React from "react";
import { useTransition } from "react";
import TabContext from "@mui/lab/TabContext";
import TabList, { TabListProps } from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Button, styled, SxProps, Theme } from "@mui/material";
import { useTheme } from "@mui/material";
import { tabClasses } from "@mui/material";
import Tab, { TabProps } from "@mui/material/Tab";

import { CheckCircleIcon } from "@/shared/assets/icons";
import { cn } from "@/utils";

import { TAB_KEYS_ASSIGNMENT } from "./AssignmentFormContainer";

type AssignmentTabStatus = "idle" | "invalid" | "valid";
type TabKeyType = keyof typeof TAB_KEYS_ASSIGNMENT;

type AssignmentTabItem = {
  tabName: React.ReactNode;
  tabKey: TabKeyType;
  content?: React.ReactNode;
  status?: AssignmentTabStatus;
  icon?: React.ReactNode;
};

export interface AssignmentTabContainerProps {
  items: AssignmentTabItem[];
  actions: React.ReactNode;
  className?: string;
  checkStatusTab: (tabKey: TabKeyType) => Promise<boolean>;
}

const AssignmentTabContainer: React.FC<AssignmentTabContainerProps> = ({
  items,
  className,
  actions,
  checkStatusTab,
}) => {
  const [currentTab, setCurrentTab] = React.useState<TabKeyType | undefined>(() => items?.[0]?.tabKey);
  const [isGotoNextTab, startGotoNextTab] = useTransition();

  const handleChange = React.useCallback((event: React.SyntheticEvent, newValue: TabKeyType) => {
    setCurrentTab(newValue);
  }, []);

  const goNextOrBackStep = (action: "next" | "back") => () => {
    if (!currentTab) {
      console.error("Current tab is undefined");
      return;
    }
    startGotoNextTab(async () => {
      const isCurrentTabValid = await checkStatusTab(currentTab);

      if (!isCurrentTabValid) return;
      if (currentTab === "assignTab-information") {
        setCurrentTab(action === "next" ? "assignTab-content" : "assignTab-information");
      }
      if (currentTab === "assignTab-content") {
        setCurrentTab(action === "next" ? "assignTab-settings" : "assignTab-information");
      }
      if (currentTab === "assignTab-settings") {
        setCurrentTab(action === "next" ? "assignTab-settings" : "assignTab-content");
      }
    });
  };

  return (
    <div className={cn("assignment-tabs", className)}>
      <TabContext value={currentTab ?? ""}>
        <div className="flex items-center justify-between mb-6">
          <AssignmentTabList onChange={handleChange}>
            {items.map(({ tabKey, tabName, status = "idle", icon }) => (
              <Tab
                key={tabKey}
                value={tabKey}
                label={
                  <div className="flex items-center gap-1">
                    {status === "valid" ? <CheckCircleIcon /> : icon ? icon : null}
                    {tabName}
                  </div>
                }
                className={cn("px-0", {
                  "is-invalid": status === "invalid",
                  "is-valid": status === "valid",
                })}
              />
            ))}
          </AssignmentTabList>
          <div className="tab-actions">{actions}</div>
        </div>
        <div className="grid gap-6 grid-cols-1">
          <div className="panels-wraper">
            {items.map((item) => (
              <TabPanel key={item.tabKey} value={item.tabKey} className="p-0">
                {item?.content}
              </TabPanel>
            ))}
            <div className={cn({ hidden: currentTab === "assignTab-settings" })}>
              <div className={cn("py-6 flex justify-between")}>
                <Button variant="outlined" color="inherit" onClick={goNextOrBackStep("back")} disabled={isGotoNextTab}>
                  Quay lại
                </Button>
                <Button variant="fill" onClick={goNextOrBackStep("next")} disabled={isGotoNextTab}>
                  Tiếp tục
                </Button>
              </div>
            </div>
          </div>
        </div>
      </TabContext>
    </div>
  );
};

export default AssignmentTabContainer;

const AssignmentTabList = styled((props: TabListProps) => <TabList {...props} />)(() => {
  const theme = useTheme();
  return {
    borderColor: theme.palette.grey[400],
    fontSize: theme.typography.fontSize,
    [`.MuiTabs-list`]: {
      zIndex: 10,
      gap: 24,
      position: "relative",
      [`& .${tabClasses.root}`]: {
        padding: "10px",
        marginBottom: 0,
        [`& .${tabClasses.selected}`]: {
          color: "white",
        },
        textTransform: "inherit",
        color: `${theme.palette.grey[900]} !important`,
        "&.is-invalid": {
          color: `${theme.palette.error["main"]} !important`,
        },
        "&.is-valid": {
          color: `${theme.palette.primary["main"]} !important`,
        },
        "&:not(.Mui-selected)": {
          opacity: 0.6,
        },
      },
    },
    ".MuiTabs-indicator": {
      backgroundColor: `${theme.palette.grey[900]} !important`,
    },
  };
});

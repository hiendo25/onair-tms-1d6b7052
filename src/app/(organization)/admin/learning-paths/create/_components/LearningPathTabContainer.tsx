"use client";

import React, { useCallback, useState, useTransition } from "react";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import TabList, { TabListProps } from "@mui/lab/TabList";
import { Button, styled, useTheme, tabClasses } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LayersIcon from "@mui/icons-material/Layers";
import SettingsIcon from "@mui/icons-material/Settings";
import { cn } from "@/utils/cn";

type TabKeyType = "tab-info" | "tab-phases" | "tab-settings";
type TabStatus = "idle" | "valid" | "invalid";

type LearningPathTabItem = {
  tabName: React.ReactNode;
  tabKey: TabKeyType;
  content?: React.ReactNode;
  status?: TabStatus;
  icon?: React.ReactNode;
};

export interface LearningPathTabContainerProps {
  items: LearningPathTabItem[];
  actions: React.ReactNode;
  className?: string;
  checkStatusTab: (tabKey: TabKeyType) => Promise<boolean>;
}

const LearningPathTabContainer: React.FC<LearningPathTabContainerProps> = ({
  items,
  className,
  actions,
  checkStatusTab,
}) => {
  const [currentTab, setCurrentTab] = useState<TabKeyType | undefined>(() => items?.[0]?.tabKey);
  const [isGotoNextTab, startGotoNextTab] = useTransition();

  const handleChange = useCallback((event: React.SyntheticEvent, newValue: TabKeyType) => {
    setCurrentTab(newValue);
  }, []);

  const currentTabIndex = items.findIndex((item) => item.tabKey === currentTab);

  const goNextOrBackStep = useCallback(
    (type: "next" | "back") => async () => {
      if (type === "next") {
        const isValid = await checkStatusTab(currentTab!);
        if (!isValid) return;

        startGotoNextTab(() => {
          const nextTab = items[currentTabIndex + 1];
          if (nextTab) {
            setCurrentTab(nextTab.tabKey);
          }
        });
      } else {
        const prevTab = items[currentTabIndex - 1];
        if (prevTab) {
          setCurrentTab(prevTab.tabKey);
        }
      }
    },
    [checkStatusTab, currentTab, currentTabIndex, items]
  );

  return (
    <div className={cn("learning-path-tabs", className)}>
      <TabContext value={currentTab ?? ""}>
        <div className="bg-white rounded-xl flex items-center justify-between mb-6 px-6 py-4">
          <LearningPathTabList onChange={handleChange}>
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
          </LearningPathTabList>
          <div className="tab-actions">{actions}</div>
        </div>
        <div className="grid gap-6 grid-cols-1">
          <div className="panels-wrapper">
            {items.map((item) => (
              <TabPanel key={item.tabKey} value={item.tabKey} className="p-0">
                {item?.content}
              </TabPanel>
            ))}
            <div className={cn({ hidden: currentTab === "tab-settings" })}>
              <div className={cn("py-6 flex justify-between")}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={goNextOrBackStep("back")}
                  disabled={isGotoNextTab || currentTabIndex === 0}
                >
                  Quay lại
                </Button>
                <Button variant="contained" onClick={goNextOrBackStep("next")} disabled={isGotoNextTab}>
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

export default LearningPathTabContainer;

const LearningPathTabList = styled((props: TabListProps) => <TabList {...props} />)(() => {
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


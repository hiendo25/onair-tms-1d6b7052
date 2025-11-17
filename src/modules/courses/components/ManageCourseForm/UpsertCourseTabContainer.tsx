"use client";
import React, { useCallback, useState, useImperativeHandle } from "react";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import TabList, { TabListProps } from "@mui/lab/TabList";
import { Button, styled } from "@mui/material";
import { useTheme } from "@mui/material";
import { tabClasses } from "@mui/material";
import { cn } from "@/utils";
import { CheckCircleIcon } from "@/shared/assets/icons";
import { TAB_KEYS_MANAGE_COURSE, TAB_NODES_MANAGE_COURSE } from "./UpsertCourseFormContainer";
import { useTransition } from "react";
import { getKeyFieldByTab } from "./utils";
import { UseFormTrigger } from "react-hook-form";
import { UpsertCourseFormData } from "./upsert-course.schema";

type ClassRoomTabStatus = "idle" | "invalid" | "valid";
type TabKeyType = keyof typeof TAB_KEYS_MANAGE_COURSE;
type ClassRoomTabItem = {
  tabName: React.ReactNode;
  tabKey: TabKeyType;
  content?: React.ReactNode;
  icon?: React.ReactNode;
};
type TabStateType = Record<TabKeyType, { status: ClassRoomTabStatus }>;
export interface UpsertCourseTabContainerRef {
  setTabStatus: (tabKey: TabKeyType, status: ClassRoomTabStatus) => void;
}
export interface UpsertCourseTabContainerProps {
  items: ClassRoomTabItem[];
  actions: React.ReactNode;
  className?: string;
  trigger: UseFormTrigger<UpsertCourseFormData>;
}

const UpsertCourseTabContainer = React.forwardRef<UpsertCourseTabContainerRef, UpsertCourseTabContainerProps>(
  ({ items, className, actions, trigger }, ref) => {
    const [isGotoNextTab, startGotoNextTab] = useTransition();
    const [currentTab, setCurrentTab] = useState<TabKeyType>(() => items?.[0]?.tabKey || "clsTab-information");
    const [tabsState, setTabsState] = useState<TabStateType>(
      () => Object.fromEntries(items.map((tab) => [tab.tabKey, { status: "idle" }])) as TabStateType,
    );

    /**
     * Trigger validate all field in current tab before process next action
     */
    const validateCurrentTabBeforeProceed = useCallback(async (tab: TabKeyType, callback?: () => void) => {
      const keyList = getKeyFieldByTab(tab);

      const isValid = (await Promise.allSettled(keyList.map((key) => trigger(key)))).every(
        (f) => f.status === "fulfilled" && !!f.value,
      );

      setTabsState((prevState) => {
        return {
          ...prevState,
          [tab]: {
            status: isValid ? "valid" : "invalid",
          },
        };
      });

      if (!isValid) return;

      callback?.();
    }, []);

    // const handleChangeTab = useCallback(
    //   (_: React.SyntheticEvent, newTab: TabKeyType) =>
    //     validateCurrentTabBeforeProceed(currentTab, () => {
    //       setCurrentTab((oldTab) => {
    //         const nextTab = TAB_NODES_MANAGE_COURSE.get(oldTab)?.next;
    //         const prevTab = TAB_NODES_MANAGE_COURSE.get(oldTab)?.prev;
    //         return newTab === nextTab || newTab === prevTab ? newTab : oldTab;
    //       });
    //     }),
    //   [currentTab],
    // );

    const handleChangeTab = useCallback(
      (_: React.SyntheticEvent, newTab: TabKeyType) => {
        setCurrentTab((oldTab) => {
          const nextTab = TAB_NODES_MANAGE_COURSE.get(oldTab)?.next;
          const prevTab = TAB_NODES_MANAGE_COURSE.get(oldTab)?.prev;
          return newTab === nextTab || newTab === prevTab ? newTab : oldTab;
        });
      },
      [currentTab],
    );
    /**
     * Next and back action each tab
     */
    const goNextOrBackStep = useCallback(
      (action: "next" | "back") => () =>
        validateCurrentTabBeforeProceed(currentTab, () => {
          startGotoNextTab(async () => {
            setCurrentTab((oldTab) => {
              const newTab =
                action === "next"
                  ? TAB_NODES_MANAGE_COURSE.get(oldTab)?.next
                  : TAB_NODES_MANAGE_COURSE.get(oldTab)?.prev;
              return newTab ? newTab : oldTab;
            });
            const scrollContainer = document.querySelector(".main-layout__content");
            scrollContainer?.scrollTo({ top: 0 });
          });
        }),
      [currentTab],
    );

    useImperativeHandle(ref, () => ({
      setTabStatus: (tabKey, status) => {
        setTabsState((oldState) => ({ ...oldState, [tabKey]: { status: status } }));
      },
    }));

    return (
      <div className={cn("class-room-tabs", className)}>
        <TabContext value={currentTab}>
          <div className="bg-white rounded-xl flex items-center justify-between mb-6 px-6 py-4">
            <ClassRoomTabList onChange={handleChangeTab}>
              {items.map(({ tabKey, tabName, icon }) => (
                <Tab
                  key={tabKey}
                  value={tabKey}
                  label={
                    <div className="flex items-center gap-1">
                      {tabsState[tabKey].status === "valid" ? <CheckCircleIcon /> : icon ? icon : null}
                      {tabName}
                    </div>
                  }
                  className={cn("px-0", {
                    "is-invalid": tabsState[tabKey].status === "invalid",
                    "is-valid": tabsState[tabKey].status === "valid",
                  })}
                />
              ))}
            </ClassRoomTabList>
            <div className="tab-actions">{actions}</div>
          </div>
          <div className="panels-wraper">
            {items.map((item) => (
              <TabPanel key={item.tabKey} value={item.tabKey} className="p-0">
                {item?.content}
              </TabPanel>
            ))}
            <div className={cn({ hidden: currentTab === "clsTab-setting" || currentTab === "clsTab-section" })}>
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
        </TabContext>
      </div>
    );
  },
);
export default UpsertCourseTabContainer;

const ClassRoomTabList = styled((props: TabListProps) => <TabList {...props} />)(() => {
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

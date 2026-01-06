"use client";

import React, { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";

import GamificationRulesTab from "../GamificationRulesTab";
import LeaderboardTab from "../LeaderboardTab";
import RankingsTab from "../RankingsTab";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`gamification-tabpanel-${index}`}
      aria-labelledby={`gamification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const GamificationContainer: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="gamification tabs">
          <Tab label="Cấu hình điểm thưởng" id="gamification-tab-0" sx={{ textTransform: "none" }} />
          <Tab label="Bảng xếp hạng" id="gamification-tab-1" sx={{ textTransform: "none" }} />
          <Tab label="Cấu hình danh hiệu" id="gamification-tab-2" sx={{ textTransform: "none" }} />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        <GamificationRulesTab />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <LeaderboardTab />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <RankingsTab />
      </TabPanel>
    </Box>
  );
};

export default GamificationContainer;

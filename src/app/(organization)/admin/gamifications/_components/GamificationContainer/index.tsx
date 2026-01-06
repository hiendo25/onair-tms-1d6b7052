"use client";

import React, { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";

import GamificationRulesTab from "../GamificationRulesTab";
import LeaderboardTab from "../LeaderboardTab";

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
          <Tab label="Bảng xếp hạng phòng" id="gamification-tab-1" sx={{ textTransform: "none" }} />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        <GamificationRulesTab />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <LeaderboardTab />
      </TabPanel>
    </Box>
  );
};

export default GamificationContainer;

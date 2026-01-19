"use client";
import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Typography,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useClassRoomStore } from "@/modules/class-room-management/store/class-room-context";
import { StudentSelectedItem } from "@/modules/class-room-management/store/class-room-store";
import StudentDataTransfer, { StudentDataTransferProps } from "@/modules/student/container/StudentsDataTransfer";
import { Download01Icon } from "@/shared/assets/icons";

import CertificateSelection from "./CertificateSelection";

const TabClassRoomSetting = () => {
  const setStudents = useClassRoomStore((state) => state.actions.setSelectedStudents);
  const selectedStudents = useClassRoomStore((state) => state.state.selectedStudents);

  const [expandedAccordion, setExpandedAccordion] = useState<string | false>("students");

  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const handleSelect: StudentDataTransferProps["onChange"] = (employees) => {
    const students = employees.map<StudentSelectedItem>((item) => ({
      id: item.id,
      avatar: item.avatar,
      email: item.email,
      employeeType: item.employeeType,
      employeeCode: item.employeeCode,
      fullName: item.fullName,
    }));
    setStudents(students);
  };

  return (
    <div className="setting-container">
      {/* Students Accordion */}
      <Accordion
        expanded={expandedAccordion === "students"}
        onChange={handleAccordionChange("students")}
        sx={{
          mb: 2,
          borderRadius: "8px !important",
          "&:before": {
            display: "none",
          },
          "&.Mui-expanded": {
            margin: "0 0 16px 0",
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="students-content"
          id="students-header"
          sx={{
            borderRadius: "8px",
            "&.Mui-expanded": {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          }}
        >
          <Typography component="h3" sx={{ fontSize: "16px", fontWeight: "bold" }}>
            Thêm học viên <span className="text-red-600">*</span>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="outlined" startIcon={<Download01Icon />} size="small">
              Import
            </Button>
          </Box>
          <StudentDataTransfer selectedItems={selectedStudents} onChange={handleSelect} />
        </AccordionDetails>
      </Accordion>

      {/* Certificate Accordion */}
      <Accordion
        expanded={expandedAccordion === "certificate"}
        onChange={handleAccordionChange("certificate")}
        sx={{
          borderRadius: "8px !important",
          "&:before": {
            display: "none",
          },
          "&.Mui-expanded": {
            margin: 0,
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="certificate-content"
          id="certificate-header"
          sx={{
            borderRadius: "8px",
            "&.Mui-expanded": {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          }}
        >
          <Typography component="h3" sx={{ fontSize: "16px", fontWeight: "bold" }}>
            Chứng nhận
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <CertificateSelection />
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
export default TabClassRoomSetting;

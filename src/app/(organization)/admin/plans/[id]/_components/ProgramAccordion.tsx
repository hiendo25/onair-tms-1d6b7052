"use client";

import * as React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ProgramDetail } from "../../_components/mock-data";

interface ProgramAccordionProps {
  programs: ProgramDetail[];
  programsCount: number;
}

export default function ProgramAccordion({
  programs,
  programsCount,
}: ProgramAccordionProps) {
  return (
    <Card sx={{ mb: 3, bgcolor: "white" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Chi tiết kế hoạch đào tạo{" "}
          <Typography component="span" variant="body2" color="text.secondary">
            ({programsCount} chương trình)
          </Typography>
        </Typography>

        <Stack spacing={2}>
          {programs.map((program, index) => (
            <Accordion
              key={program.id}
              sx={{
                bgcolor: "rgba(0, 80, 255, 0.12)",
                "&:before": { display: "none" },
                boxShadow: "none",
                border: "1px solid rgba(145, 158, 171, 0.40)",
                borderRadius: "8px",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#000" }} />}
                sx={{
                  minHeight: "auto",
                  "&:hover": {
                    bgcolor: "rgba(0, 80, 255, 0.12)",
                  },
                  "& .MuiAccordionSummary-content": {
                    my: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  },
                }}
              >
                <Box>
                  <Chip
                    label={`Chương trình ${index + 1}`}
                    size="small"
                    color="primary"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#000", mb: 0.5 }}>
                    {program.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                    {program.startDate} - {program.endDate}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: "white", borderTop: "1px solid #e0e0e0", pt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Nội dung chương trình sẽ được hiển thị ở đây
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}


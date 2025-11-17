import React from "react";

import { styled } from "@mui/material";
import MuiAccordion, { AccordionProps, accordionClasses } from "@mui/material/Accordion";
import MuiAccordionSummary, { AccordionSummaryProps, accordionSummaryClasses } from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import { ChevronDownIcon } from "@/shared/assets/icons";

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
  ({ theme }) => ({
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&::before": {
      display: "none",
    },
    [`&.${accordionClasses.root}`]: {
      marginBottom: "0 !important",
      border: "none",
      boxShadow: "none",
      padding: 0,
    },
  }),
);

const AccordionSummary = styled(
  ({ onToggleExpand, ...props }: AccordionSummaryProps & { onToggleExpand: () => void }) => (
    <MuiAccordionSummary
      disableRipple
      expandIcon={<ChevronDownIcon className="w-4 h-4" onClick={onToggleExpand} />}
      {...props}
    />
  ),
)(({ theme }) => ({
  backgroundColor: "white",
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]: {
    transform: "rotate(180deg)",
  },
  [`& .${accordionSummaryClasses.content}`]: {
    margin: "0 !important",
    marginTop: "0 !important",
    marginBottom: "0 !important",
    cursor: "auto",
  },
  "&.Mui-focusVisible": {
    backgroundColor: "white",
  },
  [`&.${accordionSummaryClasses.root}`]: {
    gap: "12px !important",
    padding: "0 4px",
    "&:hover": {
      backgroundColor: "transparent",
    },

    [`@media(max-width: 1024px)`]: {
      padding: "0 4px",
    },
  },
  ...theme.applyStyles("dark", {
    backgroundColor: "rgba(255, 255, 255, .05)",
  }),
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: "4px 4px 4px",
  [`@media(max-width: 1024px)`]: {
    padding: "4px 4px 4px",
  },
}));

export { AccordionSummary, AccordionDetails, Accordion };

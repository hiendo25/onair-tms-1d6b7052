import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Stack, Typography } from "@mui/material";

interface SortablePhaseItemProps {
  id: string;
  phaseNumber: number;
  classRoomCount: number;
  expanded: boolean;
  hasError?: boolean;
  onExpandChange: (expanded: boolean) => void;
  onDelete: () => void;
  children: React.ReactNode;
}

const SortablePhaseItem: React.FC<SortablePhaseItemProps> = ({
  id,
  phaseNumber,
  classRoomCount,
  expanded,
  hasError,
  onExpandChange,
  onDelete,
  children,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Accordion
        expanded={expanded}
        onChange={(_, isExpanded) => onExpandChange(isExpanded)}
        sx={{
          border: "1px solid",
          borderColor: hasError ? "error.main" : "divider",
          bgcolor: "grey.50",
          "&:before": {
            display: "none", // Remove default MUI divider
          },
          boxShadow: "none",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            "& .MuiAccordionSummary-content": {
              margin: "12px 0",
              alignItems: "center",
            },
            "& .MuiAccordionSummary-expandIconWrapper": {
              marginRight: 1,
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, pr: 2 }}>
            {/* Drag Handle */}
            <Box
              {...attributes}
              {...listeners}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "grab",
                color: "text.secondary",
                "&:active": {
                  cursor: "grabbing",
                },
                "&:hover": {
                  color: "primary.main",
                },
              }}
              onClick={(e) => e.stopPropagation()} // Prevent accordion toggle when clicking drag handle
            >
              <DragIndicatorIcon />
            </Box>

            {/* Phase Title */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
              Giai đoạn {phaseNumber}
            </Typography>

            {/* Class-room Count Indicator */}
            {classRoomCount > 0 && (
              <Chip
                label={`${classRoomCount} lớp học`}
                size="small"
                color="default"
                variant="outlined"
                sx={{ fontWeight: 500, borderColor: "darkgray" }}
              />
            )}

            {/* Delete Button */}
            <Box
              onClick={(e) => {
                e.stopPropagation(); // Prevent accordion toggle
                onDelete();
              }}
              onKeyDown={(e) => {
                // Handle keyboard accessibility (Enter and Space)
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Xóa giai đoạn"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                borderRadius: 1,
                p: 1.5,
                cursor: "pointer",
                color: "grey.600",
                transition: "background-color 0.2s",
                border: "1px solid",
                borderColor: "grey.500",
              }}
            >
              <DeleteIcon fontSize="small" />
            </Box>
          </Stack>
        </AccordionSummary>

        <AccordionDetails sx={{ pt: 0, pb: 3 }}>
          {children}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default memo(SortablePhaseItem);


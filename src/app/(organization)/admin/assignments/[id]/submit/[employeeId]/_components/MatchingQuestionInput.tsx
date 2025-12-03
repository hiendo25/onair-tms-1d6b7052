"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  FormLabel,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";

interface MatchingQuestionInputProps {
  columnAItems: Array<{ id: string; content: string }>;
  columnBItems: Array<{ id: string; content: string }>;
  mappings: Array<{ columnAId: string; columnBId: string }>;
  onMappingsChange: (mappings: Array<{ columnAId: string; columnBId: string }>) => void;
}

const MatchingQuestionInput: React.FC<MatchingQuestionInputProps> = ({
  columnAItems,
  columnBItems,
  mappings,
  onMappingsChange,
}) => {
  // Shuffle Column B items on mount (only once)
  const shuffledColumnBItems = useMemo(() => {
    const items = [...columnBItems];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }, [columnBItems]);

  const handleMappingChange = (columnAId: string, columnBId: string) => {
    // Remove existing mapping for this columnAId
    const updatedMappings = mappings.filter((m) => m.columnAId !== columnAId);

    // Add new mapping if a valid columnBId is selected
    if (columnBId) {
      updatedMappings.push({ columnAId, columnBId });
    }

    onMappingsChange(updatedMappings);
  };

  const getSelectedColumnBId = (columnAId: string): string => {
    const mapping = mappings.find((m) => m.columnAId === columnAId);
    return mapping?.columnBId || "";
  };

  return (
    <Box>
      <FormLabel sx={{ mb: 1.5, display: "block", fontSize: "0.875rem" }}>
        Ghép đôi các mục <span style={{ color: "red" }}>*</span>
      </FormLabel>

      <Stack spacing={2}>
        {columnAItems.map((itemA) => {
          const selectedColumnBId = getSelectedColumnBId(itemA.id);

          return (
            <Paper
              key={itemA.id}
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: "background.paper",
              }}
            >
              <Stack spacing={1.5}>
                {/* Column A Item */}
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {itemA.content}
                </Typography>

                {/* Dropdown to select Column B item */}
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedColumnBId}
                    onChange={(e) => handleMappingChange(itemA.id, e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>-- Chọn đáp án --</em>
                    </MenuItem>
                    {shuffledColumnBItems.map((itemB) => (
                      <MenuItem key={itemB.id} value={itemB.id}>
                        {itemB.content}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      {/* Helper text */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
        Chọn đáp án phù hợp cho mỗi mục
      </Typography>
    </Box>
  );
};

export default MatchingQuestionInput;


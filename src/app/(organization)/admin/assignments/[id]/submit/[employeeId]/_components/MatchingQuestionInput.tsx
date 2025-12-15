"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  FormLabel,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedColumnAId, setSelectedColumnAId] = useState<string | null>(null);
  const [, setForceUpdate] = useState(0);

  // Force re-render to update connection lines when mappings change
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceUpdate((prev) => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, [mappings]);

  const handleColumnAClick = (itemId: string) => {
    if (selectedColumnAId === itemId) {
      // Deselect if clicking the same item
      setSelectedColumnAId(null);
    } else {
      setSelectedColumnAId(itemId);
    }
  };

  const handleColumnBClick = (itemId: string) => {
    if (!selectedColumnAId) return;

    // Check if this Column A item already has a mapping
    const existingMappingIndex = mappings.findIndex(
      (m) => m.columnAId === selectedColumnAId
    );

    let newMappings: Array<{ columnAId: string; columnBId: string }>;

    if (existingMappingIndex >= 0) {
      const existingMapping = mappings[existingMappingIndex];

      // If clicking the same Column B item, remove the mapping
      if (existingMapping.columnBId === itemId) {
        newMappings = mappings.filter((_, idx) => idx !== existingMappingIndex);
      } else {
        // Update existing mapping to new Column B item
        newMappings = mappings.map((m, idx) =>
          idx === existingMappingIndex ? { columnAId: selectedColumnAId, columnBId: itemId } : m
        );
      }
    } else {
      // Add new mapping
      newMappings = [...mappings, { columnAId: selectedColumnAId, columnBId: itemId }];
    }

    onMappingsChange(newMappings);
    setSelectedColumnAId(null);
  };

  const getItemPosition = (itemId: string, column: "A" | "B") => {
    const element = document.getElementById(`${column}-${itemId}`);
    const container = containerRef.current;
    if (!element || !container) return null;

    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return {
      x: elementRect.left - containerRect.left + (column === "A" ? elementRect.width : 0),
      y: elementRect.top - containerRect.top + elementRect.height / 2,
    };
  };

  const getMappedColumnBId = (columnAId: string): string | null => {
    const mapping = mappings.find((m) => m.columnAId === columnAId);
    return mapping ? mapping.columnBId : null;
  };

  const isColumnBMapped = (columnBId: string): boolean => {
    return mappings.some((m) => m.columnBId === columnBId);
  };

  const renderConnections = () => {
    if (!containerRef.current) return null;

    const lines = mappings.map((mapping) => {
      const startPos = getItemPosition(mapping.columnAId, "A");
      const endPos = getItemPosition(mapping.columnBId, "B");

      if (!startPos || !endPos) return null;

      return (
        <line
          key={`${mapping.columnAId}-${mapping.columnBId}`}
          x1={startPos.x}
          y1={startPos.y}
          x2={endPos.x}
          y2={endPos.y}
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
    });

    return (
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {lines}
      </svg>
    );
  };

  return (
    <Box>
      <FormLabel sx={{ mb: 1.5, display: "block", fontSize: "0.875rem" }}>
        Ghép đôi các mục <span style={{ color: "red" }}>*</span>
      </FormLabel>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
        Nhấp vào mục ở cột A, sau đó nhấp vào mục ở cột B để tạo kết nối. Nhấp lại vào mục đã kết nối để xóa kết nối.
      </Typography>

      <Box
        ref={containerRef}
        sx={{
          position: "relative",
          minHeight: "200px",
        }}
      >
        {renderConnections()}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 4,
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Column A */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
              Cột A
            </Typography>
            {columnAItems.map((item, index) => {
              const isSelected = selectedColumnAId === item.id;
              const isMapped = getMappedColumnBId(item.id) !== null;

              return (
                <Paper
                  key={item.id}
                  id={`A-${item.id}`}
                  onClick={() => handleColumnAClick(item.id)}
                  sx={{
                    p: 1.5,
                    border: 2,
                    borderColor: isSelected
                      ? "primary.main"
                      : isMapped
                      ? "success.light"
                      : "grey.300",
                    backgroundColor: isSelected
                      ? "primary.50"
                      : isMapped
                      ? "success.50"
                      : "background.paper",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: isSelected ? "primary.main" : "grey.400",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: "24px" }}>
                      {index + 1}.
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.5 }}>
                      {item.content}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>

          {/* Column B */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
              Cột B
            </Typography>
            {columnBItems.map((item, index) => {
              const isMapped = isColumnBMapped(item.id);

              return (
                <Paper
                  key={item.id}
                  id={`B-${item.id}`}
                  onClick={() => handleColumnBClick(item.id)}
                  sx={{
                    p: 1.5,
                    border: 2,
                    borderColor: isMapped ? "success.light" : "grey.300",
                    backgroundColor: isMapped ? "success.50" : "background.paper",
                    cursor: selectedColumnAId ? "pointer" : "default",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: selectedColumnAId ? "primary.light" : isMapped ? "success.light" : "grey.300",
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                    {item.content}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MatchingQuestionInput;


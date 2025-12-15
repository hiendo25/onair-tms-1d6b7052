"use client";
import React, { memo, useState, useRef, useEffect } from "react";
import { Button, FormLabel, IconButton, TextField, Typography } from "@mui/material";
import { TrashIcon1 } from "@/shared/assets/icons";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import { v4 as uuidv4 } from "uuid";
import { type MatchingQuestionData, type MatchingColumnItem, type MatchingMapping } from "../../../assignment-form.schema";

interface MatchingQuestionEditorProps {
  matchingData: MatchingQuestionData;
  onChange: (data: MatchingQuestionData) => void;
}

const MatchingQuestionEditor: React.FC<MatchingQuestionEditorProps> = ({ matchingData, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedColumnAId, setSelectedColumnAId] = useState<string | null>(null);
  const [, setForceUpdate] = useState(0);

  const { columnAItems, columnBItems, correctMappings } = matchingData;

  // Force re-render to update connection lines when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceUpdate((prev) => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, [matchingData]);

  const handleAddItems = () => {
    const newColumnAItem: MatchingColumnItem = {
      id: uuidv4(),
      content: "",
    };
    const newColumnBItem: MatchingColumnItem = {
      id: uuidv4(),
      content: "",
    };

    onChange({
      columnAItems: [...columnAItems, newColumnAItem],
      columnBItems: [...columnBItems, newColumnBItem],
      correctMappings: [...correctMappings],
    });
  };

  const handleRemoveItem = (index: number) => {
    const itemAId = columnAItems[index].id;
    const itemBId = columnBItems[index].id;

    const newColumnAItems = columnAItems.filter((_, idx) => idx !== index);
    const newColumnBItems = columnBItems.filter((_, idx) => idx !== index);
    const newMappings = correctMappings.filter(
      (mapping) => mapping.columnAId !== itemAId && mapping.columnBId !== itemBId
    );

    onChange({
      columnAItems: newColumnAItems,
      columnBItems: newColumnBItems,
      correctMappings: newMappings,
    });
  };

  const handleColumnAChange = (itemId: string, value: string) => {
    const newColumnAItems = columnAItems.map((item) =>
      item.id === itemId ? { ...item, content: value } : item
    );
    onChange({
      ...matchingData,
      columnAItems: newColumnAItems,
    });
  };

  const handleColumnBChange = (itemId: string, value: string) => {
    const newColumnBItems = columnBItems.map((item) =>
      item.id === itemId ? { ...item, content: value } : item
    );
    onChange({
      ...matchingData,
      columnBItems: newColumnBItems,
    });
  };

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
    const existingMappingIndex = correctMappings.findIndex(
      (m) => m.columnAId === selectedColumnAId
    );

    let newMappings: MatchingMapping[];

    if (existingMappingIndex >= 0) {
      // Update existing mapping
      newMappings = correctMappings.map((m, idx) =>
        idx === existingMappingIndex ? { columnAId: selectedColumnAId, columnBId: itemId } : m
      );
    } else {
      // Add new mapping
      newMappings = [...correctMappings, { columnAId: selectedColumnAId, columnBId: itemId }];
    }

    onChange({
      ...matchingData,
      correctMappings: newMappings,
    });

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
    const mapping = correctMappings.find((m) => m.columnAId === columnAId);
    return mapping ? mapping.columnBId : null;
  };

  const isColumnBMapped = (columnBId: string): boolean => {
    return correctMappings.some((m) => m.columnBId === columnBId);
  };

  const renderConnections = () => {
    if (!containerRef.current) return null;

    const lines = correctMappings.map((mapping) => {
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
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {lines}
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <FormLabel className="text-sm">
        Các cặp ghép đôi <span className="text-red-500">*</span>
      </FormLabel>
      <Typography className="text-xs text-gray-600">
        Nhập nội dung cho hai cột. Nhấp vào mục ở cột A, sau đó nhấp vào mục ở cột B để tạo kết nối.
      </Typography>

      <div ref={containerRef} className="relative min-h-[200px]">
        {renderConnections()}

        <div className="grid grid-cols-2 gap-8 relative" style={{ zIndex: 2 }}>
          {/* Column A */}
          <div className="flex flex-col gap-3">
            <Typography className="text-sm font-semibold text-gray-700">Cột A</Typography>
            {columnAItems.map((item, index) => {
              const isSelected = selectedColumnAId === item.id;
              const isMapped = getMappedColumnBId(item.id) !== null;

              return (
                <div
                  key={item.id}
                  id={`A-${item.id}`}
                  className={`flex items-start gap-2 p-2 rounded-lg border-2 transition-colors cursor-pointer ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : isMapped
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleColumnAClick(item.id)}
                >
                  <Typography className="text-sm font-medium text-gray-700 mt-2 min-w-[20px]">
                    {index + 1}.
                  </Typography>
                  <TextField
                    value={item.content}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleColumnAChange(item.id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Nhập nội dung"
                    size="small"
                    className="flex-1"
                  />
                </div>
              );
            })}
          </div>

          {/* Column B */}
          <div className="flex flex-col gap-3">
            <Typography className="text-sm font-semibold text-gray-700">Cột B</Typography>
            {columnBItems.map((item, index) => {
              const isMapped = isColumnBMapped(item.id);

              return (
                <div
                  key={item.id}
                  id={`B-${item.id}`}
                  className={`flex items-start gap-2 p-2 rounded-lg border-2 transition-colors ${
                    selectedColumnAId
                      ? "cursor-pointer hover:border-blue-400"
                      : ""
                  } ${
                    isMapped
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleColumnBClick(item.id)}
                >
                  <TextField
                    value={item.content}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleColumnBChange(item.id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Nhập nội dung"
                    size="small"
                    className="flex-1"
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(index);
                    }}
                    disabled={columnAItems.length === 1}
                    className="mt-1"
                  >
                    <TrashIcon1 className="w-4 h-4" />
                  </IconButton>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Button
        onClick={handleAddItems}
        startIcon={<PlusIcon />}
        variant="outlined"
        size="small"
        className="self-start"
      >
        Thêm mục
      </Button>
    </div>
  );
};

export default memo(MatchingQuestionEditor);


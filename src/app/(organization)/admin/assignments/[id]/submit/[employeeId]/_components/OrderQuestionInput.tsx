"use client";

import React from "react";
import { Box, Paper, Typography, Stack } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface OrderItem {
  id: string;
  content: string;
  correctOrder: number;
}

interface OrderQuestionInputProps {
  items: OrderItem[];
  orderedItems: Array<{ id: string; position: number }>;
  onOrderChange: (orderedItems: Array<{ id: string; position: number }>) => void;
}

interface SortableItemProps {
  item: OrderItem;
  index: number;
  isDragging?: boolean;
}

function SortableItem({ item, index, isDragging = false }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={0}
      sx={{
        px: 1.5,
        py: 1,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        border: "1px solid",
        borderColor: isDragging || isSortableDragging ? "primary.main" : "divider",
        bgcolor: isDragging || isSortableDragging ? "action.hover" : "background.paper",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
        borderRadius: 1,
        transition: "border-color 0.2s, background-color 0.2s",
        "&:hover": {
          borderColor: "primary.light",
        },
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: isDragging ? "grabbing" : "grab",
          color: "text.disabled",
          "&:hover": {
            color: "primary.main",
          },
        }}
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>
      <Box
        sx={{
          minWidth: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          fontSize: "0.875rem",
        }}
      >
        {index + 1}
      </Box>
      <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.5 }}>
        {item.content}
      </Typography>
    </Paper>
  );
}

export default function OrderQuestionInput({
  items,
  orderedItems,
  onOrderChange,
}: OrderQuestionInputProps) {
  // Shuffle items on first render if orderedItems is empty
  const [shuffledItems, setShuffledItems] = React.useState<OrderItem[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (orderedItems.length === 0) {
      // Fisher-Yates shuffle algorithm
      const shuffled = [...items];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setShuffledItems(shuffled);

      // Initialize orderedItems with shuffled positions
      const initialOrder = shuffled.map((item, index) => ({
        id: item.id,
        position: index + 1,
      }));
      onOrderChange(initialOrder);
    } else {
      // Reconstruct the order from orderedItems
      const sortedItems = [...items].sort((a, b) => {
        const posA = orderedItems.find(oi => oi.id === a.id)?.position || 0;
        const posB = orderedItems.find(oi => oi.id === b.id)?.position || 0;
        return posA - posB;
      });
      setShuffledItems(sortedItems);
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = shuffledItems.findIndex((item) => item.id === active.id);
      const newIndex = shuffledItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(shuffledItems, oldIndex, newIndex);
      setShuffledItems(newItems);

      // Update orderedItems
      const newOrderedItems = newItems.map((item, idx) => ({
        id: item.id,
        position: idx + 1,
      }));
      onOrderChange(newOrderedItems);
    }

    setActiveId(null);
  };

  const activeItem = shuffledItems.find((item) => item.id === activeId);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: "0.875rem" }}>
        Kéo và thả các mục để sắp xếp theo thứ tự đúng
      </Typography>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={shuffledItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <Stack spacing={0.75}>
            {shuffledItems.map((item, index) => (
              <SortableItem key={item.id} item={item} index={index} />
            ))}
          </Stack>
        </SortableContext>
        <DragOverlay>
          {activeItem ? (
            <SortableItem
              item={activeItem}
              index={shuffledItems.findIndex((item) => item.id === activeId)}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </Box>
  );
}


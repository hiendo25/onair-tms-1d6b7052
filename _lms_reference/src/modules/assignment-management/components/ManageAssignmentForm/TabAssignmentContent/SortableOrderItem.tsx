import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconButton } from "@mui/material";

import { Dot2RowVerticalIcon } from "@/shared/assets/icons";
import { cn } from "@/utils";

interface SortableOrderItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableOrderItem: React.FC<SortableOrderItemProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={style}
      className={cn("border border-transparent rounded-lg overflow-hidden", {
        "border-dashed border-gray-300": isDragging,
        "border-solid": !isDragging,
      })}
    >
      <div
        className={cn("flex gap-2 items-start", {
          "opacity-50": isDragging,
        })}
      >
        <IconButton className="w-fit bg-transparent text-blue-600 p-1 h-auto mt-2" disableRipple {...listeners}>
          <Dot2RowVerticalIcon className="w-4 h-4" />
        </IconButton>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

export default memo(SortableOrderItem);


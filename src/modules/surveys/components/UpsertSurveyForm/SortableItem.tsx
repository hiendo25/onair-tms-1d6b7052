import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconButton } from "@mui/material";

import { Dot2RowVerticalIcon } from "@/shared/assets/icons";
import { cn } from "@/utils";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  padding?: 4 | 3 | 2;
  noBorder?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children, padding = 4, noBorder = false }) => {
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
      className={cn("border rounded-lg overflow-hidden", {
        "border-dashed border-gray-300": isDragging,
        "border-transparent": !isDragging,
      })}
    >
      <div
        className={cn("flex justify-start gap-4 bg-white  rounded-lg items-start", {
          "opacity-0": isDragging,
          "p-4": padding === 4,
          "p-3": padding === 3,
          "p-2": padding === 2,
          "border border-gray-200": !noBorder,
        })}
      >
        <IconButton className="w-fit bg-transparent text-blue-600 p-1 mt-1.5 h-auto" disableRipple {...listeners}>
          <Dot2RowVerticalIcon className="w-4 h-4" />
        </IconButton>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

export default memo(SortableItem);

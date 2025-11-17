import React, { memo, PropsWithChildren } from "react";
import { Box, IconButton } from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/utils";
import { Dot2RowVerticalIcon } from "@/shared/assets/icons";

interface SortableLessionItemProps extends PropsWithChildren {
  id: string;
  isActive?: boolean;
  subLabel?: React.ReactNode;
  isError?: boolean;
}
const SortableLessionItem: React.FC<SortableLessionItemProps> = ({ id, children, isActive, subLabel, isError }) => {
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
        className={cn("flex flex-1", {
          "opacity-0": isDragging,
          "bg-gray-100": !isActive,
          "bg-blue-100": isActive && !isError,
          "bg-red-100": isError,
        })}
      >
        <IconButton className="w-fit bg-transparent text-blue-600 p-1" disableRipple {...listeners}>
          <Dot2RowVerticalIcon className="w-4 h-4" />
        </IconButton>
        <div className="lesson-item px-2 py-1 flex-1">
          {subLabel}
          {children}
        </div>
      </div>
    </div>
  );
};
export default memo(SortableLessionItem);

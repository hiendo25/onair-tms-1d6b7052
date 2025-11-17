import React, { memo, PropsWithChildren } from "react";
import { IconButton, Typography } from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/utils";
import { Dot2RowVerticalIcon } from "@/shared/assets/icons";

interface SortableSectionProps extends PropsWithChildren {
  id: string;
  label?: React.ReactNode;
  subLabel?: string;
  isActive?: boolean;
  isError?: boolean;
}
const SortableSection: React.FC<SortableSectionProps> = ({ id, children, subLabel, isActive, isError }) => {
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
      className={cn("border border-transparent rounded-xl overflow-hidden", {
        "border-blue-600": isActive,
        "border-dashed border-gray-300": isDragging,
        "border-solid": !isDragging,
        "border-red-600": isError && !isDragging,
      })}
    >
      <div
        className={cn("flex gap-2 bg-white p-3", {
          "opacity-0": isDragging,
        })}
      >
        <div className="flex flex-col gap-2 items-center">
          <IconButton className="w-fit bg-transparent text-blue-600 p-1 h-auto" disableRipple {...listeners}>
            <Dot2RowVerticalIcon className="w-4 h-4" />
          </IconButton>
          {subLabel ? (
            <Typography
              sx={(theme) => ({
                width: "32px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                backgroundColor: theme.palette.secondary.main,
                color: "white",
                fontSize: "0.75rem",
                fontWeight: "bold",
              })}
            >
              {subLabel}
            </Typography>
          ) : null}
        </div>
        <div className="flex-1 section-sortable-content">{children}</div>
      </div>
    </div>
  );
};
export default memo(SortableSection);

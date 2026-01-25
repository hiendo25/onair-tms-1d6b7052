import React from "react";
import { Box } from "@mui/material";

import { cn } from "@/utils";
import { EmptyBoxIcon } from "../assets/icons";

interface EmptyDataProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  iconSize?: "small" | "medium" | "large";
  align?: "center" | "left" | "right";
}
const EmptyData: React.FC<EmptyDataProps> = ({
  title,
  description,
  className,
  iconSize = "medium",
  align = "center",
  icon,
}) => {
  return (
    <div className={cn("empty-box", className)}>
      <div
        className={cn("w-fit text-center flex flex-col justify-center items-center gap-2", {
          "mx-auto": align === "center",
        })}
      >
        {icon ?? (
          <EmptyBoxIcon
            className={cn({
              "w-20 h-20": iconSize === "small",
              "w-28 h-28": iconSize === "medium",
              "w-36 h-36": iconSize === "large",
            })}
          />
        )}
        <div className="empty-box-content">
          {typeof title === "string" ? (
            <Box component="div" sx={{ fontWeight: "bold", mb: 1 }}>
              {title}
            </Box>
          ) : (
            title
          )}
          {typeof description === "string" ? (
            <Box component="div" className="text-gray-500 text-sm">
              {description}
            </Box>
          ) : (
            description
          )}
        </div>
      </div>
    </div>
  );
};
export default EmptyData;
